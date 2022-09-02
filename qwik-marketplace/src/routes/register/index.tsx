import {
	$,
	component$,
	mutable,
	useClientEffect$,
	useRef,
	useStore,
	useWatch$,
} from "@builder.io/qwik";
import {RequestHandler} from "@builder.io/qwik-city";
import {read} from "fs";
import {create} from "ipfs-http-client";
// import { CID } from 'multiformats/cid';
import {CID} from "ipfs-http-client";
import {CONTRACT_ABI, CONTRACT_ADDRESS} from "~/libs/ethUtils";
import {Notification} from "../../components/notification/notification";

interface INotificationEach {
	message: string;
	type: string;
	id: number;
	timeout: number;
}
interface INotifications {
	each: INotificationEach[];
	currentIndex: number;
}


interface IState {
	isBrowser: boolean;
	price: number | undefined;
	imageString: string;
	dataString: string;
}

export function toHexString(byteArray: Uint8Array): string {
	return Array.prototype.map
		.call(byteArray, function (byte) {
			return ("0" + (byte & 0xff).toString(16)).slice(-2);
		})
		.join("");
}

export default component$(() => {
	const notifications = useStore<INotifications>(
		{
			each: {},
			currentIndex: 0,
		},
		{recursive: true}
	);
	useWatch$(({track}) => {
		track(notifications);
		console.log("WATCH:", notifications);
	});

	const state = useStore<IState>(
		{
			isBrowser: false,
			price: undefined,
			imageString: "",
			dataString: "",
		}
	);
	const photoInputRef = useRef();

	// Client/Server check
	useClientEffect$(() => {
		state.isBrowser = typeof window !== "undefined";
		console.log({isBrowser: state.isBrowser});
	});

	const addNotification = $(
		(message: string, type?: string, timeout?: number) => {
			const index = notifications.currentIndex;
			const thisNotification: INotificationEach = {
				message,
				type: type ?? "",
				id: index, // 1 more than last index is the new index for this notification
				timeout: timeout ?? 0,
			};
			// add it to our list, the rest should be handled by the notification?
			notifications.each[index] = thisNotification;
			notifications.currentIndex++;
		}
	);

	const removeNotification$ = $((id: number) => {
		// console.log("new remove notification $$$$, id:", id);
		// remaining notifications as [key, value] array
		const remainingAsMatrix = Object.entries(notifications.each).filter(
			([key, value]) => +key !== id
		);
		// console.log({remainingAsMatrix});

		if (remainingAsMatrix.length === 0) {
			// reset our store and currentIndex
			notifications.each = {};
			notifications.currentIndex = 0;
			return;
		}

		// build our new notifications object
		const newNotificationsObj = {};
		remainingAsMatrix.forEach(
			([key, value]) => (newNotificationsObj[+key] = value)
		);
		// console.log({newNotificationsObj});

		notifications.each = newNotificationsObj;
	});

	// simple form validation (not used yet)
	// const validate = $((form) => {
	// 	const errors = [];
	// 	if (form.name === "" || form.name === undefined) {
	// 		errors.push("Name must be provided");
	// 	}
	// 	if (form.price === "" || form.price === undefined || form.price < 0) {
	// 		errors.push("Price must be provided");
	// 	}
	// 	if (form.description === "" || form.description === undefined) {
	// 		errors.push("Description must be provided");
	// 	}
	// 	if (form.photo === "" || form.photo === undefined) {
	// 		errors.push("Photo must be provided");
	// 	}
	// 	if (errors.length === 0) return {valid: true, errors: undefined};
	// 	return {valid: false, errors};
	// });

	// old way to watch to submit form
	// useWatch$(async ({track}) => {
	// 	track(form, "submit");
	// 	if (!form.submit) return;

	// 	console.log("form submit detected");
	// 	const {valid, errors} = await validate(form);
	// 	if (errors !== undefined) {
	// 		console.log({errors});
	// 	}
	// 	const hash = await uploadToIPFS(form);
	// 	await attemptTransaction(hash);
	// 	form.submit = false;
	// });

	const handleSubmit = $(async (e) => {
		const formData = new FormData(e.target);
		console.log([...formData.entries()]);
		const ipfsOptions = {url: "http://127.0.0.1:5001"};
		const ipfs = create(ipfsOptions);

		//import buffer polyfill
		if (state.isBrowser) await import("~/libs/wzrdin_buffer_polyfill.js");

		// upload file
		const reader = new FileReader();

		reader.onloadend = async () => {
			const bufPhoto = state.isBrowser
				? window.buffer.Buffer(reader.result)
				: Buffer.from(reader.result);

			try {
				const {cid} = await ipfs.add(bufPhoto);
				state.imageString = cid.toString();
				// console.log("cid.toString()", cid.toString());

				addNotification(`Image upload successful!`, "success", 5000);
				addNotification(
					`Image file uploaded! Reference string: ${state.imageString}`
				);

				// continue to upload the whole data
				uploadItemData();
			} catch (err) {
				addNotification(`Image upload failed: ${err.message}`, "error");
			}
		};

		const uploadItemData = async () => {
			let formDataObject = {};
			[...formData.entries()]
				.filter(([key, value]) => key !== "photo")
				.forEach(([key, value]) => (formDataObject[key] = value));
			console.log({formDataObject});

			formDataObject["imgHash"] = state.imageString;
			console.log("final formDataObject:", formDataObject);

			const formDataJson = JSON.stringify(formDataObject);
			console.log("json version:", formDataJson);

			const bufData = state.isBrowser
				? window.buffer.Buffer(formDataJson)
				: Buffer.from(formDataJson);

			try {
				const {cid} = await ipfs.add(bufData);
				// console.log("cid.toString()", cid.toString());
				// some sort of error: set property of textarea#description: cannot set property because it only has a getter

				state.dataString = cid.toString();
				addNotification(`ItemData upload successful!`, "success", 5000);
				addNotification(`ItemData file reference string: ${state.dataString}`);

				if (state.isBrowser) {
					// check for metamask
					try {
						const accounts = await window.ethereum.request({
							method: "eth_requestAccounts",
						});
						// TODO: Prepare Eth transaction!
						const web3 = new Web3(window.ethereum);
						// const contract = require('web3-eth-contract');
						const myContract = new web3.eth.Contract(
							CONTRACT_ABI,
							CONTRACT_ADDRESS
						);

						web3.eth.defaultAccount = accounts[0];

						myContract
							.add(state.dataString, formDataObject.price)
							.then((txHash) => {
								console.log("added! txHash:", txHash);
								addNotification(`Item added! hash: ${txHash}`, "", 10000);
							})
							.catch((err) => {
								console.log("Error adding item:", err);
								addNotification(`Error adding item: ${err}`, "error", 10000);
								return;
							});
					} catch (e) {
						addNotification("Can't get metamask accounts!", "warning");
					}
				}
			} catch (err) {
				addNotification(`ItemData upload failed: ${err.message}`, "error");
			}
		};

		// start file read
		reader.readAsArrayBuffer(photoInputRef.current.files[0]);
		//alternately, could try pulling file from formData
	});

	return (
		<>
			<form
				class="flex flex-col w-full align-center"
				preventdefault:submit
				onSubmit$={(e) => handleSubmit(e)}
			>
				<h1 class="mx-auto text-lg">Add Item to Marketplace</h1>
				<label class="border rounded w-1/2 mx-auto my-4 p-4" for="price">
					Price
					<input
						name="price"
						class="block"
						type="text"
						placeholder="In wei..."
						id="price"
					/>
				</label>
				<label class="border rounded w-1/2 mx-auto my-4 p-4" for="name">
					Name
					<input
						name="name"
						class="block"
						type="text"
						placeholder="Name"
						id="name"
					/>
				</label>
				<label class="border rounded w-1/2 mx-auto my-4 p-4" for="description">
					Description
					<textarea
						name="description"
						rows="5"
						cols="40"
						type="text"
						placeholder="Description"
						id="description"
					></textarea>
				</label>
				<label class="border rounded w-1/2 mx-auto my-4 p-4" for="photo">
					Upload a Photo
					<input
						name="photo"
						class="block"
						type="file"
						id="photo"
						ref={photoInputRef}
					>
						Choose A File
					</input>
				</label>
				<button class="border rounded  mx-auto p-4 my-4">
					Add Item To Blockchain Marketplace
				</button>
			</form>
			<div class="grid grid-cols-1 gap-2">
				{Object.values(notifications.each).map((thisNotification) => (
					<Notification
						key={thisNotification.id}
						thisNotification={thisNotification}
						remove$={() => removeNotification$(thisNotification.id)}
					/>
				))}
			</div>
		</>
	);
});
