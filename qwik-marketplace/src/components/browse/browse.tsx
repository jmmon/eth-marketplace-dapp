import {component$, mutable, useContext} from "@builder.io/qwik";
import {SessionContext} from "~/libs/context";
import {ItemPreview} from "../itemPreview/itemPreview";
import {generateNotification} from "../notifications/notifications";

export default component$(() => {
	const session = useContext(SessionContext);

	return (
		<div class="grid w-full justify-center gap-4 p-2 md:gap-6 md:p-4">
			<h1
				class="mx-auto cursor-pointer text-center text-3xl text-blue-800 md:text-5xl lg:text-6xl"
				onClick$={() => generateNotification(session)}
			>
				Browse Marketplace
			</h1>
			<div class="flex w-full flex-col items-center justify-center text-gray-500">
				<label class="flex gap-1 cursor-pointer">
					<input
						type="checkbox"
						value="show"
						onChange$={() =>
							(session.items.showMissing = !session.items.showMissing)
						}
					/>
					Show items missing data
				</label>
				{session.items.showMissing && (
					<p>(Showing items that may no longer exist on IPFS)</p>
				)}
			</div>
			<div class="grid grid-cols-1 justify-items-center ">
				<div class="my-auto flex max-w-[1200px] flex-wrap items-center justify-items-center gap-4 text-xl">
					{session.items.showMissing ? (
						session.items.all.length === 0 && session.items.stale === false ? (
							<div
								class="cursor-pointer pt-4"
								onClick$={() => (session.create.show = true)}
							>
								No items were found on the blockchain. Try adding an item!
							</div>
						) : session.items.all.length > 0 ?
						(
						(console.log("rendering all items"),
						session.items.all.map((item, index) => (
							<ItemPreview key={item.id} item={mutable(item)} />
						)))
						) : (
							<div class="pt-4">Loading items...</div>
						)

					) : (
						session.items.filtered.length === 0 && session.items.stale === false ? (
							<div
								class="cursor-pointer pt-4"
								onClick$={() => (session.create.show = true)}
							>
								No items were found on the blockchain. Try adding an item!
							</div>
						) : session.items.filtered.length > 0 ?
						(
						(console.log("rendering filtered items"),
						session.items.filtered.map((item, index) => (
							<ItemPreview key={item.id} item={mutable(item)} />
						)))
						) : (
							<div 
							class="pt-4"
							onClick$={() => null}
							>Loading items...</div>
						)
					)}
				</div>
			</div>
			<div class="w-full text-center text-gray-700">
				{session.items.showMissing ? session.items.all.length : session.items.filtered.length} Items Total
			</div>
		</div>
	);
});
