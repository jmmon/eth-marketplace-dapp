import {
	component$,
	mutable,
	useContext,
} from "@builder.io/qwik";
import {SessionContext} from "~/libs/context";
import {ItemPreview} from "../itemPreview/itemPreview";

export default component$(() => {
	const session = useContext(SessionContext);

	return (
		<div class="flex flex-wrap gap-2 p-2 overflow-y-auto">
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
