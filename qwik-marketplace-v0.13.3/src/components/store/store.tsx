import {component$, useContext} from "@builder.io/qwik";
import {SessionContext} from "~/libs/context";
import {ItemPreview} from "../itemPreview/itemPreview";

export default component$(() => {
	const session = useContext(SessionContext);

	return (
		<div class="flex flex-wrap gap-2 pt-2 px-[4px] overflow-y-auto overflow-x-hidden">
			<div class="w-full flex justify-items-center text-gray-500 text-sm md:text-base">
				<div class="flex flex-wrap mx-auto justify-items-center w-min md:w-auto">
					<span >{session.store.address.substring(0, 24)}</span>
					<span >{session.store.address.substring(24)}'s Items</span>
				</div>
			</div>
			{session.store.items?.length === 0 ? (
				<div>
					Looks like seller {session.store.address} has no items listed.
				</div>
			) : (
				<>
					{session.store.items?.map((item, index) => (
						<ItemPreview key={index} item={item} smaller={true} />
					))}
					<div class="text-gray-700 text-center p-4 m-auto w-full">
						{session.store.items?.length} item{session.store.items?.length === 1 ? '' : 's'} total
					</div>
				</>
			)}
		</div>
	);
});
