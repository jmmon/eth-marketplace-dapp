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
import {CONTRACT} from "~/libs/ethUtils";

interface IStore {
	items: IItem[];
}

export default component$(() => {
	const store = useStore<IStore>({
		items: [],
	});

	useStyles$(`.itemsContainer {
		display: flex; 
		flex-wrap: wrap;
		align-items: center;
		gap: 1rem; 
		font-size: 20px;
		margin: 1.5rem;
	}`);

	useClientEffect$(async () => {
		try {
			console.log('test try async useClientEffect');
			const arrayOfItemShells = await getItems();
			console.log("use Effect", {arrayOfItemShells});
		// store.items = arrayOfItemShells;
			store.items = Promise.resolve(arrayOfItemShells);
		} catch( error ) {
			console.log(error.message);
		}
	});

	return (
		<div class="w-full p-4">
			<h1 class="text-center text-6xl text-blue-800">Browse Marketplace</h1>
			<div className="itemsContainer">
				<div>Test resource</div>
				{/* <Resource
					value={store.items}
					onPending={() => <div class="text-5xl bg-red-400">Loading...</div>}
					onRejected={(error) => (
						<div class="text-red-400 text-5xl w-full">
							Error: {error.message}
						</div>
					)}
					onResolved={(items: IItem[]) =>
						items.map((item) => (
							// display array of item components
							<div>Test</div>
							// <ItemPreview item={item} />
						))
					}
				/> */}
			</div>
		</div>
	);
});

export const getItems = async () => {
	try {
		console.log('test try getItems');
		// choose metamask injection as provider
		const provider = new ethers.providers.Web3Provider(window.ethereum);
		console.log({provider});

		// check for accounts
		const accounts = await provider.send("eth_requestAccounts", []);
		const balance = ethers.utils.formatEther(
			await provider.getBalance(accounts[0])
		);
		console.log(
			`Accounts connected: [0]:{${accounts[0]}: ${balance}eth}`,
			"success"
		);

		// signer needed to sign txns / change state in contracts ?
		const signer = provider.getSigner();

		// connect to contract
		const marketplaceContract_ReadOnly = new ethers.Contract(
			CONTRACT.address,
			CONTRACT.abi,
			provider
		);

		const marketplaceContract_Signer =
			marketplaceContract_ReadOnly.connect(signer);

		console.log("about to fetch the items");

		const items = marketplaceContract_Signer.getAllItems();

		console.log("items from the smart contract!:", {items});

		// return items;

		// // console.log('response from addItem:', {tx});

		return true;
	} catch (error) {
		console.log("error getting items:", error.message);
		return Promise.reject(error);
	}
};

// export const ItemPreview = component$((props: {item: IItem}) => {
// 	const resource = useResource$<IItemData>(async ({track, cleanup}) => {
// 		track(props, "item");
// 		const controller = new AbortController();
// 		cleanup(() => controller.abort());

// 		return fetchItemDataFromIPFS(props.item, controller);
// 	});

// 	return (
// 		<Resource
// 			value={resource}
// 			onPending={() => <div class="text-5xl text-red-600">LOADING...</div>}
// 			onRejected={(error) => <div class="text-5xl text-red">Error! {error.message}</div>}
// 			onResolved={(itemData: IItemData) => {
// 				const imgUrl = `http://localhost:8080/ipfs/${itemData.imgHash}`;
// 				return (
// 					<div class="item p-2 m-2 flex flex-wrap flex-col flex-1 items-center text-lg text-white text-left bg-blue-400 gap-1 w-4/12">
// 						<div
// 							style={`background: url(${imgUrl}); background-repeat: no-repeat; background-size: cover; background-position: center; height: 300px; width: 100%;`}
// 						></div>
// 						<h3 class="text-4xl">{itemData.name}</h3>
// 						<span>{itemData.price} wei</span>
// 						<p>
// 							{itemData.description
// 								.slice(
// 									0,
// 									itemData.description.length > 30
// 										? 20
// 										: (itemData.description.length * 2) / 3
// 								)
// 								.trim()
// 								.concat("...")}
// 						</p>
// 						<a
// 							class="border rounded bg-gray-100"
// 							href={`/browse/${props.item.id}`}
// 						>
// 							Details
// 						</a>
// 					</div>
// 				);
// 			}}
// 		/>
// 	);
// });

// export const fetchItemDataFromIPFS = async (
// 	item: IItem,
// 	controller?: AbortController
// ): Promise<any> => {
// 	//gotta fetch the item data from IPFS... then
// 	// console.log('before before the url fetching itemData');
// 	const url = `http://localhost:8080/ipfs/${item.ipfsHash}`;
// 	const response = await fetch(url, {
// 		signal: controller?.signal,
// 	});

// 	const itemData = await response.json();
// 	// console.log("item useResource itemData:", itemData);

// 	if (itemData && typeof itemData === 'object') return itemData;
// 	return Promise.reject(itemData);
// }
