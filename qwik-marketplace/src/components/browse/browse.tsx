import {component$, mutable, useContext} from "@builder.io/qwik";
import {SessionContext} from "~/libs/context";
import {ItemPreview} from "../itemPreview/itemPreview";
import {generateNotification} from "../notifications/notifications";

export default component$(() => {
	const session = useContext(SessionContext);

	return (
		<div class="w-full p-2 md:p-4 grid gap-4 md:gap-6 justify-center">
			<h1
				class="header text-center text-3xl md:text-5xl lg:text-6xl text-blue-800 cursor-pointer mx-auto"
				onClick$={() => generateNotification(session)}
			>
				Browse Marketplace
			</h1>
			<div class="grid grid-cols-1 justify-items-center ">
				<div class="flex flex-wrap justify-items-center items-center gap-4 text-xl my-auto max-w-[1200px]">
					{session.items.list.length === 0 ? (
						session.items.stale === false ? (
							<div
								class="cursor-pointer pt-4"
								onClick$={() => (session.create.show = true)}
							>
								No items were found on the blockchain. Try adding an item!
							</div>
						) : (
							<div class="pt-4">Loading items...</div>
						)
					) : (
						(console.log("rendering session items"),
						session.items.list.map((item, index) => (
							<ItemPreview key={item.id} item={mutable(item)} />
						)))
					)}
				</div>
			</div>
			<div class="w-full text-center text-gray-700">
				{session.items.list.length} Items Total
			</div>
		</div>
	);
});
