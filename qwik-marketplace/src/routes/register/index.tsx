import {
	$,
	component$,
	useClientEffect$,
	useRef,
	useStore,
	useWatch$,
} from "@builder.io/qwik";
import {RequestHandler} from "@builder.io/qwik-city";
import {read} from "fs";
import {create} from "ipfs-http-client";
import { CID } from 'multiformats/cid';

interface INotification {
	message: string;
	file: object | undefined;
	error: string | undefined;
}

interface IState {
	isBrowser: boolean;
	notification: INotification;
	imageFile: object;
	dataFile: object;
}

export function toHexString(byteArray) {
  return Array.prototype.map.call(byteArray, function(byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('');
}

export default component$(() => {
	const form = useStore<IFormStore>({
		photo: undefined,
		price: 0,
		name: "",
		description: "",
		submit: false,
	});
	const state = useStore<IState>({
		isBrowser: false,
		notification: {
			message: '',
			file: {},
			error: '',
		},
		// imageFile: '',
		// dataFile: '',
		imageFile: {string: ''},
		dataFile: {string: ''},
	});
	const photoInputRef = useRef();
	const formRef = useRef();

	useClientEffect$(({track}) => {
		state.isBrowser = window !== "undefined";
		console.log({isBrowser: state.isBrowser});
		// track(form);
		// console.log({
		// 	photo: form.photo,
		// 	price: form.price,
		// 	name: form.name,
		// 	description: form.description,
		// });
	});

	// const attemptTransaction = $((hash) => {
	// 	console.log('transaction function with hash', hash)
	// })

	const validate = $((form) => {
		const errors = [];
		if (form.name === "" || form.name === undefined) {
			errors.push("Name must be provided");
		}
		if (form.price === "" || form.price === undefined || form.price < 0) {
			errors.push("Price must be provided");
		}
		if (form.description === "" || form.description === undefined) {
			errors.push("Description must be provided");
		}
		if (form.photo === "" || form.photo === undefined) {
			errors.push("Photo must be provided");
		}
		if (errors.length === 0) return {valid: true, errors: undefined};
		return {valid: false, errors};
	});

	useWatch$(async ({track}) => {
		track(form, "submit");
		if (!form.submit) return;

		console.log("form submit detected");
		const {valid, errors} = await validate(form);
		if (errors !== undefined) {
			console.log({errors});
		}
		const hash = await uploadToIPFS(form);
		await attemptTransaction(hash);
		form.submit = false;
	});
	

	const uploadItemData = $(async () => {
		const form = new FormData(formRef);

		let formDataObject = {};
		[...formData.entries()].forEach(
			([key, value]) => (formDataObject[key] = value)
		);
		console.log({formDataObject});

		const formDataJson = JSON.stringify(formDataObject);
		console.log(formDataJson);

		const ipfs = client(new URL("http://127.0.0.1:5001"));

		let bufData;

		if (state.isBrowser) {
			console.log("attempting client polyfill");
			bufData = window.buffer.Buffer(formDataJson);
		} else {
			console.log("attempting server Buffer");
			bufData = Buffer.from(formDataJson);
		}

		try {
			const file = await ipfs.add(bufData);
			console.log('added file:', {file});
			state.notification = {
				message: "ItemData upload successful!",
				file: file,
				error: undefined,
			};
			
			const byteArray = CID.decode(file.cid.bytes);
			state.dataFile = {string: toHexString(byteArray)};
			// state.dataFile = toHexString(byteArray);

		} catch (err) {
			console.log("data IPFS error:", err.message);
			state.notification = {
				message: "ItemData upload failed",
				file: undefined,
				error: err.message,
			};
		}
	});


	const upload = $(async (e) => {
		const reader = new FileReader();

		reader.onloadend = async () => {
			const ipfs = create(new URL("http://127.0.0.1:5001")); //ipfs client
			let bufPhoto;

			if (state.isBrowser) {
				// const buffer = await import("~/libs/wzrdin_buffer_polyfill.js");
				await import("~/libs/wzrdin_buffer_polyfill.js");
				console.log("attempting client polyfill");
				bufPhoto = window.buffer.Buffer(reader.result);
			} else {
				console.log("attempting server Buffer");
				bufPhoto = Buffer.from(reader.result);
			}

			try {
				const file = await ipfs.add(bufPhoto);
				// file uploaded
				console.log({file});
				state.notification = {message: "Image upload successful!", file: file};

				const string = CID.decode(file.cid.bytes);
				state.imageFile = {string};

				const byteArray = CID.decode(file.cid.bytes);
			// state.imageFile = toHexString(byteArray);
				state.imageFile = {string: toHexString(byteArray)};

				uploadItemData();

			} catch (err) {
				console.error("Image IPFS error:", err.message);
				state.notification = {
					message: "Image upload failed",
					file: undefined,
					error: err.message,
				};
			}
		};

		reader.readAsArrayBuffer(photoInputRef.current.files[0]);
	});

	 
	// Lorem ipsum dolor sit amet consectetur adipisicing elit. Aspernatur dolores molestiae, laborum dicta soluta perferendis eaque error iusto ullam sint eos doloremque excepturi quia. Corporis ratione reprehenderit ipsum distinctio placeat explicabo provident odio quasi necessitatibus. Saepe quis, quasi doloribus ducimus enim minus, odit assumenda nisi, repellat rem aliquam blanditiis quae?

	// notification resetter functions
	useWatch$(({track}) => {
		const message = track(state, "notification.message");
		if (message === "") return;
	
		const timer = setTimeout(() => (state.notification.message = ""), 5000);
		return () => clearTimeout(timer);
	});

	useWatch$(({track}) => {
		const error = track(state, "notification.error");
		if (error === "") return;
		
		const timer = setTimeout(() => (state.notification.error = ""), 5000);
		return () => clearTimeout(timer);
	});

	return (
		<>
			<form
				class="flex flex-col w-full align-center"
				ref={formRef}
			
				// preventdefault:submit
				// onSubmit$={upload}
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
						// onKeyUp$={(e) => form[e.target.name] = e.target.value}
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
						// onKeyUp$={(e) => form[e.target.name] = e.target.value}
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
						// onKeyUp$={(e) => form[e.target.name] = e.target.value}
					></textarea>
				</label>
				<label class="border rounded w-1/2 mx-auto my-4 p-4" for="photo">
					Upload a Photo
					<input
						name="file"
						class="block"
						type="file"
						id="photo"
						ref={photoInputRef}
					>
						Select a File
					</input>
				</label>
				<button
					type="button"
					class="border rounded  mx-auto p-4 my-4"
					preventDefault:click
					onClick$={upload}
				>
					Add Item To Blockchain Marketplace
				</button>
			</form>
			<div class="flex flex-col align-center">
				{state.notification.message && (
					<p class="w-[600px] rounded bg-green-200 ">{state.notification.message}</p>
				)}
				{state.notification.error && (
					<p class="w-[600px] rounded bg-red-200 ">{state.notification.message}</p>
				)}
				{state.dataFile.string && Object.entries(state.dataFile).map(([key, value]) => (
					<p class="w-[600px] rounded bg-blue-200 p-3">{key}: {value}</p>
				))}
				{state.imageFile.string && Object.entries(state.imageFile).map(([key, value]) => (
					<p class="w-[600px] rounded bg-blue-200 p-3">{key}: {value}</p>
				))}
			</div>
		</>
	);
});

// //{url, params, request, response}
// // on the server, need to upload the photo and the data to IPFS and return the hash
// export const onPost: RequestHandler = async (body) => {
// 	console.log({ body });
// 	// console.log(params.skuId);
// 	// console.log(request.method);
// 	// console.log(url.pathname);

// 	//post a new image, record the location hash (maybe do this client-side first? Then submit the item to the server)

// 	/*post a new file
// 	{
// 		imageLocationHash,

// 	}
// 	 */

// 	// set response headers
// 	// response.headers.append('Cache-Control', ' public, max-age=86400');

// 	return {};
// };
