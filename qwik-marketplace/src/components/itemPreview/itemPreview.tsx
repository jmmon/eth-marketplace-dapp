import {
	$,
	component$,
	mutable,
	Resource,
	useClientEffect$,
	useContext,
	useResource$,
	useWatch$,
} from "@builder.io/qwik";
import {SessionContext} from "~/libs/context";
import {fetchItemDataFromIPFS, getItemsFromAddress} from "~/libs/ethUtils";
import {seeDetails, seeStore, shortAddress, shortText} from "~/libs/utils";
import {Price} from "../price/price";

export const ItemPreview = component$((props: {item: IContractItem | null; index: number; test: any;}) => {
	const session = useContext(SessionContext);
	const resource = useResource$<IItemData>(async ({track, cleanup}) => {
		track(props);

		const controller = new AbortController();
		cleanup(() => controller.abort());

		return await fetchItemDataFromIPFS(props.item, controller);
	});
		console.log('rendering item', props.test.counter)
		useClientEffect$(() => {
			props.test.counter ++;
		})
		// console.log("item preview", props.item ?? "no itemData" );
		// console.log(`index: ${props.index}`);
	return (
		<Resource
			value={resource}
			onPending={() => <ItemShell />}
			onRejected={(error) => <ItemShell error={mutable(error.message)} />}
			onResolved={(itemData: IItemData) => (
				<ItemShell itemData={mutable(itemData)} key={itemData.id} />
			)}
		/>
	);
});

export const ItemShell = component$(
	(props: {itemData?: IItemData; error?: string}) => {
		const session = useContext(SessionContext);
		return (
			<div class=" p-2 m-2 flex flex-wrap flex-col flex-1 text-lg text-left bg-blue-400 gap-1 w-4/12 overflow-y-clip">
				{props?.itemData ? (
					<h3
						class={`text-4xl text-center bg-gray-100 text-gray-700 p-2 ${
							props?.itemData?.name && "cursor-pointer"
						}`}
						onClick$={() => seeDetails(props?.itemData?.id, session)}
					>
						{shortText(props.itemData?.name, 17)}
					</h3>
				) : props?.error ? (
					<h3 class="text-4xl text-center bggray-100 text-gray-700 p-2">
						{props.error}
					</h3>
				) : (
					<h3 class={`text-4xl text-center bg-gray-100 text-gray-100 p-2`}>
						Loading...
					</h3>
				)}
				{props?.itemData?.imgUrl ? (
					<div
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
					></div>
				) : (
					<div
						class="bg-gray-100"
						style={`height: 200px; 
									min-width: 300px;
									width: 100%;
								`}
					></div>
				)}
				<div class="grid gap-1 bg-gray-100 text-gray-700 p-2">
					<div>
						<p class="text-sm text-gray-500">Name:</p>
						<span class="ml-2">{props?.itemData?.name ?? " "}</span>
					</div>
					<div>
						<p class="text-sm text-gray-500">Price:</p>
						<Price
							price={props?.itemData?.price ?? " "}
							class="ml-2"
							class={!props?.itemData ? `ml-2 text-gray-400` : "ml-2"}
						/>
					</div>
					<div>
						<p class="text-sm text-gray-500">Owner's Address:</p>
						{session.address && props?.itemData?.owner ? (
							<span
								class="text-blue-400 cursor-pointer"
								onClick$={() => seeStore(props?.itemData?.owner, session)}
							>
								{shortAddress(props?.itemData?.owner)}
							</span>
						) : (
							<span class={!props?.itemData ? `text-gray-400 ml-2` : "ml-2"}>
								{shortAddress("#".repeat(42))}
							</span>
						)}
					</div>
					<button
						class={
							props?.itemData?.id
								? `m-1 p-2 border border-gray-400 rounded bg-gray-200 shadow-md hover:shadow-sm hover:bg-white`
								: `m-1 p-2 border-gray-300 rounded bg-gray-50 shadow-sm text-gray-400`
						}
						disabled={!props?.itemData?.id}
						onClick$={
							props?.itemData?.id
								? () => seeDetails(props?.itemData?.id, session)
								: null
						}
					>
						See Details
					</button>
				</div>
			</div>
		);
	}
);
