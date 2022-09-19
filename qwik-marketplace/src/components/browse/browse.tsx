import {
	component$,
	mutable,
	useClientEffect$,
	useContext,
	useStylesScoped$,
} from "@builder.io/qwik";
import {SessionContext} from "~/libs/context";
import {getItems} from "~/libs/ethUtils";
import {ItemPreview} from "../itemPreview/itemPreview";
import Styles from "./browse.css?inline";

export default component$(() => {
	const session = useContext(SessionContext);

	useStylesScoped$(Styles);

	useClientEffect$(async ({track}) => {
		track(session, 'staleItems');
		console.log("browse: getting items");
		session.staleItems = false;
		session.items = await getItems();
	});

	return (
		<div class="w-full p-4">
			<h1 class="text-center text-6xl text-blue-800">Browse Marketplace</h1>
			<div className="itemsContainer">
				{session.items.length === 0 ? (
					<div>
						No items were found on the blockchain. Try{" "}
						<a href="/register">adding an item!</a>
					</div>
				) : (
					session.items.map((item, index) => (
						<ItemPreview key={index} item={mutable(item)} />
					))
				)}
			</div>
		</div>
	);
});