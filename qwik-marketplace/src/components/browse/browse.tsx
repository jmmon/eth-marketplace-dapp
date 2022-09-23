import {
	component$,
	mutable,
	useContext,
	useStylesScoped$,
} from "@builder.io/qwik";
import {SessionContext} from "~/libs/context";
import {ItemPreview} from "../itemPreview/itemPreview";
import {generateNotification} from "../notifications/notifications";
import Styles from "./browse.css?inline";

export default component$(() => {
	const session = useContext(SessionContext);
	useStylesScoped$(Styles);

	return (
		<div class="w-full p-4 grid justify-center">
			<h1
				class="text-center text-6xl text-blue-800 cursor-pointer mx-auto"
				onClick$={() => generateNotification(session)}
			>
				Browse Marketplace
			</h1>
			<div class="itemsContainer">
				{session.items.list.length === 0 ? (
					<div
						class="cursor-pointer"
						onClick$={() => (session.create.show = true)}
					>
						No items were found on the blockchain. Try adding an item!
					</div>
				) : (
					(console.log("rendering session items"),
					session.items.list.map((item, index) => (
						<ItemPreview key={item.id} item={mutable(item)} />
					)))
				)}
			</div>
			<div class="w-full text-center text-gray-700">
				{session.items.list.length} Items Total
			</div>
		</div>
	);
});
