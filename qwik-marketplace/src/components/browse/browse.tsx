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
			onPending={() => <div class="text-5xl text-red-600">LOADING...</div>}
			onRejected={(error) => (
				<div class="text-5xl text-red">Error! {error.message}</div>
			)}
			onResolved={(itemData: IItemData) => {
				// const imgUrl = `http://localhost:8080/ipfs/${itemData.imgHash}`;
				return (
					<div class="item p-2 m-2 flex flex-wrap flex-col flex-1 items-center text-lg text-white text-left bg-blue-400 gap-1 w-4/12">
						<div
							style={`background: url(${itemData.imgUrl}); background-repeat: no-repeat; background-size: cover; background-position: center; height: 300px; width: 100%;`}
						></div>
						<h3 class="text-4xl">{itemData.name}</h3>
						<span>{itemData.price} wei</span>
						<span>
							Owner's Address:
							<br />
							{shortText(session.address ? itemData.owner : "#".repeat(20), 10)}
						</span>
						<p>{shortText(itemData.description, 30)}</p>
						<button
							class="border rounded bg-gray-100"
							onClick$={() => props.showItem$(itemData.id, session)}
						>
							Details
						</button>
					</div>
				);
			}}
		/>
	);
});

