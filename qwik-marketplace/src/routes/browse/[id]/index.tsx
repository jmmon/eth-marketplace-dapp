import {
	$,
	component$,
	Resource,
	useClientEffect$,
	useResource$,
	useStore,
} from "@builder.io/qwik";
import {RequestHandler, useEndpoint, useLocation} from "@builder.io/qwik-city";

import {ethers} from "ethers";
import {connect, CONTRACT} from "~/libs/ethUtils";

interface IItemDataPlus extends IItemData {
	imgUrl: string;
}

export default component$(() => {
	const {params} = useLocation();
	console.log(params.id);

	const store = useStore({isBrowser: false});

	useClientEffect$(() => {
		store.isBrowser = true;
	});

	const itemShell = useResource$<IItemDataPlus>(async ({track, cleanup}) => {
		track(store, "isBrowser");
		if (!store.isBrowser) return Promise.resolve({});
		
		const controller = new AbortController();
		cleanup(() => controller.abort());

		return getItemData(getItemShell(params.id, controller));
	});

	return (
		<div>
			<h1>Check out this item!</h1>
			<Resource
				value={itemShell}
				onPending={() => <div>Loading...</div>}
				onRejected={(error) => <div>Error: {error.message}</div>}
				onResolved={(itemData) => {
					console.log("parent resolve", {itemData});
					return (Object.keys(itemData).length > 0) 
						? <ItemDetails itemData={itemData} />
						: <div>Loading...</div>;
				}}
			/>
		</div>
	);
});

export const getItemShell = async (id: string): Promise<IItemDataPlus> => {
	try {
		const { accounts, balance, contract } = await connect({signer: false});
		
		const item = await contract.getItemFromId(id);
		console.log("item from the smart contract!:", {item});

		const bigNum = item[2];

		const newItem = {
			owner: item[0],
			ipfsHash: item[1],
			price: bigNum["_hex"], // this line has the issue
			id: item[3],
		};
		console.log({newItem});

		return Promise.resolve(newItem);



	} catch (error) {
		console.log("error getting items:", error.message);
		return Promise.reject(error);
	}
};

export const getItemData = async (item: IItem): Promise<IItemDataPlus> => {
	//gotta fetch the item data from IPFS...
	const url = `http://localhost:8080/ipfs/${item.ipfsHash}`;
	console.log("fetching url:", url);

	const response = await fetch(url);
	const itemData = await response.json();
	const imgUrl = `http://localhost:8080/ipfs/${itemData.imgHash}`;
	itemData.imgUrl = imgUrl;
	itemData.owner = item.owner;
	console.log('final', {itemData});

	if (!itemData) return Promise.reject(itemData);
	return itemData;
};

export const ItemDetails = component$(({itemData} : {itemData: IItemDataPlus}) => {
	const {params} = useLocation();

	const onPurchase = $(async (price) => {
		const { accounts, balance, contract } = await connect({signer: true});
		
		const options = {value: `${price}`}
		const tx = await contract.sell(params.id, options);
		console.log('response from purchase:', {tx});
	})



	return (
		<div class="w-full p-4 h-[800px] bg-slate-300">
			<div
				style={`background: url(${itemData.imgUrl}); background-repeat: no-repeat; background-size: cover; background-position: center; height: 50%; width: 100%;`}
			></div>
			<h1>Item Name: {itemData.name}</h1>
			<p>Price (in wei): {itemData.price}</p>
			<p>Description: {itemData.description}</p>
			{window.ethereum && <p>Owner: {itemData.owner}</p>}
			<button
				class="border-solid rounded px-2 py-1 bg-gray-50"
				onClick$={async () => {
					console.log("TODO: Purchase", params.id);
					await onPurchase(itemData.price);
				}}
			>
				Purchase
			</button>
		</div>
	);
});
