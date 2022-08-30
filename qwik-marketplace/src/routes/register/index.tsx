import { $, component$, useClientEffect$, useStore, useWatch$ } from "@builder.io/qwik";
import { RequestHandler } from "@builder.io/qwik-city";
import * as IPFS from 'ipfs-core';






interface IFormStore {
	photo: object;
	price: number;
	name: string;
	description: string;
	submit: boolean;
}

export default component$(() => {
	const form = useStore<IFormStore>({
		photo: undefined,
		price: 0,
		name: "",
		description: "",
		submit: false,
	});

	useClientEffect$(({track}) => {
		track(form);
		console.log({photo: form.photo, price: form.price, name: form.name, description: form.description});
	})



	const uploadToIPFS = $((form) => {
		console.log('upload to IPFS function');
		console.log({form});
		console.log({photo: form.photo, price: form.price, name: form.name, description: form.description});
		return 'the hash';
	})

	const attemptTransaction = $((hash) => {
		console.log('transaction function with hash', hash)
	})

	const validate = $((form) => {
		const errors = [];
		if (form.name === '' || form.name === undefined ) {
			errors.push('Name must be provided');
		}
		if (form.price === '' || form.price === undefined || form.price < 0) {
			errors.push('Price must be provided');
		}
		if (form.description === '' || form.description === undefined ) {
			errors.push('Description must be provided');
		}
		if (form.photo === '' || form.photo === undefined ) {
			errors.push('Photo must be provided');
		}
		if (errors.length === 0) return {valid: true, errors: undefined};
		return {valid: false, errors};
	});

	useWatch$(async ({track}) => {
		track(form, 'submit');
		if (!form.submit) return;

		console.log('form submit detected');
		const {valid, errors} = await validate(form);
		if (errors !== undefined) {
			console.log({errors});
		}
		const hash = await uploadToIPFS(form);
		await attemptTransaction(hash);
		form.submit = false;
	})
	
	const uploadImage = $((e) => {
		const ipfs = await IPFS.create();
		const fileList = Array.from(e.target.files);
		const formData = new FormData();
		formData.append(0, fileList[0]);


		const reader = new FileReader();
		reader.onloadend = function() {
			reader.readAsBinaryString(fileList);
			const ipfs = ipfsAPI('localhost', 5001);
			const buf = buffer.Buffer(reader.result);

			IPFS.
		}

		//run ipfs upload
	})



	return (
		<form method="post" action="/register" class="flex flex-col w-full align-center">
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
					// onChange$={(e) => uploadImage(e)}
					>
					Select a File
				</input>
			</label>
			<button 
			type="submit" 
			class="border rounded  mx-auto p-4 my-4" 
			// onClick$={(e) => form.submit = true}
			>Add Item To Marketplace
			</button>
		</form>
	);
});

//{url, params, request, response}
// on the server, need to upload the photo and the data to IPFS and return the hash
export const onPost: RequestHandler = async (body) => {
	console.log({ body });
	// console.log(params.skuId);
	// console.log(request.method);
	// console.log(url.pathname);

	//post a new image, record the location hash (maybe do this client-side first? Then submit the item to the server)

	/*post a new file 
	{
		imageLocationHash,

	}
	 */

	// set response headers
	// response.headers.append('Cache-Control', ' public, max-age=86400');

	return {};
};


