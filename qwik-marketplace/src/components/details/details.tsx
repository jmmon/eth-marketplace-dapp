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
	mutable,
} from "@builder.io/qwik";
import {SessionContext} from "~/libs/context";
import {
	connect,
	fetchItemDataFromIPFS,
	getContract,
	getItem,
	getItemsFromAddress,
	handleDelete,
	handleSell,
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

		const purchaseButtonData = {
			text: {
				ready: "Purchase",
				loading: "Purchasing...",
				error: "Error",
				complete: "Complete!",
				noAddress: "Log in to Purchase",
			},
			colors: {
				base: "bg-amber-200",
				hover: "bg-amber-50",
			},
		};

		const deleteButtonData = {
			text: {
				ready: "Delete",
				loading: "Deleting...",
				error: "Error",
				complete: "Complete!",
				noAddress: "Only owners may Delete",
			},
			colors: {
				base: "bg-red-200",
				hover: "bg-red-50",
			},
		};

		return (
			<div class="detailsWrapper w-full p-4 bg-white flex flex-wrap gap-1 text-gray-700 p-2 flex-grow w-full overflow-y-auto">
				<h1 class="text-4xl text-center text-gray-700 p-2 w-full bg-amber-100">
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
				<Button
					text={mutable(purchaseButtonData.text)}
					colors={mutable(purchaseButtonData.colors)}
					clickHandler={onPurchaseWrapper}
					state={mutable(store.onPurchase)}
					address={mutable(session.address)}
					classes="w-3/12 m-1 p-1"
					key={0}
				/>
				<div class="flex-grow w-8/12 bg-gray-100 p-2">
					<p class="text-sm text-gray-500">Price:</p>
					<Price price={itemData.price} class="ml-2 text-md" />
				</div>
				{session.address?.toLowerCase() === itemData.owner.toLowerCase() && (
					<Button
						text={mutable(deleteButtonData.text)}
						colors={mutable(deleteButtonData.colors)}
						clickHandler={onDeleteWrapper}
						state={mutable(store.onDelete)}
						address={mutable(session.address)}
						classes="w-3/12 m-1 p-1"
						key={1}
					/>
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
				<Button
					text={mutable(purchaseButtonData.text)}
					colors={mutable(purchaseButtonData.colors)}
					clickHandler={onPurchaseWrapper}
					state={mutable(store.onPurchase)}
					address={mutable(session.address)}
					classes="w-6/12 mx-auto p-4"
					key={2}
				/>
				{session.address && (
					<p
						class="text-blue-400 w-full cursor-pointer text-center mt-2 drop-shadow-md"
						onClick$={() => seeStore(itemData.owner, session)}
					>
						See more from this address
					</p>
				)}
			</div>
		);
	}
);

export const Button = component$((props) => {
	const {text, state, clickHandler, colors, address, classes} = props;
	return (
		<button
			class={`${classes} grow-0 border border-gray-400 rounded ${
				address === "" || state === "loading"
					? `${colors.hover} text-gray-400 shadow-sm`
					: `${colors.base} hover:${colors.hover} hover:shadow-sm shadow-md`
			}`}
			onClick$={clickHandler}
			disabled={state === "loading" || address === ""}
		>
			{address === ""
				? text.noAddress
				: state === "ready"
				? text.ready
				: state === "loading"
				? text.loading
				: state === "error"
				? text.error
				: text.complete}
		</button>
	);
});
