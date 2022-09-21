import {
	$,
	component$,
	mutable,
	useClientEffect$,
	useContext,
	useStore,
	useStylesScoped$,
	useWatch$,
} from "@builder.io/qwik";
import {SessionContext} from "~/libs/context";
import {getItemsFromAddress} from "~/libs/ethUtils";
import {ItemPreview} from "../itemPreview/itemPreview";
import Styles from "./store.css?inline";

export default component$(() => {
	const session = useContext(SessionContext);
	useStylesScoped$(Styles);

	const handleClose$ = $(() => {
		console.log("closing store");
		session.store = {
			...session.store,
			show: false,
		}
	});

	// used to stop propagation so I can detect outside clicks to close the modal
	const clickStore = useStore({
		inside: false,
	})

	useClientEffect$(async ({track}) => {
		track(session, 'store');
		if (session.store.address === '') return;

		console.log("store useClientEffect: getting items for address", session.store.address);
		session.store.items = await getItemsFromAddress(session.store.address);
		session.store.stale = false;
	});

	return (
		<aside class={`store wrapper ${session.store.show && "showing"} ${session.store.show ? "bg-black backdrop-blur bg-opacity-10" : "bg-transparent"}`} onClick$={(ev) => {
			if (clickStore.inside) {
				clickStore.inside = false;
			} else {
				console.log('wrapper click');
				handleClose$()
			}
		}
			}>
			<div class={`store body ${session.store.show && "showing"}`} onClick$={(ev) => {
				// ev.stopPropagation();
				console.log('body click');
				clickStore.inside = true;
			}}>
				<div class="flex bg-blue-100">
					<button
						onClick$={handleClose$}
						class="bg-blue-200 p-4 text-lg w-[60px] h-[60px]"
					>
						X
					</button>
					<h1 class=" mx-auto text-md pr-[60px]">
						Items From <br />
						{session.store.address}
					</h1>
				</div>
				<div class="flex flex-wrap">
					{session.store.items?.length === 0 ? (
						<div>Looks like seller {session.store.address} has no items listed.</div>
					) : (
						<>
							{session.store.items?.map((item, index) => (
								<ItemPreview key={index} item={mutable(item)} />
							))}
							<div class="text-gray-700 text-center p-4 m-auto w-full">{session.store.items?.length} items total</div>
						</>
					)}
				</div>
				<div class="h-4 bg-gray-100 w-full"></div>
			</div>
		</aside>
	);
});
