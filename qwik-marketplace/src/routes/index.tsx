import {
	component$,
	createContext,
	mutable,
	useClientEffect$,
	useContext,
	useContextProvider,
	useResource$,
	useStore,
} from "@builder.io/qwik";
import type {DocumentHead} from "@builder.io/qwik-city";
import Browse from "~/components/browse/browse";
import Create from "~/components/create/create";
import Details from "~/components/details/details";
import Store from "~/components/store/store";
import { SessionContext } from "~/libs/context";
import {getItems} from "~/libs/ethUtils";

export default component$(() => {
	const session = useContext(SessionContext); // our connected/logged in state

	// fetch items when stale
	useClientEffect$(async ({track}) => {
		track(session, 'items');
		// track(session, 'items');	
		if (!session.items.stale) return;
		console.log('items are stale, re-fetching items')
		session.items.list = await getItems();
	});

	return (
 	 	<div>
    {/* <div>Testing</div> */}
    {/* instead, could hold an array of "pages/overlays/modals" and add and remove from that array, and then stack the display of modals based on the array  */}
			{session.address &&  <Create />}

			{/* {session.details.item !== null && <Details item={mutable(session.details.item)} />} */}
			<Details item={mutable(session.details.item)} />
				

			{/* {session.store.address !== "" && <Store address={mutable(session.store.address)} />} */}
			<Store />

			<Browse />
		</div>
	);
});

export const head: DocumentHead = {
	title: "Marketplace",
};

