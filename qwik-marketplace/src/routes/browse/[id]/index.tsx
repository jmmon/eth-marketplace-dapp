import { component$, Resource, useResource$ } from "@builder.io/qwik";
import { RequestHandler, useEndpoint, useLocation } from "@builder.io/qwik-city";


export default component$(() => {
	const location = useLocation();


	const itemShell = useEndpoint<IItem>();
	// console.log('itemShell:', itemShell);

	return (
		<div>
			<h1>Check out this item!</h1>
			<Resource 
				value={itemShell}
				onPending= {() => <div>Loading...</div>}
				onRejected={() => <div>Error</div>}
				onResolved={(item) => {
					// console.log('parent component passing to ItemDetails:', item)
					return (<ItemDetails item={item}/>)}}
			/>
		</div>
	);
});


export const onGet: RequestHandler<IItem> = async ({params}) => {
	// console.log({params});
	//temporary fetch from my own api endpoint instead of smart contract
	const fetchedItems = await fetch(`http://127.0.0.1:5173/api/dummyItems/${params.id}`)
	const item: IItem = await fetchedItems.json();
	// console.log('parent onGet, received:', item);
	return item;
}


export const ItemDetails = component$((props: {item: IItem}) => {

	const itemData = useResource$<IItemData>(async ({ track, cleanup }) => {
		track(props, "item");

		// console.log('itemDetails props.item', props.item);
		const controller = new AbortController();
		cleanup(() => controller.abort());

		return getItemData(props.item.ipfsHash, controller);
	});

	return(
		<Resource 
			value={itemData}
			onPending={() => <div class="text-5xl">Loading...</div>}
			onRejected={(error) => <div>Error: {error.message}</div>}
			onResolved={(itemData) => {
				// can render img from localhost gateway
				const imgUrl = `http://localhost:8080/ipfs/${itemData.imgHash}`;
				return (
					<div class="w-full p-4 h-[800px] bg-slate-300">
						<div style={`background: url(${imgUrl}); background-repeat: no-repeat; background-size: cover; background-position: center; height: 50%; width: 100%;`}></div>
						<h1>{itemData.name}</h1>
						<p>{itemData.price}</p>
						<p>{itemData.description}</p>
					</div>
			)}}
		/>
	);
})


export function delay(time: number) {
	return new Promise<void>((resolve) => {
		setTimeout(resolve, time);
	});
}

export const getItemData = async (hash: string, controller?: AbortController): Promise<IItemData> => {
	//gotta fetch the item data from IPFS...
	const url = `http://localhost:8080/ipfs/${hash}`;
	console.log('fetching url:', url);
	const response = await fetch(url, {
		signal: controller?.signal,
	});
	// console.log({response})

	const itemData = await response.json();

	await delay(4000);

	if (!itemData) return Promise.reject(itemData);
	return itemData;
}