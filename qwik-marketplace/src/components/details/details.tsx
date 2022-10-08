import {
	$,
	component$,
	Resource,
	useContext,
	useResource$,
	useStore,
	useWatch$,
	mutable,
} from "@builder.io/qwik";
import {SessionContext} from "~/libs/context";
import {
	itemDataFromIPFS,
	getItem,
	deleteItem,
	sellItem,
} from "~/libs/ethUtils";
import {seeStore} from "~/libs/utils";
import {addNotification} from "../notifications/notifications";
import {Price} from "../price/price";

export default component$(() => {
	const session = useContext(SessionContext);

	const itemDetailsResource = useResource$<IItemData>(
		async ({track, cleanup}) => {
			track(session, "details");

			if (!session.details?.item?.id) return Promise.resolve({}); // return empty promise if no item id is sent

			const controller = new AbortController();
			cleanup(() => controller.abort());

			// already have the item in our session, just need to fetch the extra details/photo from IPFS
			return await itemDataFromIPFS(session.details.item, controller);
		}
	);

	const handleClose$ = $(() => {
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

		const store = useStore({
			onPurchase: "ready",
			onDelete: "ready",
		});

		//timers to reset states back to "ready"
		useWatch$(({track, cleanup}) => {
			track(store, "onPurchase");
			if (store.onPurchase !== "done" && store.onPurchase !== "error") return;
			const timer = setTimeout(() => {
				store.onPurchase = "ready";
				// close the details page
				handleClose$();

				session.items = {
					...session.items,
					stale: true,
				};
			}, 3000);
			return () => {
				clearTimeout(timer);
			};
		});

		useWatch$(({track, cleanup}) => {
			track(store, "onDelete");
			// console.log({"store.onDelete": store.onDelete});
			if (store.onDelete !== "done" && store.onDelete !== "error") return;
			const timer = setTimeout(() => {
				store.onDelete = "ready";
				// close the details page
				handleClose$();

				session.items = {
					...session.items,
					stale: true,
				};
			}, 3000);
			return () => {
				clearTimeout(timer);
			};
		});

		const onPurchaseWrapper = $(async () => {
			store.onPurchase = "loading";
			let notification = {message: "Purchase successful!", type: 0, time: 5000};
			const response = await sellItem(itemData);

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
			const response = await deleteItem(itemData);

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

		const ownerIsLoggedIn =
			session.address?.toLowerCase() === itemData.owner.toLowerCase();

		return (
			<div class="flex w-full flex-grow flex-wrap gap-1 overflow-y-auto bg-white p-2 text-gray-700">
				<h1 class="w-full bg-amber-100 p-2 text-center text-3xl text-gray-700 md:text-4xl">
					{itemData.name}
				</h1>
				<div
					class="h-96 w-full bg-gray-200 p-2"
					style={`background: url(${itemData.imgUrl}); background-repeat: no-repeat; background-size: cover; background-position: center;`}
					onClick$={() => console.log("TODO: image modal (popup)?")}
				></div>
				<div class="w-8/12 flex-grow bg-gray-100 p-2">
					<p class="text-sm text-gray-500">Price:</p>
					<Price price={itemData.price} class="text-md ml-2" />
				</div>
				<Button
					type="purchase"
					show={mutable(!ownerIsLoggedIn)}
					clickHandler={onPurchaseWrapper}
					state={mutable(store.onPurchase)}
					address={mutable(session.address)}
					classes="w-3/12 text-sm md:text-[1rem] p-1"
					key={0}
				/>
				<Button
					type="delete"
					show={mutable(ownerIsLoggedIn)}
					clickHandler={onDeleteWrapper}
					state={mutable(store.onDelete)}
					address={mutable(session.address)}
					classes="w-3/12 text-sm md:text-[1rem] p-1"
					key={1}
				/>
				<div class="w-full bg-gray-100 p-2">
					<p class="text-sm text-gray-500">Listed By:</p>
					{session.address ? (
						<span
							class="text-md cursor-pointer break-all text-blue-400"
							onClick$={() => seeStore(itemData.owner, session)}
						>
							{itemData.owner}
						</span>
					) : (
						<span class="text-md break-all">{"#".repeat(42)}</span>
					)}
				</div>
				<div class="w-full bg-gray-100 p-2">
					<p class="text-sm text-gray-500">Description:</p>
					{/* <span class=" text-md z-50 ml-2 overflow-y-scroll break-all rounded border-solid border-gray-600 p-2"> */}
					<span class=" text-md z-50 ml-2 overflow-y-scroll rounded border-solid border-gray-600 p-2">
						{itemData.description}
						{/* {"(fake long comment)".repeat(2 ** Math.floor(Math.random() * 5 ) - 1 )} */}
					</span>
				</div>
				<Button
					type="purchase"
					show={mutable(!ownerIsLoggedIn)}
					clickHandler={onPurchaseWrapper}
					state={mutable(store.onPurchase)}
					address={mutable(session.address)}
					classes="w-6/12 mx-auto text-sm md:text-base min-h-[58px]"
					key={2}
				/>
				{session.address && (
					<p
						class="mt-2 w-full cursor-pointer text-center text-blue-400 drop-shadow-md"
						onClick$={() => seeStore(itemData.owner, session)}
					>
						See more from this address
					</p>
				)}
			</div>
		);
	}
);

export const BUTTON_DATA = {
		purchase: {
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
		},
		delete: {
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
		},
	};

export const Button = component$((props) => {
	const {type, show, classes, clickHandler, state, address} = props;

	const {text, colors} = BUTTON_DATA[type];

	return (
		<button
			class={`${
				show ? "block" : "hidden"
			} ${classes} grow-0 rounded border border-gray-400 ${
				address === "" || state === "loading"
					? `${colors.hover} text-gray-400 shadow-sm`
					: `${colors.base} hover:${colors.hover} shadow-md hover:shadow-sm`
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