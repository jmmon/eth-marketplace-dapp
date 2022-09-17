import {
	component$,
	Resource,
	useClientEffect$,
	useContext,
	useResource$,
	useStyles$,
} from "@builder.io/qwik";
import {SessionContext} from "~/libs/context";
import {fetchItemDataFromIPFS, getItems} from "~/libs/ethUtils";
import {shortText} from "~/libs/utils";

export default component$(({showItem$}) => {
	const session = useContext(SessionContext);

	useStyles$(`.itemsContainer {
		display: flex; 
		flex-wrap: wrap;
		align-items: center;
		gap: 1rem; 
		font-size: 20px;
		margin: 1.5rem;
	}`);

	useClientEffect$(async () => {
		console.log("browse: getting items");
		session.items = await getItems();
	});

	return (
		<div class="w-full p-4">
			<h1 class="text-center text-6xl text-blue-800">Browse Marketplace</h1>
			<div className="itemsContainer">
				{session.items.length === 0 ? (
					<div class>
						No items were found on the blockchain. Try{" "}
						<a href="/register">adding an item!</a>
					</div>
				) : (
					session.items.map((item, index) => (
						<ItemPreview key={index} item={item} showItem$={showItem$}/>
					))
				)}
			</div>
		</div>
	);
});

export const ItemPreview = component$((props: {
	item: IContractItem; 
	showItem$: () => void;
}) => {
	const session = useContext(SessionContext);
	const resource = useResource$<IItemData>(async ({track, cleanup}) => {
		track(props, "item");

		const controller = new AbortController();
		cleanup(() => controller.abort());

		return fetchItemDataFromIPFS(props.item, controller);
	});

	return (
		<Resource
			value={resource}
			onPending={() => <div>Loading Items...</div>}
			onRejected={(error) => <div>Error: {error.message}</div>}
			onResolved={(itemData: IItemData) => (
				<div class="p-2 m-2 flex flex-wrap flex-col flex-1 text-lg text-left bg-blue-400 gap-1 w-4/12">
					<h3 class=" text-4xl text-center bg-gray-100 text-gray-700 p-2">{itemData.name}</h3>

					<div
						style={`background: url(${itemData.imgUrl}); background-repeat: no-repeat; background-size: cover; background-position: center; height: 300px; width: 100%;`}
					></div>
					<div class="grid gap-1 bg-gray-100 text-gray-700 p-2">
						<div>
							<span class="text-sm text-gray-500">Name:</span>
							<br/>
							<span class="ml-2">
							{itemData.name}
							</span>
						</div>
						<div>
							<span class="text-sm text-gray-500">Price:</span>
							<br/>
							<span class="ml-2">
							{itemData.price} wei
							</span>
						</div>
						<div>
							<span class="text-sm text-gray-500">Owner's Address:</span>
							<br />
							{session.address 
								? <span class="text-blue-400 cursor-pointer" onClick$={() => console.log(`open address's store page`)}>{shortText(itemData.owner, 20)}</span>
								: <span>{shortText("#".repeat(42), 20)}</span>
							}
						</div>
						<button
							class="border rounded bg-white mt-1 p-1"
							onClick$={() => props.showItem$(itemData.id, session)}
						>
							See Details
						</button>
					</div>
				</div>
			)}
		/>
	);
});

