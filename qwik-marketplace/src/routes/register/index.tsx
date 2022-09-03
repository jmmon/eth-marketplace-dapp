import {
	$,
	component$,
	mutable,
	useClientEffect$,
	useRef,
	useStore,
	useWatch$,
} from "@builder.io/qwik";
import { RequestHandler } from "@builder.io/qwik-city";
import { read } from "fs";
import { create } from "ipfs-http-client";
import { CID } from "ipfs-http-client";

import Web3 from "web3";
import { ethers } from "ethers";


import { CONTRACT } from "~/libs/ethUtils";
import { Notification } from "../../components/notification/notification";


// generating notifications
export const types = ["error", "warning", "success", ""];
export const loremSplit = "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Labore voluptatum, magni, eius error accusantium aliquid voluptatibus commodi at adipisci culpa consectetur vel perferendis cupiditate ullam! Id debitis sint voluptate a repellendus nihil, consectetur quas unde accusantium perspiciatis explicabo ratione reprehenderit dolores blanditiis dignissimos totam, enim praesentium quos obcaecati aliquam aliquid labore laudantium illum! Autem porro impedit cum, laborum qui quibusdam aliquid, praesentium vel at velit molestiae officiis vero quos debitis. Ducimus cum voluptatum similique quasi quia. Aliquid dignissimos vel, corporis ullam distinctio adipisci? Temporibus aut maiores, ea placeat voluptatibus laboriosam quos neque asperiores illum vel laborum dolor perferendis corrupti atque!".split(' ');


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
			nextIndex: 0, // == "length" of "each" object
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
			const index = notifications.nextIndex;
			const thisNotification: INotificationEach = {
				message,
				type: type ?? "",
				id: index, // 1 more than last index is the new index for this notification
				timeout: timeout ?? 0,
			};
			// add it to our list, the rest should be handled by the notification?
			notifications.each[index] = thisNotification;
			notifications.nextIndex++;
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
			notifications.nextIndex = 0;
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


						// choose metamask injection as provider
						const provider = new ethers.providers.Web3Provider(window.ethereum);

						// check for accounts
						const accounts = await provider.send('eth_requestAccounts', []);
						const balance = ethers.utils.formatEther(await provider.getBalance(accounts[0]));

						addNotification(`Accounts connected: [0]:{${accounts[0]}: ${balance}eth}`, "success");

						// signer needed to sign txns / change state in contracts ?
						const signer = provider.getSigner();

						// connect to contract
						const marketplaceContract_ReadOnly = new ethers.Contract(CONTRACT.address, CONTRACT.abi, provider);

						const marketplaceContract_Signer = marketplaceContract_ReadOnly.connect(signer);

						const tx = await marketplaceContract_Signer.addItem(state.dataString, formDataObject.price);

						console.log('response from addItem:', {tx});
						const jsonTx = JSON.stringify(tx);
						// const formattedJson = jsonTx
						// 	.replace(/,\"/g, `,\n"`)
						// 	.replace(/{/g, `{\n`)
						// 	.replace(/}/g, `\n}`);
						// console.log(formattedJson);
						addNotification(`Add item successful!?:\n ${jsonTx}`, "success");

						

						
						// web3.eth.defaultAccount = accounts[0];
						// myContract
						// 	.addItem(state.dataString, formDataObject.price)
						// 	.then((txHash) => {
						// 		console.log("added! txHash:", txHash);
						// 		addNotification(`Item added! hash: ${txHash}`);
						// 	})
						// 	.catch((err) => {
						// 		console.log("Error adding item:", err);
						// 		addNotification(`Error adding item: ${err}`, "error", 10000);
						// 		return;
						// 	});
					} catch (e) {
						addNotification(`Error: ${e.message}`, "warning");
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

	const generateNotification = $(() => {

		const typeNum = Math.floor(Math.random() * 3);
		const loremNum = Math.floor(Math.random() * 99);
		const durationNum = Math.floor(Math.random() * 10) * 1000;


		const type = types[typeNum];
		console.log(`{dur: ${durationNum}, type: ${type}, lorem: ${ loremNum}}`);

		addNotification(loremSplit.slice(0, loremNum).join(' '), type, durationNum);		
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
				<button onClick$={generateNotification}>Create notification</button>
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
