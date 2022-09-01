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
// import { CID } from 'multiformats/cid';
import { CID } from 'ipfs-http-client';
import { Notification } from '../../components/notification/notification';




interface INewNotificationEach {
	message: string;
	type: string;
	index: number;
	timeout: number;
}
interface INewNotification {
	each: INewNotification[];
}





interface INotification {
	message: string;
	string: string;
	error: string;
}
interface IState {
	isBrowser: boolean;
	notification: INotification;
	imageString: string;
  dataString: string;
}

declare interface IFormStore {
	photo: object | undefined;
	price: number;
	name: string;
	description: string;
	submit: boolean;
}

export function toHexString(byteArray: Uint8Array): string {
  return Array.prototype.map.call(byteArray, function(byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('');
}

export default component$(() => {
	// const form = useStore<IFormStore>({
	// 	photo: undefined,
	// 	price: 0,
	// 	name: "",
	// 	description: "",
	// 	submit: false,
	// });
	const notifications = useStore<INewNotification>({
		each: [],
	});
	useClientEffect$(({track}) => {
		track(notifications, 'each');
		console.log('WATCH (PARENT): new notifications store:', notifications);
	});

	const state = useStore<IState>({
		isBrowser: false,
		notification: {
			message: '',
			string: '',
			error: '',
		},
		imageString: '',
		dataString: '',
	});
	const photoInputRef = useRef();
	// const formRef = useRef();

	// Client/Server check
	useClientEffect$(() => {
		state.isBrowser = typeof window !== "undefined";
		console.log({isBrowser: state.isBrowser});
	});

	const addNotification = $((message, type, timeout = 0) => {
		const newNotification: INewNotificationEach = {
			message,
			type,
			index: notifications.each.length, // 1 more than last index is the new index for this notification
			timeout,
		} 
		// add it to our list, the rest should be handled by the notification?
		notifications.each.push(newNotification);
	})

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
	

	const uploadItemData = $(async (e) => {
		const formData = new FormData(e.target);

		let formDataObject = {};
		[...formData.entries()].filter(([key, value]) => key !== 'photo').forEach(
			([key, value]) => (formDataObject[key] = value)
		);
		console.log({formDataObject});

		formDataObject["imgHash"] = state.imageString;

		console.log('final formDataObject:', formDataObject);


		const formDataJson = JSON.stringify(formDataObject);
		console.log('json version:', formDataJson);

		const ipfsOptions = {url: "http://127.0.0.1:5001"};
		// const ipfsOptions = {port: 5001, host: '127.0.0.1', protocol: 'http'};
		const ipfs = create(ipfsOptions);

		let bufData;

		console.log(`attempting ${state.isBrowser ? 'client polyfill' : 'server Buffer'}`);

		if (state.isBrowser) {
			bufData = window.buffer.Buffer(formDataJson);
		} else {
			bufData = Buffer.from(formDataJson);
		}

		try {
			const result = await ipfs.add(bufData);
			const { path, cid, size } = result;

			console.log('full file object:', result);
			console.log('split:', {path, cid, size});
			console.log('cid.toString()', cid.toString());
			// works up to here!!!!!!
			// some sort of error: set property of textarea#description: cannot set property because it only has a getter
			
			state.dataString = cid.toString();
			state.notification = {
				message: "ItemData upload successful!",
				string: state.dataString,
				error: '',
			};

			addNotification(
				`ItemData upload successful! ${state.dataString}`,
				'success',
				5000,
			);
			addNotification(
				`ItemData upload successful! ${state.dataString} - DUPLICATE - zero timeout`,
				'success',
			);
			


			// console.log('Got CID string from file result (state):', state.dataString);
			// console.log('Got CID string from file result (calc):', cid.toString());

		} catch (err) {
			console.log("data IPFS error:", err.message);
			state.notification = {
				message: "ItemData upload failed",
				string: '',
				error: err.message,
			};

			addNotification(
				'ItemData upload failed',
				'error',
				5000,
			);
			addNotification(
				'ItemData upload failed - DUPLICATE - zero timeout',
				'error',
			);

		}
	});


	const handleSubmit = $(async (e) => {
		const reader = new FileReader();

		reader.onloadend = async () => {
			const ipfsOptions = {url: "http://127.0.0.1:5001"};
			// const ipfsOptions = {port: 5001, host: '127.0.0.1', protocol: 'http'};
			const ipfs = create(ipfsOptions);
			// const ipfs = create(new URL("http://127.0.0.1:5001")); //ipfs client
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
				const result = await ipfs.add(bufPhoto);
				const { path, cid, size } = result;
				
				console.log('full file object:', result);
				console.log('split:', {path, cid, size});
				console.log('cid.toString()', cid.toString());
				
				state.imageString = cid.toString();
				state.notification = {
					message: "Image upload successful!", 
					string: state.imageString,
					error: '',
				};

				addNotification(
					`Image upload successful! ${state.imageString}`,
					'success',
					5000,
				);
				addNotification(
					`Image upload successful! ${state.imageString} - DUPLICATE - zero timeout`,
					'success',
				);




				// continue to upload the whole data
				uploadItemData(e);

			} catch (err) {
				console.error("Image IPFS error:", err.message);
				state.notification = {
					message: "Image upload failed",
					string: '',
					error: err.message,
				};

				addNotification(
					'Image upload failed',
					'error',
					5000,
				);
				addNotification(
					'Image upload failed - DUPLICATE - zero timeout',
					'error',
				);
				// const newNotification: INewNotificationEach = {
				// 	message: "Image upload failed",
				// 	type: "error",
				// 	index: state.notifications.length, // 1 more than last index is the new index for this notification
				// 	timeout: 5000,
				// } 
				// // add it to our list, the rest should be handled by the notification?
				// notifications.each.push(newNotification);
			}
		};

		reader.readAsArrayBuffer(photoInputRef.current.files[0]);
		//alternately, could try pulling file from formData
	});



	 
	// Lorem ipsum dolor sit amet consectetur adipisicing elit. Aspernatur dolores molestiae, laborum dicta soluta perferendis eaque error iusto ullam sint eos doloremque excepturi quia. Corporis ratione reprehenderit ipsum distinctio placeat explicabo provident odio quasi necessitatibus. Saepe quis, quasi doloribus ducimus enim minus, odit assumenda nisi, repellat rem aliquam blanditiis quae?

	// notification resetter functions
	useWatch$(({track}) => {
		const { message } = track(state, "notification");
		console.log('running watch notification.message:', {message});
		if (message === "") return;
	
		const timer = setTimeout(() => (state.notification.message = ""), 5000);
		return () => clearTimeout(timer);
	});

	useWatch$(({track}) => {
		const { error } = track(state, "notification");
		console.log('running watch notification.error:', {error});
		if (error === "") return;
		
		const timer = setTimeout(() => (state.notification.error = ""), 5000);
		return () => clearTimeout(timer);
	});

	// const testSubmit = $((e) => {
	// 	console.log('test submit');
	// 	console.log(e.target);
	// });

	return (
		<>
			<form
				class="flex flex-col w-full align-center"
				// ref={formRef}
				preventdefault:submit
				onSubmit$={(e) => handleSubmit(e)}
			>
				<h1 class="mx-auto text-lg">Add Item to Marketplace</h1>
				<label 
				class="border rounded w-1/2 mx-auto my-4 p-4" 
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
				<button
					class="border rounded  mx-auto p-4 my-4"
				>
					Add Item To Blockchain Marketplace
				</button>
			</form>
			<div class="flex flex-col align-center">
				
				{state.notification.message !== '' && <p class="w-[600px] rounded bg-green-200 p-3">{state.notification.message}</p>}
					
				{state.notification.error !== '' && <p class="w-[600px] rounded bg-red-200 p-3">{state.notification.error}</p>}


				{state.dataString !== '' && <p class="w-[600px] rounded bg-blue-200 p-3">Data file uploaded! Reference string: {state.dataString}</p>}

				{state.imageString !== '' && <p class="w-[600px] rounded bg-blue-200 p-3">Image file uploaded! Reference string: {state.imageString}</p>}
		<br />
		<br />
		<h2>New notifications!:</h2>

				{notifications.each.map((thisNotification) => <Notification store={notifications} thisNotification={thisNotification} />)}

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
