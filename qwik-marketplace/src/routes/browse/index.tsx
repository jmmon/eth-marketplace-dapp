import {
	component$,
	Resource,
	useClientEffect$,
	useResource$,
	useStyles$,
} from "@builder.io/qwik";
import {useEndpoint} from "@builder.io/qwik-city";
// ~ means "home directory", src in this case I guess?
import trpc from "~/client/trpc";

export default component$(() => {
	// check for account info
	// useClientEffect$(() => {});

	useStyles$(`.itemsContainer {
		display: flex; 
		flex-wrap: wrap;
		align-items: center;
		gap: 1rem; 
		font-size: 20px;
		margin: 1.5rem;
	}`);

	const arrayOfItemShells = useEndpoint<IItem[]>();
	// console.log('arrayOfItemShells:', arrayOfItemShells);

	// const trpcResource = useResource$<IItem[]>(async () => {
	// 	const items = await trpc().query("dummyItems:list");
	// 	console.log('window useResource', typeof window === 'undefined');
	// 	// const items = await trpc(fetch.bind(window)).query("dummyItems:list");
	// 	console.log("dummyItems:list --->", items);
	// 	return items;
	// });

	return (
		<div class="w-full p-4">
			<h1 class="text-center text-6xl text-blue-800">Browse Marketplace</h1>
			<div className="itemsContainer">
				<Resource
					value={arrayOfItemShells}
					onPending={() => <div class="text-5xl bg-red-400">Loading...</div>}
					onRejected={(error) => (
						<div class="text-red-400 text-5xl w-full">Error: {error.message}</div>
					)}
					onResolved={(items) =>
						items.map((item) => (
							// display array of item components
							<ItemPreview item={item} />
						))
					}
				/>
			</div>
		</div>
	);
});

export const onGet: RequestHandler<IItem[]> = async () => {
	//temporary fetch from my own api endpoint instead of smart contract
	const fetchedItems = await fetch(
		`http://127.0.0.1:5173/api/marketplace/dummyItems`
	);
	const array: IItem[] = await fetchedItems.json();
	// console.log(`browse request handler runs`);
	// console.log("array", array);
	return array;
};

export const ItemPreview = component$((props: {item: IItem}) => {
	const resource = useResource$<IItemData>(async ({track}) => {
		track(props, "item");

		// //gotta fetch the item data from IPFS... then
		// const url = `http://localhost:8080/ipfs/${props.item.ipfsHash}`;
		// const response = await fetch(url);
		// // can render img from localhost gateway?
		// const itemData = await response.json();
		// // console.log("item useResource itemData:", {itemData});
		// return itemData;

		return fetchItemFromIPFS(itemData)
	});

	return (
		<Resource
			value={resource}
			onResolved={(itemData: IItemData) => {
				// console.log(" this item:", {itemData});
				const imgUrl = `http://localhost:8080/ipfs/${itemData.imgHash}`;
				return (
					<div class="item p-2 m-2 flex flex-wrap flex-col flex-1 items-center text-lg text-white text-left bg-blue-400 gap-1 w-4/12">
						{/* <img src={imgUrl} alt={itemData.name} style="height: 300px;"/> */}
						<div
							style={`background: url(${imgUrl}); background-repeat: no-repeat; background-size: cover; background-position: center; height: 300px; width: 100%;`}
						></div>
						<h3 class="text-4xl">{itemData.name}</h3>
						<span>{itemData.price} wei</span>
						<p>
							{itemData.description
								.slice(
									0,
									itemData.description.length > 30
										? 20
										: (itemData.description.length * 2) / 3
								)
								.trim()
								.concat("...")}
						</p>
						<a
							class="border rounded bg-gray-100"
							href={`/browse/${props.item.id}`}
						>
							Details
						</a>
					</div>
				);
			}}
		/>
	);
});



export const fetchItemDataFromIPFS = async (
	item: IItem,
	controller?: AbortController
): Promise<any> => {
	//gotta fetch the item data from IPFS... then
		console.log('before before the url fetching itemData');
	const url = `http://localhost:8080/ipfs/${item.ipfsHash}`;
	const response = await fetch(url, {
		signal: controller?.signal,
	});

	const itemData = await response.json();
	console.log("item useResource itemData:", itemData);

	if (itemData && typeof itemData === 'object') return itemData;
	return Promise.reject(itemData);
}