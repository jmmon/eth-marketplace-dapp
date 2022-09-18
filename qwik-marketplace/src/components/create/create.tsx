declare var window: any;
import {
	$,
	component$,
	useClientEffect$,
	useContext,
	useRef,
	useStore,
	useStyles$,
	useStylesScoped$,
	useWatch$,
} from "@builder.io/qwik";
import {SessionContext} from "~/libs/context";
import Styles from "./create.css";
import {read} from "fs";
import {create} from "ipfs-http-client";
import {CID} from "ipfs-http-client";

import {addItemToMarket, ETH_CONVERSION_RATIOS} from "~/libs/ethUtils";
import {
	Notifications,
	addNotification,
} from "~/components/notifications/notifications";

export const ipfsOptions = {url: "http://127.0.0.1:5001"};
export const ipfs = create(ipfsOptions);

export default component$(() => {
	useStylesScoped$(Styles);
	const store = useStore({showCreate: false} as {showCreate: boolean});
	const handleClick = $(() => {
		store.showCreate = !store.showCreate;
		console.log("now", store.showCreate);
	});
	const session = useContext(SessionContext);
	const photoInputRef = useRef<HTMLInputElement | undefined>();
	const state = useStore<ICreateFormState>({
		price: undefined,
		imageString: "",
		dataString: "",
	});

	useClientEffect$(() => {
		// import polyfill, adds window.buffer.Buffer() method
		import("~/libs/wzrdin_buffer_polyfill.js");
	});

	const handleSubmitForm = $(async (target: HTMLFormElement) => {

		const handleSubmitData = async () => {
			const formData = new FormData(target);

			let formDataObject: ICreateFormDataObject = {
				price: "",
				units: "",
				name: "",
				description: "",
				imgHash: "",
			};
			[...formData.entries()]
				.filter(([key, value]) => key !== "photo")
				.forEach(([key, value]) => (formDataObject[key] = value));
			console.log({formDataObject});

			const {units, price} = formDataObject;
			formDataObject.price = `${+price * ETH_CONVERSION_RATIOS[units]}`;

			formDataObject.imgHash = state.imageString;
			console.log("final formDataObject:", formDataObject);

			const formDataJson = JSON.stringify(formDataObject);
			const bufData = window.buffer.Buffer(formDataJson);

			try {
				const {cid} = await ipfs.add(bufData);

				state.dataString = cid.toString();
				console.log("data upload to IPFS successful:", state.dataString);
				addNotification(
					session,
					`ItemData upload successful! ${state.dataString}`,
					"success",
					5000
				);

				// TODO: display message: "Attempting transaction, please sign in metamask!"
				const {data, err} = await addItemToMarket(
					state,
					formDataObject,
					session
				);

				if (err === null) {
					// TODO: display message: "Success at adding item to marketplace! Thanks for participating!"
					addNotification(
						session,
						`Add item successful!?:\n ${data}`,
						"success"
					);
				} else {
					addNotification(session, `Error: ${err.message}`, "warning");
				}
			} catch (err) {
				addNotification(
					session,
					`ItemData upload failed: ${err.message}`,
					"error"
				);
			}
		};

		const handleUpload = async () => {
			const reader = new FileReader();

			reader.onloadend = async () => {
				const bufPhoto = window.buffer.Buffer(reader.result);

				try {
					const {cid} = await ipfs.add(bufPhoto);
					state.imageString = cid.toString();
					console.log("image upload successful:", state.imageString);

					addNotification(session, `Image upload successful!`, "success", 5000);
					addNotification(
						session,
						`Image file uploaded! Reference string: ${state.imageString}`
					);

					handleSubmitData();

				} catch (err) {
					console.log("image upload error:", err.message);
					addNotification(
						session,
						`Image upload failed: ${err.message}`,
						"error"
					);
				}
			};

			reader.readAsArrayBuffer(photoInputRef?.current?.files[0]);
		};
		
		handleUpload();
	});

	// need to add conversion: select option choosing which type the input will represent; some feedback while item is added to the marketplace; to notify that we are requesting a transaction; and when transaction is completed; and auto close like a redirect? with a notification down below! Need for force browse to refetch;
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
				<div class="create text">
					{store.showCreate ? "/\\ " : "\\/ "}Add An Item
				</div>
			</div>
			<div class={`create body ${store.showCreate && "showing"}`}>
				{/* 3 */}
				<form
					class="flex flex-col w-full items-stretch"
					preventdefault:submit
					onSubmit$={(e) => handleSubmitForm(e.target)}
				>
					<h1 class="mx-auto text-lg py-4">Add Item to Marketplace</h1>
					<fieldset class="border rounded w-[400px] mx-auto my-3 px-2 pt-1 pb-2 flex">
						<label class="w-9/12" for="price">
							Price
							<input
								name="price"
								class="block w-full"
								type="text"
								placeholder="...and select your units"
								id="price"
							/>
						</label>
						<label class="inline">
							Units
							<select name="units" class="block" id="units">
								<option value="eth">ETH</option>
								<option value="gwei">GWEI</option>
								<option value="wei">WEI</option>
							</select>
						</label>
					</fieldset>
					<fieldset class="border rounded w-[400px] mx-auto my-3 px-2 pt-1 pb-2">
						<label for="name">
							Name
							<input
								name="name"
								class="block w-full"
								type="text"
								placeholder="Name"
								id="name"
							/>
						</label>
					</fieldset>
					<fieldset class="border rounded w-[400px] mx-auto my-3 px-2 pt-1 pb-2">
						<label for="description">
							Description
							<textarea
								name="description"
								class="block w-full h-[200px]"
								placeholder="Description"
								id="description"
							/>
						</label>
					</fieldset>
					<fieldset class="border rounded w-[400px] mx-auto my-3 px-2 pt-1 pb-2">
						<label for="photo">
							Upload a Photo
							<input
								name="photo"
								class="block w-full"
								type="file"
								id="photo"
								ref={photoInputRef}
							>
								Choose A File
							</input>
						</label>
					</fieldset>
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
