import {$, component$, Resource, useContext, useResource$, useStore, useStylesScoped$, useWatch$} from "@builder.io/qwik";
import { SessionContext } from "~/libs/context";
import { connect, fetchItemDataFromIPFS, getContract, getItem } from "~/libs/ethUtils";
import Styles from "./details.css";

export default component$(({session}) => {
	useStylesScoped$(Styles);
	// const item = session.details.item;

	const handleClose = $(() => {
		session.details.show = false;
		console.log('closing details');
	});

	useWatch$(({track}) => {
		const details = track(session, 'details');
		if (details.show) {console.log('details watch:', session.details.item ?? 'no item yet');}
		else console.log('HIDING details watch:', session.details.item ?? 'no item yet');
	});

	const itemDetailsResource = useResource$<IItemData>(async ({track, cleanup}) => {
		track(session, "isBrowser");
		if (!session.isBrowser) return Promise.resolve({});
		
		const controller = new AbortController();
		cleanup(() => controller.abort());
		
		const item = await getItem(session.details.item.id, controller);
		return fetchItemDataFromIPFS(item);
	});



	return (
		<aside
			class={`details wrapper ${
				session.details.show && "showing"
			}`}
		>
			<div class="details spacer"></div>
			<div class={`details body ${
				session.details.show && "showing"
				}`}>
				<button onClick$={handleClose} class="bg-blue-200 p-4 text-lg">
					X
				</button>
				<div
					class="flex flex-col w-full items-stretch"
				>
					<h1 class="mx-auto text-lg py-4">Details</h1>
					<Resource
						value={itemDetailsResource}
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
			</div>
			<div class="details spacer"></div>
		</aside>
	);
});



export const ItemDetails = component$(({itemData} : {itemData: IItemData}) => {
	const onPurchase = $(async (price) => {
		const address = await connect();
		const contract = await getContract(true);
		
		const options = {value: `${price}`}
		const tx = await contract.sell(itemData.id, options);
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
					// console.log("TODO: Purchase", params.id);
					await onPurchase(itemData.price);
				}}
			>
				Purchase
			</button>
		</div>
	);
});
