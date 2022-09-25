import {
	component$,
	mutable,
	useClientEffect$,
	useContext,
	useStylesScoped$,
} from "@builder.io/qwik";
import {SessionContext} from "~/libs/context";
import {getItemsFromAddress} from "~/libs/ethUtils";
import {ItemPreview} from "../itemPreview/itemPreview";
import Styles from "./store.css?inline";

export default component$(() => {
	const session = useContext(SessionContext);
	useStylesScoped$(Styles);

	useClientEffect$(async ({track}) => {
		track(session, "store");
		if (session.store.address === "") return;

		console.log(
			"store useClientEffect: getting items for address",
			session.store.address
		);
		session.store.items = await getItemsFromAddress(session.store.address);
		session.store.stale = false;
	});

	return (
		<div class="flex flex-wrap gap-2 p-2">
			{session.store.items?.length === 0 ? (
				<div>
					Looks like seller {session.store.address} has no items listed.
				</div>
			) : (
				<>
					{session.store.items?.map((item, index) => (
						<ItemPreview key={index} item={mutable(item)} />
					))}
					<div class="text-gray-700 text-center p-4 m-auto w-full">
						{session.store.items?.length} items total
					</div>
				</>
			)}
		</div>
	);
});
