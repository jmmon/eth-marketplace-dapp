import {
	component$,
	mutable,
	useClientEffect$,
	useContext,
	useStyles$,
	useStylesScoped$,
} from "@builder.io/qwik";
import type {DocumentHead} from "@builder.io/qwik-city";
import Browse from "~/components/browse/browse";
import CreateForm from "~/components/create/create";
import Details from "~/components/details/details";
import {Modal} from "~/components/modal/modal";
import {addNotification} from "~/components/notifications/notifications";
import Store from "~/components/store/store";
import {SessionContext} from "~/libs/context";
import {getItems} from "~/libs/ethUtils";
import Styles from "./index.css?inline";

export default component$(() => {
	const session = useContext(SessionContext); // our connected/logged in state

	useClientEffect$(async ({track}) => {
		track(session.items, "stale");
		if (!session.items.stale) return;

		const {items, error} = await getItems();

		if (error) {
			// console.log("error with getItems():", error?.message);
			addNotification(session, `Error getting items: ${error?.message}`);
			session.items.stale = false;
			return;
		}

		session.items.all = items;

		session.items.filtered = items.filter(
				(item) =>
					item.owner &&
					item.owner !== "" &&
					item.imgUrl &&
					item.imgUrl !== "" &&
					item.name &&
					item.name !== "" &&
					item.description &&
					item.description !== "" &&
					item.price &&
					item.price !== ""
			);


		session.items.stale = false;
	})

	useStylesScoped$(Styles);
	return (
		<div>
			{session.details.item && (
				<Modal modal={mutable(session.details)}>
					{/* {session.details.item &&  */}
					<Details />
					{/* } */}
					<h1 q:slot="header" class="header">
						Details
					</h1>
				</Modal>
			)}

			{session.store.address !== "" && (
				<Modal modal={mutable(session.store)}>
					<Store />
					<h1 q:slot="header" class="header">
						Store
					</h1>
				</Modal>
			)}

			{session.address && (
				<Modal modal={mutable(session.create)} tab={true}>
					<CreateForm />
					<h1 q:slot="header" class="header">
						Add An Item
					</h1>
				</Modal>
			)}

			{/* default view: */}
			<Browse />
		</div>
	);
});

export const head: DocumentHead = {
	title: "Marketplace",
};
