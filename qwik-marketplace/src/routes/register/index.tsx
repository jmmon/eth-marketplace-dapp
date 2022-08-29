import { $, component$, useStore } from "@builder.io/qwik";
import { RequestHandler } from "@builder.io/qwik-city";

interface IFormStore {
	photo: object;
	price: number;
	name: string;
	description: string;
}

export default component$(() => {
	const form = useStore<IFormStore>({
		photo: undefined,
		price: 0,
		name: "",
		description: "",
	});

	// const handleChange = $(e) => {
	// 	console.log('name:', e.target.name, "| value:", e.target.value);
	// 	// form[e.target.name] = e.target.value;
	// 	return;
	// };


	return (
		<div class="flex flex-col w-full align-center">
			<h1 class="mx-auto text-lg">Add Item to Marketplace</h1>
			<label class="border rounded w-1/2 mx-auto my-4 p-4" for="price">
				Price
				<input class="block" type="number" placeholder="Price" id="price" onChange$={() => handleChange(e)}/>
			</label>
			<label class="border rounded w-1/2 mx-auto my-4 p-4" for="name">
				Name
				<input class="block" type="text" placeholder="Name" id="name"  onChange$={() => handleChange(e)}/>
			</label>
			<label class="border rounded w-1/2 mx-auto my-4 p-4" for="description">
				Description
				<textarea
					row="60"
					col="5"
					type="text"
					placeholder="Description"
					id="description"  
					onChange$={() => handleChange(e)}
				></textarea>
			</label>
			<label class="border rounded w-1/2 mx-auto my-4 p-4" for="photo">
				Upload a Photo
				<input class="block" type="file" id="photo" 
					onChange$={() => handleChange(e)}>
					Select a File
				</input>
				{!form.photo && <span>No file chosen</span>}
			</label>
			<button type="submit" class="border-solid" >Add Item To Marketplace</button>
		</div>
	);
});

//{url, params, request, response}
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
