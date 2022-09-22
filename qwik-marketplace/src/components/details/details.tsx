import {
	$,
	component$,
	Resource,
	useContext,
	useResource$,
	useStore,
	useStylesScoped$,
	useWatch$,
	useStore,
} from "@builder.io/qwik";
import {SessionContext} from "~/libs/context";
import {
	connect,
	fetchItemDataFromIPFS,
	getContract,
	getItem,
	getItemsFromAddress,
	onDelete,
	onPurchase,
} from "~/libs/ethUtils";
import {seeStore, shortText} from "~/libs/utils";
import {addNotification} from "../notifications/notifications";
import {Price} from "../price/price";
import store from "../store/store";
import Styles from "./details.css?inline";

export default component$(() => {
	const session = useContext(SessionContext);
	useStylesScoped$(Styles);

	const clickStore = useStore({inside: false});

	const itemDetailsResource = useResource$<IItemData>(
		async ({track, cleanup}) => {
			track(session, "details");

			if (!session.details?.item?.id) return new Promise(); // return empty promise if no item id is sent

			const controller = new AbortController();
			cleanup(() => controller.abort());

			const item = await getItem(session.details?.item?.id ?? "");
			return await fetchItemDataFromIPFS(item, controller);
		}
	);

	const handleClose$ = $(() => {
		console.log("closing details");
		session.details = {
			...session.details,
			show: false,
		};
	});

	return (
		<aside
			class={`details wrapper ${session.details.show && "showing"} ${
				session.details.show
					? "bg-black backdrop-blur bg-opacity-10"
					: "bg-transparent"
			}`}
			onClick$={() => {
				if (clickStore.inside) clickStore.inside = false;
				else handleClose$();
			}}
		>
			<div 
			class={`details body`}
			onClick$={() => clickStore.inside = true}
			>
				<div class="flex bg-blue-100">
					<button
						onClick$={handleClose$}
						class="bg-blue-200 p-4 text-lg w-[60px] h-[60px]"
					>
						X
					</button>
					<h1 class="mx-auto text-lg py-4 pr-[60px] text-blue-500">Details</h1>
				</div>
				<Resource
					value={itemDetailsResource}
					onPending={() => <div>Loading...</div>}
					onRejected={(error) => <div>Error: {error.message}</div>}
					onResolved={(itemData) =>
						Object.keys(itemData).length > 0 ? (
							<ItemDetails itemData={itemData} handleClose$={handleClose$} />
						) : (
							<div>Loading...</div>
						)
					}
				/>
			</div>
		</aside>
	);
});

