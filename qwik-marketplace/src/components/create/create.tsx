import {
	$,
	component$,
	useClientEffect$,
	useContext,
	useRef,
	useStore,
	useStyles$,
	useStylesScoped$,
} from "@builder.io/qwik";
import {SessionContext} from "~/libs/context";
import Styles from "./create.css";
import { read } from "fs";
import { create } from "ipfs-http-client";
import { CID } from "ipfs-http-client";



import { connect, getContract } from "~/libs/ethUtils";
import Notifications, { addNotification } from "~/components/notifications/notifications";

export default component$(() => {
	useStylesScoped$(Styles);
	const store = useStore({showCreate: false});
	const handleClick = $(() => {
		store.showCreate = !store.showCreate;
		console.log("now", store.showCreate);
	});
	const session = useContext(SessionContext);
	const photoInputRef = useRef();
	const state = useStore<IState>(
		{
			price: undefined,
			imageString: "",
			dataString: "",
		}
	);

	useClientEffect$(async () => {
		// import polyfill 
		await import("~/libs/wzrdin_buffer_polyfill.js");
	})

	const handleSubmit = $(async (e) => {
		const formData = new FormData(e.target);
		console.log([...formData.entries()]);
		const ipfsOptions = {url: "http://127.0.0.1:5001"};
		const ipfs = create(ipfsOptions);

		if (session.isBrowser) {
			const address = await connect();
			console.log('account connected:', address);
			addNotification(session, `Account connected: address linked:${address}`);
		}

		const contract = await getContract(true);

		// upload file
		const reader = new FileReader();

		reader.onloadend = async () => {
			const bufPhoto = session.isBrowser
				? window.buffer.Buffer(reader.result)
				: Buffer.from(reader.result);

			try {
				const {cid} = await ipfs.add(bufPhoto);
				state.imageString = cid.toString();
				// console.log("cid.toString()", cid.toString());
			console.log('image upload successful:', state.imageString);

				addNotification(session, `Image upload successful!`, "success", 5000);
				addNotification(session, 
					`Image file uploaded! Reference string: ${state.imageString}`
				);

				// continue to upload the whole data
				uploadItemData();
			} catch (err) {
				console.log('image upload error:', err.message);
				addNotification(session, `Image upload failed: ${err.message}`, "error");
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

			const bufData = session.isBrowser
				? window.buffer.Buffer(formDataJson)
				: Buffer.from(formDataJson);

			try {
				const {cid} = await ipfs.add(bufData);
				// console.log("cid.toString()", cid.toString());
				// some sort of error: set property of textarea#description: cannot set property because it only has a getter

				state.dataString = cid.toString();
				console.log('data upload successful:', state.dataString);
				addNotification(session, `ItemData upload successful!`, "success", 5000);
				addNotification(session, `ItemData file reference string: ${state.dataString}`);

				// interact with contract
				try {
					const receipt = await contract.addItem(state.dataString, formDataObject.price);

					console.log('response from addItem:', {receipt});
					const jsonTx = JSON.stringify(receipt);
					console.log('item added to dapp!:', jsonTx);
					addNotification(session, `Add item successful!?:\n ${jsonTx}`, "success");

				} catch (e) {
					addNotification(session, `Error: ${e.message}`, "warning");
				}

			} catch (err) {
				addNotification(session, `ItemData upload failed: ${err.message}`, "error");
			}
		};

		// start file read
		reader.readAsArrayBuffer(photoInputRef.current.files[0]);
		//alternately, could try pulling file from formData
	});

	

	// const handleCount = $(() => {
	// 	session.test++;
	// });
	
	return (
		<aside
			class={`create wrapper ${!session.address && "loggedOut"} ${
				store.showCreate && "showing"
			}`}
		>
				
			<div
				class={`create handle ${store.showCreate && "showing"}`}
				onClick$={handleClick}
			>
				{/* 2 */}
				{/* <div class={`create chevron ${store.showCreate && "close"}`}></div> */}
				<div class="create text">{store.showCreate ?  "/\\ ":  "\\/ " }Add An Item</div>
			</div>
			<div class={`create body ${store.showCreate && "showing"}`}>
				{/* 3 */}
				<form
					class="flex flex-col w-full items-stretch"
					preventdefault:submit
					onSubmit$={(e) => handleSubmit(e)}
				>
					<h1 class="mx-auto text-lg py-4">Add Item to Marketplace</h1>
					<label
						class="border rounded w-10/12 mx-auto my-3 px-2 pt-1 pb-2"
						for="price"
					>
						Price
						<input
							name="price"
							class="block"
							type="text"
							placeholder="In wei..."
							id="price"
						/>
					</label>
					<label
						class="border rounded w-10/12 mx-auto my-3 px-2 pt-1 pb-2"
						for="name"
					>
						Name
						<input
							name="name"
							class="block"
							type="text"
							placeholder="Name"
							id="name"
						/>
					</label>
					<label
						class="border rounded w-10/12 mx-auto my-3 px-2 pt-1 pb-2"
						for="description"
					>
						Description
						<textarea
							name="description"
							rows="5"
							cols="40"
							placeholder="Description"
							id="description"
						/>
					</label>
					<label
						class="border rounded w-10/12 mx-auto my-3 px-2 pt-1 pb-2"
						for="photo"
					>
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
			</div>
			<div class="create spacer"></div>
			{/* 4 */}
		</aside>
	);
});
