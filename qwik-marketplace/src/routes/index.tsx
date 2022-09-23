import {
	component$,
	mutable,
	useClientEffect$,
	useContext,
} from "@builder.io/qwik";
import type {DocumentHead} from "@builder.io/qwik-city";
import Browse from "~/components/browse/browse";
import CreateForm from "~/components/create/create";
import Details from "~/components/details/details";
import {Modal} from "~/components/modal/modal";
import Store from "~/components/store/store";
import {SessionContext} from "~/libs/context";
import {getItems} from "~/libs/ethUtils";

export default component$(() => {
	const session = useContext(SessionContext); // our connected/logged in state

	// fetch items when stale
	useClientEffect$(async ({track}) => {
		track(session, "items");
		// track(session, 'items');
		if (!session.items.stale) return;
		console.log("items are stale, re-fetching items");
		session.items.stale = false;

		// const fetchedItems = await getItems();
		// console.log({fetchedItems});
		// const promiseItemsWithData = fetchedItems.map(async (item) => await fetchItemDataFromIPFS(item));
		// console.log({promiseItemsWithData});
		// const resolvedItemsWithData = await Promise.all(promiseItemsWithData);
		// console.log({resolvedItemsWithData});

		// const contractItems: IContractItem[] = await getItems();
		// console.log({contractItems});
		// if (contractItems.length > 0) {

		// 	const newMap = contractItems.map((item) => {return fetchItemDataFromIPFS(item)});
		// 	console.log({newMap});
		// 	try {

		// 		const final = await Promise.all([...newMap]);
		// 		console.log({final});
		// 	} catch(e) {
		// 		console.log('error:', e);
		// 	}
		// }
		// 	if (contractItems.length > 0) {
		// 	let finalItems = [];
		// 	for (let i = 0; i < contractItems.length; i++) {
		// 		finalItems.push(await fetchItemDataFromIPFS(contractItems[i]));
		// 	}
		// 	// contractItems.forEach(item => finalItems.push(fetchItemDataFromIPFS(item)))
		// 	// const newFinalItems = await Promise.all(finalItems);
		// 	// finalItems = await Promise.all(contractItems.map(async (item) => await fetchItemDataFromIPFS(item)));
		// 	console.log("testing pre-ipfs-data-fetching:", {
		// 		contractItems,
		// 		finalItems,
		// 	});
		// }

		session.items.list = await getItems();

		// // do diffing on the array, so we don't have a flash re-render??
		// const oldItems = session.items.list;
		// const newItems = await getItems();

		// // could have created or deleted or purchased(removed) an item
		// const oldItemsIds = oldItems.map(item => item.id);
		// const newItemsIds = newItems.map(item => item.id);
		// console.log('Diffing items:');
		// console.log({oldItems, newItems});
		// // list of items exclusive to the old list
		// const oldItemIdsToRemove = oldItemsIds.filter(itemId => newItemsIds.indexOf(itemId) === -1);
		// // list of items exclusive to the new list
		// const newItemIdsToAdd = newItemsIds.filter(itemId => oldItemsIds.indexOf(itemId) === -1);
		// console.log('Exclusive lists:', {shouldRemove: oldItemIdsToRemove, shouldAdd: newItemIdsToAdd});
		// // slice out of oldItems array
		// // for each itemId we need to remove, go thru oldItems and find the index in the oldItems, and then splice it out of oldItems.
		// // console.log('commence diffing of items:');
		// oldItemIdsToRemove.forEach(itemId => {
		// 	let index;
		// 	oldItems.forEach((item, i) => {
		// 		if (item.id === itemId) {
		// 			index = i;
		// 		}
		// 	})
		// 	console.log('~~ removing', index, 'from olditems:', {item: oldItems[index]});
		// 	oldItems.splice(index, 1);
		// });

		// newItemIdsToAdd.forEach(itemId => {
		// 	const item = newItems.filter(item => item.id === itemId)[0];
		// 	oldItems.push(item);
		// 	console.log('~~ appending item:', {item});
		// });

		// console.log('~FINAL: (finalItems values and fetchedItems values should be the same but different order):', {fetchedItems: newItems, fetchedItemsLength: newItems.length, finalItems: oldItems, finalItemsLength: oldItems.length});
	});

	// useClientEffect$(({track}) => {
	// 	track(session, "details");

	// 	if (!session.details.stale) return;

	// 	console.log("details item changed");
	// 	// do a fetch and set our item?
	// 	// or is the data already fetched??
	// });

	return (
		<div>
			{/* instead, could hold an array of "pages/overlays/modals" and add and remove from that array, and then stack the display of modals based on the array  */}

			{session.address && (
				<Modal
					modal={mutable(session.create)}
					key={0}
					tab={true}
					title={"Add An Item"}
				>
					<CreateForm />
				</Modal>
			)}

			<Modal modal={mutable(session.details)} key={1} title={"Details"}>
				<Details item={mutable(session.details.item)} />
			</Modal>

			<Modal
				modal={mutable(session.store)}
				key={2}
				title={mutable(`${session.store.address}'s Store`)}
			>
				<Store />
			</Modal>

			<Browse />
		</div>
	);
});

export const head: DocumentHead = {
	title: "Marketplace",
};
