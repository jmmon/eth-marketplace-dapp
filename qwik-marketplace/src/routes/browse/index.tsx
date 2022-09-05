import {
	component$,
	Resource,
	useClientEffect$,
	useResource$,
	useStore,
	useStyles$,
} from "@builder.io/qwik";
import {useEndpoint} from "@builder.io/qwik-city";
import {ethers} from "ethers";
import {connect, CONTRACT} from "~/libs/ethUtils";

interface IStore {
	isBrowser: boolean;
}

export default component$(() => {
	const store = useStore<IStore>({
		isBrowser: false,
	});

	useStyles$(`.itemsContainer {
		display: flex; 
		flex-wrap: wrap;
		align-items: center;
		gap: 1rem; 
		font-size: 20px;
		margin: 1.5rem;
	}`);

	useClientEffect$(() => {
		store.isBrowser = true;
	});


	const blockchainItems = useResource$<IItem[]>(async ({track, cleanup}) => {
		const isBrowser = track(store, 'isBrowser');

		if (!isBrowser) return Promise.resolve([]);
		
		const controller = new AbortController();
		cleanup(() => controller.abort());

		return getItems(controller);
	});


	return (
		<div class="w-full p-4">
			<h1 class="text-center text-6xl text-blue-800">Browse Marketplace</h1>
			<div className="itemsContainer">
				<Resource
					value={blockchainItems}
					onRejected={(error) => (
						<div class="text-red-400 text-5xl w-full">
							Error: {error.message}
						</div>
					)}
					onPending={()=><div id="loading" class="text-5xl bg-yellow-400" dir="rtl">Loading...</div>}
					onResolved={(items: IItem[], index: number) => {
						console.log(`onResolved:`, {items});
						return (items?.length > 0) ? items.map((item) => (
							<ItemPreview key={index} item={item} />
						))
						: 
						<div class>No items were found on the blockchain. Try <a href="/register">adding an item!</a></div>}
					}
				/>
			</div>
		</div>
	);
});


export const getItems = async (
	controller?: AbortController
): Promise<IItem[]> => {
	try {
		const { accounts, balance, contract } = await connect({signer: false});

		const items = await contract.getAllItems();
		console.log("items from the smart contract!:", {items});

		items.forEach(item => {
			console.log({item}, Object.entries(item));
		});


		const newItems = [];
		items.forEach(item => {
			const bigNum = item[2];

			const newItem = {
				owner: item[0],
				ipfsHash: item[1],
				price: bigNum["_hex"], // this line has the issue
				id: item[3],
			};
			console.log({newItem});
			newItems.push(newItem);
		});

		return Promise.resolve(newItems);

	} catch (error) {
		console.log("error getting items:", error.message);
		return Promise.reject(error);
	}
};

export const ItemPreview = component$((props: {item: IItem}) => {
	const resource = useResource$<IItemData>(async ({track, cleanup}) => {
		track(props, "item");
		const controller = new AbortController();
		cleanup(() => controller.abort());

		return fetchItemDataFromIPFS(props.item, controller);
	});

	return (
		<Resource
			value={resource}
			onPending={() => <div class="text-5xl text-red-600">LOADING...</div>}
			onRejected={(error) => <div class="text-5xl text-red">Error! {error.message}</div>}
			onResolved={(itemData: IItemData) => {
				const imgUrl = `http://localhost:8080/ipfs/${itemData.imgHash}`;
				return (
					<div class="item p-2 m-2 flex flex-wrap flex-col flex-1 items-center text-lg text-white text-left bg-blue-400 gap-1 w-4/12">
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
): Promise<IItemData> => {
	//gotta fetch the item data from IPFS... then
	// console.log('before before the url fetching itemData');
	const url = `http://localhost:8080/ipfs/${item.ipfsHash}`;
	const response = await fetch(url, {
		signal: controller?.signal,
	});

	const itemData = await response.json();
	// console.log("item useResource itemData:", itemData);

	if (itemData && typeof itemData === 'object') return itemData;
	return Promise.reject(itemData);
// }
