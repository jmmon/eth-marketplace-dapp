import {
	$,
	component$,
	Resource,
	useContext,
	useResource$,
	useStore,
	useStylesScoped$,
	useWatch$,
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
import {shortText} from "~/libs/utils";
import {addNotification} from "../notifications/notifications";
import {Price} from "../price/price";
import store from "../store/store";
import Styles from "./details.css";

export default component$((props: {item: IContractItem | null}) => {
	const session = useContext(SessionContext);
	useStylesScoped$(Styles);

	const itemDetailsResource = useResource$(
		async ({track, cleanup}): Promise<IItemData | object> => {
			// const testItem = track(session, "details.item");
			// console.log({testItem});
			const details = track(session, "details");
			console.log({details});
			if (!session.isBrowser) return Promise.resolve({});
			if (!session.details.item) return Promise.resolve({});

			const controller = new AbortController();
			cleanup(() => controller.abort());

			const item = await getItem(session.details.item.id);
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
		<aside class={`details wrapper ${session.details.show && "showing"}`}>
			<div class={`details body ${session.details.show && "showing"}`}>
				<div class="flex bg-blue-100">
					<button
						onClick$={handleClose$}
						class="bg-blue-200 p-4 text-lg w-[60px] h-[60px]"
					>
						X
					</button>
					<h1 class="mx-auto text-lg py-4 pr-[60px]">Details</h1>
				</div>
				<Resource
					value={itemDetailsResource}
					onPending={() => <div>Loading...</div>}
					onRejected={(error) => <div>Error: {error.message}</div>}
					onResolved={(itemData) =>
						Object.keys(itemData).length > 0 ? (
							<ItemDetails itemData={itemData} handleClose$={handleClose$}/>
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
	(props: {itemData: IItemData | any; handleClose$: () => void;}) => {
		const {itemData} = props;
		const session = useContext(SessionContext);
		useStylesScoped$(`.detailsWrapper {
		grid-template-rows: 60px 40% auto;
		overflow-y: auto;
	}`);
		const store = useStore({
			onPurchase: "ready",
			onDelete: "ready",
		});

		const seeStore$ = $(async (address: string) => {
			console.log("seeStore: opening store for ", address);

			session.details = {
				...session.details,
				show: false,
			};

			session.store = {
				show: true,
				address,
				items: await getItemsFromAddress(address),
			};
		});

		//timers to reset states back to "ready"
		useWatch$(({track, cleanup}) => {
			track(store, "onPurchase");
			console.debug({"store.onPurchase": store.onPurchase})
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
			console.debug({"store.onDelete": store.onDelete})
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
			const response = await onPurchase(itemData);

			if (typeof response === "boolean") {
				addNotification(session, "Purchase successful!", 0, 5000);
				store.onPurchase = "done";
			} else {
				addNotification(
					session,
					`Purchase error: ${response.message}`,
					2,
					10000
				);
				store.onPurchase = "error";
			}
			session.staleItems = true;
		});

		const onDeleteWrapper = $(async () => {
			store.onDelete = "loading";
			const response = await onDelete(itemData);

			if (typeof response === "boolean") {
				addNotification(session, "Delete successful!", 0, 5000);
				store.onDelete = "done";
			} else {
				addNotification(session, `Delete error: ${response.message}`, 2, 10000);
				store.onDelete = "error";
			}
			session.staleItems = true;
		});

		// useWatch$(({track}) => {
		// 	track(props, 'itemData');
		// 	console.debug({sessionAddress: session.address, itemOwner: itemData.owner, doesMatchStrict: session.address === itemData.owner, doesMatchLoose: session.address == itemData.owner,  doesMatchLowercaseStrict: session.address?.toLowerCase() === itemData.owner.toLowerCase(), doesMatchLowercaseLoose: session.address?.toLowerCase() == itemData.owner.toLowerCase()});
		// })

		return (
			<div class="detailsWrapper w-full p-4 bg-gray-100 grid">
				<h1 class="text-4xl text-center text-gray-700 p-2">{itemData.name}</h1>
				<div
					style={`background: url(${itemData.imgUrl}); background-repeat: no-repeat; background-size: cover; background-position: center; height: 400px; width: 100%;`}
					onClick$={() => console.log("TODO: image popup modal")}
				></div>

				<div class="flex flex-wrap gap-1 bg-gray-100 text-gray-700 p-2 flex-grow w-full">
					<div class="flex-grow w-8/12 bg-gray-200 p-2">
						<p class="text-sm text-gray-500">Name:</p>
						<span class="ml-2 text-md">{itemData.name}</span>
					</div>
					<button
						class="grow-0 w-3/12 border rounded bg-white p-1 "
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
					<div class="flex-grow w-8/12 bg-gray-200 p-2">
						<p class="text-sm text-gray-500">Price:</p>
						<Price price={itemData.price} class="ml-2 text-md" />
					</div>
					{session.address?.toLowerCase() === itemData.owner.toLowerCase() && (
						<button
							class="grow-0 w-3/12 border rounded bg-white p-1 "
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
					<div class="w-full bg-gray-200 p-2">
						<p class="text-sm text-gray-500">Owner's Address:</p>
						{session.address ? (
							<span
								class="text-blue-400 cursor-pointer text-md"
								onClick$={() => seeStore$(itemData.owner)}
							>
								{itemData.owner}
							</span>
						) : (
							<span class="text-md">{"#".repeat(42)}</span>
						)}
					</div>
					<div class="w-full bg-gray-200 p-2">
						<p class="text-sm text-gray-500">Description:</p>
						<span class=" text-md ml-2 border-solid rounded border-gray-600 p-2 break-all overflow-y-scroll z-50">
							{itemData.description}
							{"#".repeat(Math.floor(Math.random() * 10000))}
						</span>
					</div>
					<button
						class="grow-0 w-6/12 border text-bold rounded bg-white p-2 mx-auto"
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
							class="text-blue-400 cursor-pointer text-sm"
							onClick$={() => seeStore$(itemData.owner)}
						>
							See more from this address
						</p>
					)}
				</div>
			</div>
		);
	}
);
