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
		// console.log("session.items.stale changed:", session.items.stale);
		console.log('fetching items:', {stale: session.items.stale, refetch: session.items.refetch});
		if (!session.items.stale) return;

		const {items, error} = await getItems();

		if (error) {
			console.log("error with getItems():", error?.message);
			addNotification(session, `Error getting items: ${error?.message}`);
			session.items.stale = false;
			return;
		}

		let timer;
		const newItemsLengthIsSameAsOld  = session.items.all.length === items.length;
		// after creating an item, the items are marked stale so this clientEffect runs. But if the created item has not been confirmed on the network, the newly added item won't appear yet.
		// To remedy this, creating an item now also sets "refetch" to true, indicating that we want to attempt another fetch of items if the item list length is the same as last time.
		// so this should run once, then run again as long as the item lengths are the same. When the length changes, this will stop refetching items.
		if (session.items.refetch && newItemsLengthIsSameAsOld ) {
			console.log('fetching items: count should be different, setting refetch timer...')
			timer = setTimeout(() => {
				console.log('refetch timer is up, should attempt to refetch items');
				session.items.stale = true;
				session.items.refetch = true;
			}, 5000);

		} else if (session.items.refetch && !newItemsLengthIsSameAsOld) {
			// if length is different, we should be good to stop the refetch!
			session.items.refetch = false;
		}

		session.items.all = items;
		// console.log("before filtering:", {items});

		const keepIfHasAllData = (item) =>
			item.owner &&
			item.owner !== "" &&
			item.ipfsHash &&
			item.ipfsHash !== "" &&
			item.price &&
			item.price !== "" &&
			item.id &&
			item.id !== "";

		session.items.filtered = items.filter(keepIfHasAllData);

		session.items.stale = false;

		//cleanup timer
		// return () => clearTimeout(timer);
	});

	useStylesScoped$(Styles);

	return (
		<div>
			{
			session.details.item && (
				<Modal modal={session.details}>
					{/* {session.details.item &&  */}
					<Details />
					{/* } */}
					<h1 q:slot="header" class="header">
						Details
					</h1>
				</Modal>
			)
			}

			{
			session.store.address !== "" && (
				<Modal modal={session.store}>
					<Store />
					<h1 q:slot="header" class="header">
						Store
					</h1>
				</Modal>
			)
			}

			{session.address && (
				<Modal modal={session.create} tab={true}>
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
