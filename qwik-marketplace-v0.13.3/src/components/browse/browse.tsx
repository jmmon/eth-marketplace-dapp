import {component$, useContext} from "@builder.io/qwik";
import {SessionContext} from "~/libs/context";
import {ItemPreview} from "../itemPreview/itemPreview";
import {generateNotification} from "../notifications/notifications";

const ShowMissingItems = ({session}: {session: ISessionContext}) => (
	<div class="flex w-full flex-col items-center justify-center text-gray-300">
		<label class="flex gap-1 cursor-pointer items-center">
			<input
				class="bg-gray-100 border-gray-300 text-gray-500 focus:ring-gray-200"
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
);

const ItemsCounter = ({session}: {session: ISessionContext}) => {
	const showMissing = session.items.showMissing;
	const allItems = session.items.all;
	const filteredItems = session.items.filtered;
	return (
		<div class="w-full text-center text-gray-700">
			{showMissing ? allItems.length : filteredItems.length} item
			{showMissing
				? allItems.length === 1
					? ""
					: "s"
				: filteredItems.length === 1
				? ""
				: "s"}{" "}
			Total
		</div>
	);
};

const NoItems = ({session}: {session: ISessionContext}) => (
	<div
		class="cursor-pointer pt-4"
		onClick$={() => (session.create.show = true)}
	>
		No items were found on the blockchain. Try adding an item!
	</div>
);

const Loading = () => (
	<div class="pt-4" onClick$={() => null}>
		Loading items...
	</div>
);

const ItemsList = ({
	session,
	type,
}: {
	session: ISessionContext;
	type: "filtered" | "all";
}) => (
	<>
		{session.items[type].map((item) => (
			<ItemPreview key={item.id} item={item} />
		))}
	</>
);

const Content = ({
	session,
	type,
}: {
	session: ISessionContext;
	type: "all" | "filtered";
}) => {
	return (
		<div class="my-auto flex max-w-[1200px] flex-wrap items-center justify-items-center gap-4 text-xl">
			{session.items[type].length === 0 && !session.items.stale ? (
				<NoItems session={session} />
			) : session.items[type].length > 0 ? (
				(console.log("rendering all items"),
				(<ItemsList session={session} type={type} />))
			) : (
				<Loading />
			)}
		</div>
	);
};


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
			<ShowMissingItems session={session} />

			<div class="grid grid-cols-1 justify-items-center ">
				<Content
					session={session}
					type={session.items.showMissing ? "all" : "filtered"}
				/>
			</div>

			<ItemsCounter session={session} />
		</div>
	);
});

