import {
	component$,
	mutable,
	useClientEffect$,
	useContext,
	useStylesScoped$,
} from "@builder.io/qwik";
import {SessionContext} from "~/libs/context";
import {ItemPreview} from "../itemPreview/itemPreview";
import Styles from "./browse.css?inline";

export default component$(() => {
	const session = useContext(SessionContext);

	useStylesScoped$(Styles);

	// // fetch items when our browse is stale
	// useClientEffect$(async ({track}) => {
	// 	track(session.browse, 'stale');
	// 	console.log("browse useClientEffect: getting items");
	// 	session.browse.stale = false;
	// 	session.browse.items = await getItems();
	// });

	// // fetch items every 5 seconds so we can stay up to date
	// useClientEffect$(async () => {
	// 	const fetchItems = async () => {
	// 		const newItems = await getItems();
	// 		if (newItems.length !== session.browse.items.length) {
	// 			console.log('browse fetch items interval: detecting new items');
	// 			session.browse.items = newItems;
	// 		}
	// 	}
	// 	fetchItems(); // initial fetch on load
	// 	const timer = setInterval(fetchItems, 5000); // occasional fetch
	// 	return () => clearInterval(timer);
	// })



	return (
		<div class="w-full p-4">
			<h1 class="text-center text-6xl text-blue-800">Browse Marketplace</h1>
			<div className="itemsContainer">
				{session.items.list.length === 0 ? (
					<div class="cursor-pointer" onClick$={() => session.create.show = true}>
						No items were found on the blockchain. Try adding an item!	
					</div>
				) : (
					// session.browse.items.map((item, index) => (
					// 	<ItemPreview key={index} item={mutable(item)} />
					// ))
session.items.list.map((item, index) => (
						<ItemPreview key={index} item={mutable(item)} />
))					
				)}
			</div>
		</div>
	);
});