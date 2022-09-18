import {
	$,
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
import { getItemsFromAddress } from "~/libs/ethUtils";

export default component$(() => {
	const session = useContext(SessionContext); // our connected/logged in state
	useClientEffect$(() => console.log('session:', {session}));

	return (
		<div>
			{/* instead, could hold an array of "pages/overlays/modals" and add and remove from that array, and then stack the display of modals based on the array  */}
			{session.address &&  <Create />}

			{/* {session.details.item !== null && <Details item={mutable(session.details.item)} />} */}
			<Details item={mutable(session.details.item)} />
				

			{/* {session.store.address !== "" && <Store address={mutable(session.store.address)} />} */}
			<Store address={mutable(session.store.address)} />

			<Browse />
		</div>
	);
});

export const head: DocumentHead = {
	title: "Marketplace",
};
