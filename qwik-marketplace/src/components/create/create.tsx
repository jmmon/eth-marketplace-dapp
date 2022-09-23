declare var window: any;
import {
	$,
	component$,
	useClientEffect$,
	useContext,
	useRef,
	useStore,
} from "@builder.io/qwik";
import {SessionContext} from "~/libs/context";
import {create} from "ipfs-http-client";

import {addItemToMarket, convertPrice} from "~/libs/ethUtils";
import {addNotification} from "~/components/notifications/notifications";

export const ipfsOptions = {url: "http://127.0.0.1:5001"};
export const ipfs = create(ipfsOptions);

export default component$(() => {
	const session = useContext(SessionContext);
	const photoInputRef = useRef<HTMLInputElement>();
	const formState = useStore<ICreateFormState>({
		// price: undefined,
		imageString: "",
		dataString: "",
	});
	// import polyfill, adds window.buffer.Buffer() method
	useClientEffect$(() => {
		import("~/libs/wzrdin_buffer_polyfill.js");
	});

	const handleSubmitForm = $(async (target: HTMLFormElement) => {
		let handleSubmitData: () => void;
		try {
			// step 2
			// the data upload (after image uploads)
			handleSubmitData = async () => {
				let formattedFormData: ICreateFormDataObject = {
					price: "",
					units: "",
					name: "",
					description: "",
					imgHash: "",
				};

				const formatFormDataToBuffer = () => {
					const formData = new FormData(target);
					// fill in data (except file input for photo)
					[...formData.entries()]
						.filter(([key, value]) => key !== "photo")
						.forEach(([key, value]) => (formattedFormData[key] = value));
					console.log({formDataObject: formattedFormData});

					// handle price conversion
					formattedFormData.price = convertPrice(formattedFormData);

					// add imageString from image upload step
					formattedFormData.imgHash = formState.imageString;
					console.log("final formDataObject:", formattedFormData);

					const validateForm = (
						formDataObject: ICreateFormDataObject
					): boolean | string[] => {
						// check each entries to make sure there is a value
						let errors = [];
						const entries = Object.entries(formDataObject);
						entries.forEach(([key, value]) => {
							if (value === undefined) {
								errors.push(`${value} is undefined`);
							} else if (value === null) {
								errors.push(`${value} is null`);
							} else if (value === "") {
								errors.push(`${value} is empty`);
							}
						});
						if (errors.length > 0) return errors;
						return true;
					};

					const result = validateForm(formattedFormData);
					console.log({validate: result});
					if (result !== true) {
						throw new Error(result.join(",\n"));
					}

					// return buffer of JSON of data
					const formDataJson = JSON.stringify(formattedFormData);
					return window.buffer.Buffer(formDataJson);
				};
				const bufData = formatFormDataToBuffer();

				// const handleUploadData = async () => {
				try {
					session.create.note.class = "bg-green-200";
					session.create.note.message = "Uploading data to IPFS...";

					const {cid} = await ipfs.add(bufData);

					formState.dataString = cid.toString();
					addNotification(
						session,
						`ItemData upload successful! ${formState.dataString}`,
						0,
						3000
					);
				} catch (err) {
					session.create.note.class = "bg-red-200";
					session.create.note.message = `Error uploading data to IPFS: ${err.message}`;
					addNotification(
						session,
						`Error uploading item data to IPFS: ${err.message}`,
						2
					);
				}
				// }
				// handleUploadData();

				const addToMarket = async () => {
					session.create.note.class = "bg-green-200";
					session.create.note.message = `Initiating transaction to add item...`;

					const {data, error} = await addItemToMarket(
						formState,
						formattedFormData,
						session
					);

					if (error) {
						session.create.note.class = "bg-red-200";
						session.create.note.message = `Error adding item to smart contract: ${error.message}`;

						addNotification(
							session,
							`Error adding item to marketplace: ${error.message}`,
							2
						);
						return;
					}

					session.create.note.class = "bg-blue-200";
					session.create.note.message = `Transaction successful! Item added to marketplace.`;

					addNotification(
						session,
						`Add item successful!?:\n ${data}`,
						0,
						10000
					);

					// close the create page
					session.create.show = false;

					// mark items as stale so it will refetch
					session.items = {
						...session.items,
						stale: true,
					};
				};
				addToMarket();
			};
		} catch (error) {
			session.create.note.class = "bg-red-200";
			session.create.note.message = `Error uploading data: ${error.message}`;
			addNotification(session, `Error uploading data: ${error.message}`, 2);
		}

		//step 1
		//the image upload
		const handleUploadPhoto = async () => {
			if (!photoInputRef?.current?.files?.[0]) {
				return addNotification(session, "Invalid photo chosen", 2, 5000);
			}
			session.create.note.class = "bg-lime-200";
			session.create.note.message = "Uploading image to IPFS...";

			const reader = new FileReader();
			reader.onloadend = async () => {
				const bufPhoto = window.buffer.Buffer(reader.result);

				try {
					const {cid} = await ipfs.add(bufPhoto);
					formState.imageString = cid.toString();

					addNotification(
						session,
						`Image file uploaded! Reference string: ${formState.imageString}`,
						3,
						3000
					);

					// trigger the next step
					handleSubmitData();
				} catch (err) {
					session.create.note.class = "bg-red-200";
					session.create.note.message = `Error uploading image to IPFS: ${err.message}`;
					addNotification(
						session,
						`Error uploading image to IPFS: ${err.message}`,
						2
					);
				}
			};

			reader.readAsArrayBuffer(photoInputRef.current.files[0] as Blob);
		};

		handleUploadPhoto();
	});
	return (
		<form
			class="flex flex-col w-full items-stretch"
			preventdefault:submit
			onSubmit$={(e) => handleSubmitForm(e.target as HTMLFormElement)}
		>
			<h1 class="mx-auto text-2xl py-4 text-gray-500">
				Add Item to Marketplace
			</h1>
			<fieldset class="border rounded w-[400px] mx-auto my-3 px-2 pt-1 pb-2 shadow">
				<label class="text-gray-500">
					Name:
					<input
						name="name"
						class="block w-full text-black placeholder-gray-300"
						type="text"
						placeholder="Name"
						id="name"
						required
					/>
				</label>
			</fieldset>
			<fieldset class="border rounded w-[400px] mx-auto my-3 px-2 pt-1 pb-2 shadow flex">
				<label class="w-9/12 text-gray-500">
					Price:
					<input
						name="price"
						class="block w-full text-black placeholder-gray-300"
						type="text"
						placeholder="...and select your units"
						id="price"
						required
					/>
				</label>
				<label class="inline text-gray-500">
					Units:
					<select name="units" class="block text-black" id="units">
						<option value="eth">ETH</option>
						<option value="gwei">GWEI</option>
						<option value="wei">WEI</option>
					</select>
				</label>
			</fieldset>

			<fieldset class="border rounded w-[400px] mx-auto my-3 px-2 pt-1 pb-2 shadow">
				<label class="text-gray-500">
					Description:
					<textarea
						name="description"
						class="block w-full h-[200px] text-black placeholder-gray-300"
						placeholder="Description"
						id="description"
						required
					/>
				</label>
			</fieldset>
			<fieldset class="border rounded w-[400px] mx-auto my-3 px-2 pt-1 pb-2 shadow">
				<label class="text-gray-500">
					Upload a Photo:
					<input
						name="photo"
						class="block w-full text-gray-700 "
						type="file"
						id="photo"
						ref={photoInputRef}
						required
					>
						Choose A File
					</input>
				</label>
			</fieldset>
			<button class="border rounded mx-auto p-4 my-4 bg-gray-50 text-gray-700  w-[400px] shadow-md hover:shadow hover:bg-white">
				Add Item To Blockchain Marketplace
			</button>
			{session.create.note.message !== "" && (
				<p
					class={`text-center border rounded mx-auto p-4 my-4 text-gray-700  w-[400px] shadow-md ${session.create.note.class}`}
				>
					{session.create.note.message}
				</p>
			)}
		</form>
	);
});
