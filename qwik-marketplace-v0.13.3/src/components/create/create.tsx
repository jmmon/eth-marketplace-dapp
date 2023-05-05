declare var window: any;
import {
	$,
	component$,
	useVisibleTask$,
	useContext,
	useSignal,
	useStore,
} from "@builder.io/qwik";
import {SessionContext} from "~/libs/context";

import {addItemToMarket, convertPriceToWei, formatError} from "~/libs/ethUtils";
import {addNotification} from "~/components/notifications/notifications";

import {ipfsClient as ipfs} from "~/libs/ipfs";

export default component$(() => {
	const session = useContext(SessionContext);
	const photoInputRef = useSignal<HTMLInputElement>();
	const formState = useStore<ICreateFormState>({
		imageString: "",
		dataString: "",
		price: "",
	});

	// import polyfill, adds window.buffer.Buffer() method
	useVisibleTask$(() => {
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
						.filter(([key]) => key !== "photo")
						.forEach(([key, value]) => (formattedFormData[key] = value));
					// console.log({formattedFormData});

					// handle price conversion
					// i.e. 'eth', 0.249 => 249_000_000_000_000_000 wei
					formattedFormData.price = convertPriceToWei(
						formattedFormData.units,
						String(formattedFormData.price)
					);

					// add imageString from image upload step
					formattedFormData.imgHash = formState.imageString;

					const validateForm = (
						formDataObject: ICreateFormDataObject
					): boolean | string[] => {
						// check each entries to make sure there is a value
						let errors: string[] = [];
						const entries = Object.entries(formDataObject);
						entries.forEach(([key, value]) => {
							if (value === undefined) {
								errors.push(`${value} is undefined`);
							} else if (value === null) {
								errors.push(`${value} is null`);
							} else if (value === "") {
								errors.push(`${value} is empty`);
							} else if (value === "NaN") {
								errors.push(`${value} is NaN`);
							}
						});
						if (errors.length > 0) return errors;
						return true;
					};

					const result = validateForm(formattedFormData);
					console.log({validate: result});
					if (typeof result !== 'boolean') {
						throw new Error(result.join(",\n"));
					}

					// return buffer of JSON of data
					const formDataJson = JSON.stringify(formattedFormData);
					console.log("formatting form data to buffer:", {formattedFormData});
					return window.buffer.Buffer(formDataJson);
				};

				// const handleUploadData = async () => {
				try {
					const bufData = formatFormDataToBuffer();

					session.create.note.class = "bg-green-200";
					session.create.note.message = "Uploading data to IPFS...";

					const {cid} = await ipfs.add(bufData);

					formState.dataString = cid.toString();
				} catch (err) {
          const message = formatError(err);
					session.create.note.class = "bg-red-200";
					session.create.note.message = `Error uploading data to IPFS: ${message}`;
					addNotification(
						session,
						`Error uploading item data to IPFS: ${message}`,
						"error"
					);
				}
				// }
				// handleUploadData();

				const addToMarket = async () => {
					session.create.note.class = "bg-green-200";
					session.create.note.message = `Initiating transaction to add item...`;

					console.log("fn addItemToMarket:", {formState, formattedFormData});

					const {error} = await addItemToMarket(
						formState,
						formattedFormData,
					);

					if (error) {
						session.create.note.class = "bg-red-200";
						session.create.note.message = `Error adding item to smart contract: ${error.message}`;

						addNotification(
							session,
							`Error adding item to marketplace: ${error.message}`,
							"error"
						);
						return;
					}

					session.create.note.class = "bg-blue-200";
					session.create.note.message = `Transaction successful! Item added to marketplace.`;

					addNotification(
						session,
						`Item has been added to the market!`,
						"success",
						6000
					);

					// close the create page
					session.create.show = false;

					// mark items as stale so it will refetch
					// session.items = {
					// 	...session.items,
					// 	stale: true,
					// 	refetch: true,
					// };
					session.items.refetch = true;
					session.items.stale = true;
				};
				addToMarket();
			};
		} catch (error) {
      const message = formatError(error);
			session.create.note.class = "bg-red-200";
			session.create.note.message = `Error uploading data: ${message}`;
			addNotification(session, `Error uploading data: ${message}`, "error");
		}

		//step 1
		//the image upload
		const handleUploadPhoto = async () => {
			if (!photoInputRef.value?.files?.[0]) {
				return addNotification(session, "Invalid photo chosen", "error", 5000);
			}
			session.create.note.class = "bg-lime-200";
			session.create.note.message = "Uploading image to IPFS...";

			const reader = new FileReader();
			reader.onloadend = async () => {
				const bufPhoto = window.buffer.Buffer(reader.result);
				console.log("filereader onLoadEnd");

				try {
					const {cid} = await ipfs.add(bufPhoto);
					formState.imageString = cid.toString();
					console.log("after adding photo to IPFS");

					// trigger the next step
					handleSubmitData();
				} catch (error) {
          const message = formatError(error);
					session.create.note.class = "bg-red-200";
					session.create.note.message = `Error uploading image to IPFS: ${message}`;
					addNotification(
						session,
						`Error uploading image to IPFS: ${message}`,
						"error"
					);
				}
			};

			reader.readAsArrayBuffer(photoInputRef.current.files[0] as Blob);
		};
		// connect();
		handleUploadPhoto();
	});

	return (
		<form
			class="flex h-[calc(100%-150px)] w-full flex-col items-stretch gap-2 px-[6px] pt-2"
			preventdefault:submit
			onSubmit$={(e) => handleSubmitForm(e.target as HTMLFormElement)}
		>
			<h1 class="text-lx mx-auto text-gray-500 md:text-2xl">
				Add Item to Marketplace
			</h1>
			<fieldset class="mx-auto w-full max-w-[600px] rounded border p-2 shadow">
				<label class="flex-grow text-gray-500">
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
			<fieldset class="mx-auto flex w-full max-w-[600px] rounded border p-2 shadow">
				<label class="flex-grow text-gray-500">
					Price:
					<input
						name="price"
						class="block w-full text-black placeholder-gray-300"
						type="number"
						step="any"
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

			<fieldset class="mx-auto w-full max-w-[600px] flex-grow rounded border p-2 shadow">
				<label class="text-gray-500">
					Description:
					<textarea
						name="description"
						class="block h-[calc(100%-1.5rem)] w-full text-black placeholder-gray-300"
						placeholder="Description"
						id="description"
						required
					/>
				</label>
			</fieldset>
			<fieldset class="mx-auto w-full max-w-[600px] rounded border p-2 shadow">
				<label class="text-gray-500">
					Upload a Photo:
					<input
						name="photo"
						class="block w-full text-gray-700 "
						type="file"
						id="photo"
						ref={photoInputRef}
						required
            placeholder="Choose A File"
					/>
				</label>
			</fieldset>
			<button class=" mx-auto w-full max-w-[600px] rounded border bg-gray-100 py-4 text-gray-700  shadow-md hover:border-gray-300 hover:bg-gray-200 hover:shadow">
				Add Item To Blockchain Marketplace
			</button>
			{session.create.note.message !== "" && (
				<p
					class={`mx-auto w-full 
					max-w-[600px] rounded border p-4 text-center text-gray-700 shadow-md ${session.create.note.class}`}
				>
					{session.create.note.message}
				</p>
			)}
		</form>
	);
});
