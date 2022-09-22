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
import {Modal} from "~/components/modal/modal";
import Store from "~/components/store/store";
import {NxtImages} from "~/components/test/images";
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
		session.items.list = await getItems();
	});

	//testing modal
	const modal = useStore({show: false});
	const handleClose$ = $(() => {
		modal.show = false;
	});

	const handleToggle$ = $(() => {
		modal.show = !modal.show;
	});
	//testing modal 2nd
	const modal2 = useStore({show: false});
	const handleClose2$ = $(() => {
		modal2.show = false;
	});

	const handleToggle2$ = $(() => {
		modal2.show = !modal2.show;
	});

	return (
		<div>
			{/* <div>Testing</div> */}
			{/* instead, could hold an array of "pages/overlays/modals" and add and remove from that array, and then stack the display of modals based on the array  */}
			{session.address && <Create />}

			{/* {session.details.item !== null && <Details item={mutable(session.details.item)} />} */}
			<Details item={mutable(session.details.item)} />

			<Modal
				modal={modal}
				handleClose$={handleClose$}
				handleToggle$={handleToggle$}
				index={1}
			>
				<div>test</div>
			</Modal>
			<button class="border rounded bg-gray-200 p-2" onClick$={() => (modal.show = true)} >Open new modal</button>

			<Modal
				modal={modal2}
				handleClose$={handleClose2$}
				index={2}
				// handleToggle$={handleToggle2$}
			>
				<div>My component goes here</div>
			</Modal>
			<button class="border rounded bg-gray-200 p-2" onClick$={() => (modal2.show = true)} >Open new modal 2</button>

			{/* {session.store.address !== "" && <Store address={mutable(session.store.address)} />} */}
			<Store />

			<Browse />
		</div>
	);
});

export const head: DocumentHead = {
	title: "Marketplace",
};
