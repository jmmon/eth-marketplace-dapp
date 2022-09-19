import {
	$,
	component$,
	mutable,
	Resource,
	useContext,
	useResource$,
} from "@builder.io/qwik";
import {SessionContext} from "~/libs/context";
import {fetchItemDataFromIPFS, getItemsFromAddress} from "~/libs/ethUtils";
import {seeDetails, seeStore, shortAddress, shortText} from "~/libs/utils";
import {Price} from "../price/price";

export const ItemPreview = component$((props: {item: IContractItem | null}) => {
	const session = useContext(SessionContext);
	const resource = useResource$<IItemData>(async ({track, cleanup}) => {
		track(props);

		const controller = new AbortController();
		cleanup(() => controller.abort());

		return await fetchItemDataFromIPFS(props.item, controller);
	});

	return (
		<Resource
			// onRejected={(error) => <div>Error: {error.message}</div>}
			// onPending={() => <div>Loading Items...</div>}
			value={resource}
			onPending={() => (console.log('pending'), <ItemShell />)}
			onRejected={(error) => <ItemShell error={error.message}/>}
			// onResolved={(itemData: IItemData) => (console.log('resolved'), <ItemShell itemData={mutable(itemData)} />)}
			onResolved={(itemData: IItemData) => (
				<div class=" p-2 m-2 flex flex-wrap flex-col flex-1 text-lg text-left bg-blue-400 gap-1 w-4/12 overflow-y-clip">
					<h3
						class="text-4xl text-center bg-gray-100 text-gray-700 p-2 cursor-pointer"
						onClick$={() => seeDetails(itemData.id, session)}
					>
						{shortText(itemData.name, 17)}
					</h3>

					<div
						class=" cursor-pointer"
						style={`background: url(${itemData.imgUrl}); 
						background-repeat: no-repeat; 
						background-size: cover; 
						background-position: center; 
						height: 200px; 
						min-width: 300px;
						width: 100%;
					`}
						onClick$={() => seeDetails(itemData.id, session)}
					></div>
					<div class="grid gap-1 bg-gray-100 text-gray-700 p-2">
						<div>
							<span class="text-sm text-gray-500">Name:</span>
							<br />
							<span class="ml-2">{itemData.name}</span>
						</div>
						<div>
							<span class="text-sm text-gray-500">Price:</span>
							<br />
							<Price price={itemData.price} class="ml-2" />
						</div>
						<div>
							<span class="text-sm text-gray-500">Owner's Address:</span>
							<br />
							{session.address ? (
								<span
									class="text-blue-400 cursor-pointer"
									onClick$={() => seeStore(itemData.owner, session)}
								>
									{shortAddress(itemData.owner)}
								</span>
							) : (
								<span>{shortAddress("#".repeat(42))}</span>
							)}
						</div>
						<button
							class="border rounded bg-white mt-1 p-1"
							onClick$={() => seeDetails(itemData.id, session)}
						>
							See Details
						</button>
					</div>
				</div>
			)}
		/>
	);
});

export const ItemShell = component$((props: {itemData?: IItemData; error?: string;}) => {
	const session = useContext(SessionContext);
	console.log('shell firing:', {itemData: props?.itemData ?? "empty"});
	return (
		<div class=" p-2 m-2 flex flex-wrap flex-col flex-1 text-lg text-left bg-blue-400 gap-1 w-4/12 overflow-y-clip">
			<h3
				class={`text-4xl text-center bg-gray-100 text-gray-700 p-2 cursor-pointer ${!props?.itemData?.name && 'text-gray-100'}`}
				onClick$={props?.itemData?.name ? () => seeDetails(props?.itemData?.id, session) : null}
			>
				{props?.error ? `${props?.error}` : props?.itemData?.name ? shortText(props?.itemData?.name, 17) : "Loading..."}
			</h3>
			{/* <div
				class={`cursor-pointer ${!props?.itemData?.imgUrl && "bg-gray-100"}`}
				style={`${
					props?.itemData?.imgUrl
						? `background: url(${props?.itemData?.imgUrl}); 
		background-repeat: no-repeat; 
		background-size: cover; 
		background-position: center;`
						: ""
				}
		height: 200px; 
		min-width: 300px;
		width: 100%;
	`}
				onClick$={props?.itemData?.id ? () => seeDetails(props?.itemData?.id, session) : null}
			></div> */}
			{	props?.itemData?.imgUrl ? (<div
						class=" cursor-pointer"
						style={`background: url(${props.itemData.imgUrl}); 
						background-repeat: no-repeat; 
						background-size: cover; 
						background-position: center; 
						height: 200px; 
						min-width: 300px;
						width: 100%;
					`}
						onClick$={() => seeDetails(props?.itemData?.id, session)}
					></div>) : (<div
									class="cursor-pointer bg-gray-100"
									style={`height: 200px; 
									min-width: 300px;
									width: 100%;
								`}
								></div>)

			}
			<div class="grid gap-1 bg-gray-100 text-gray-700 p-2">
				<div>
					<p class="text-sm text-gray-500">Name:</p>
					<span class="ml-2">{props?.itemData?.name ?? " "}</span>
				</div>
				<div>
					<p class="text-sm text-gray-500">Price:</p>
					<Price price={props?.itemData?.price ?? " "} class="ml-2" />
				</div>
				<div>
					<p class="text-sm text-gray-500">Owner's Address:</p>
					{ session.address && props?.itemData?.owner? (
						<span
							class="text-blue-400 cursor-pointer"
							onClick$={() => seeStore(props?.itemData?.owner, session)}
						>
							{shortAddress(props?.itemData?.owner)}
						</span>
					) : (
						<span>{shortAddress("#".repeat(42))}</span>
					)}
				</div>
				<button
					class="border rounded bg-white mt-1 p-1"
					onClick$={props?.itemData?.id ? () => seeDetails(props?.itemData?.id, session) : null}
				>
					See Details
				</button>
			</div>
		</div>
	);
});