export const ItemDetails = component$(
	(props: {itemData: IItemData | any; handleClose$: () => void}) => {
		const {itemData, handleClose$} = props;
		const session = useContext(SessionContext);
		// 	useStylesScoped$(`.detailsWrapper {
		// 	grid-template-rows: 60px 40% auto;
		// 	overflow-y: auto;
		// }`);
		const store = useStore({
			onPurchase: "ready",
			onDelete: "ready",
		});

		//timers to reset states back to "ready"
		useWatch$(({track, cleanup}) => {
			track(store, "onPurchase");
			console.log({"store.onPurchase": store.onPurchase});
			if (store.onPurchase !== "done" && store.onPurchase !== "error") return;
			const timer = setTimeout(() => {
				store.onPurchase = "ready";
				// close the details page
				handleClose$();
			}, 3000);
			return () => {
				clearTimeout(timer);
			};
		});
		useWatch$(({track, cleanup}) => {
			track(store, "onDelete");
			console.log({"store.onDelete": store.onDelete});
			if (store.onDelete !== "done" && store.onDelete !== "error") return;
			const timer = setTimeout(() => {
				store.onDelete = "ready";
				// close the details page
				handleClose$();
			}, 3000);
			return () => {
				clearTimeout(timer);
			};
		});

		const onPurchaseWrapper = $(async () => {
			store.onPurchase = "loading";
			let notification = {message: "Purchase successful!", type: 0, time: 5000};
			const response = await handleSell(itemData);

			if (response.error) {
				store.onPurchase = "error";
				notification = {
					message: `Purchase error: ${response.error.message}`,
					type: 2,
					time: 10000,
				};
			} else if (response.success === true) {
				store.onPurchase = "done";
			}
			addNotification(
				session,
				notification.message,
				notification.type,
				notification.time
			);
			session.items = {
				...session.items,
				stale: true,
			};
		});

		const onDeleteWrapper = $(async () => {
			store.onDelete = "loading";
			let notification = {message: "Delete successful!", type: 0, time: 5000};
			const response = await handleDelete(itemData);

			if (response.error) {
				store.onDelete = "error";
				notification = {
					message: `Delete error: ${response.error.message}`,
					type: 2,
					time: 10000,
				};
			} else if (response.success === true) {
				store.onDelete = "done";
			}
			addNotification(
				session,
				notification.message,
				notification.type,
				notification.time
			);
			session.items = {
				...session.items,
				stale: true,
			};
		});

		return (
			<div class="detailsWrapper w-full p-4 bg-white flex flex-wrap gap-1 text-gray-700 p-2 flex-grow w-full overflow-y-auto">
				<h1 class="text-4xl text-center text-gray-700 p-2 w-full bg-gray-100">
					{itemData.name}
				</h1>
				<div
					class="w-full h-96 bg-gray-200"
					style={`background: url(${itemData.imgUrl}); background-repeat: no-repeat; background-size: cover; background-position: center;`}
					onClick$={() => console.log("TODO: image modal (popup)?")}
				></div>
				<div class="flex-grow w-8/12 bg-gray-100 p-2">
					<p class="text-sm text-gray-500">Name:</p>
					<span class="ml-2 text-md">{itemData.name}</span>
				</div>
				<button
					class="grow-0 w-3/12 m-1 p-1 border border-gray-400 rounded bg-amber-200 shadow-md hover:shadow-sm hover:bg-amber-50"
					onClick$={onPurchaseWrapper}
					disabled={store.onPurchase === "loading"}
				>
					{store.onPurchase === "ready"
						? "Purchase"
						: store.onPurchase === "loading"
						? "Purchasing..."
						: store.onPurchase === "error"
						? "Error"
						: "Complete!"}
				</button>
				<div class="flex-grow w-8/12 bg-gray-100 p-2">
					<p class="text-sm text-gray-500">Price:</p>
					<Price price={itemData.price} class="ml-2 text-md" />
				</div>
				{session.address?.toLowerCase() === itemData.owner.toLowerCase() && (
					<button
						class="grow-0 w-3/12 m-1 p-1 border border-gray-400 rounded bg-red-200 shadow-md hover:shadow-sm hover:bg-red-50"
						// class="grow-0 w-3/12 border rounded bg-white p-1 "
						disabled={store.onDelete === "loading"}
						onClick$={onDeleteWrapper}
					>
						{store.onDelete === "ready"
							? "Delete"
							: store.onDelete === "loading"
							? "Deleting..."
							: store.onDelete === "error"
							? "Error"
							: "Complete!"}
					</button>
				)}
				<div class="w-full bg-gray-100 p-2">
					<p class="text-sm text-gray-500">Owner's Address:</p>
					{session.address ? (
						<span
							class="text-blue-400 cursor-pointer text-md"
							onClick$={() => seeStore(itemData.owner, session)}
						>
							{itemData.owner}
						</span>
					) : (
						<span class="text-md">{"#".repeat(42)}</span>
					)}
				</div>
				<div class="w-full bg-gray-100 p-2">
					<p class="text-sm text-gray-500">Description:</p>
					<span class=" text-md ml-2 border-solid rounded border-gray-600 p-2 break-all overflow-y-scroll z-50">
						{itemData.description}
						{"#".repeat(Math.floor(Math.random() * 10000))}
					</span>
				</div>
				{/* </div>{" "} */}
				<button
					class="grow-0 w-6/12 mx-auto p-4 border border-gray-400 rounded bg-amber-200 shadow-md hover:shadow-sm hover:bg-amber-50"
					// class="grow-0 w-6/12 border text-bold rounded bg-white p-2 mx-auto"
					onClick$={onPurchaseWrapper}
				>
					{store.onPurchase === "ready"
						? "Purchase"
						: store.onPurchase === "loading"
						? "Purchasing..."
						: store.onPurchase === "error"
						? "Error"
						: "Complete!"}
				</button>
				{session.address && (
					<p
						class="text-blue-400 cursor-pointer text-center mt-2 drop-shadow-md"
						onClick$={() => seeStore(itemData.owner, session)}
					>
						See more from this address
					</p>
				)}
			</div>
		);
	}
);
