import {
	component$,
	mutable,
	Resource,
	useContext,
	useResource$,
} from "@builder.io/qwik";
import {SessionContext} from "~/libs/context";
import {itemDataFromIPFS} from "~/libs/ethUtils";
import {seeDetails, seeStore, shortAddress, shortText} from "~/libs/utils";
import {Price} from "../price/price";

export const ItemPreview = component$((props: {item: IContractItem | null; index?: number; smaller?: boolean;}) => {
	const session = useContext(SessionContext);
	const resource = useResource$<IItemData>(async ({track, cleanup}) => {
		track(props);

		const controller = new AbortController();
		cleanup(() => controller.abort());

		return await itemDataFromIPFS(props.item, controller);
	});

	return (
		<Resource
			value={resource}
			onPending={() => <ItemShell />}
			onRejected={(error) => <ItemShell error={mutable(error.message)} />}
			onResolved={(itemData: IItemData) => (
				<ItemShell itemData={mutable(itemData)} key={itemData.id} smaller={props?.smaller}/>
			)}
		/>
	);
});



export const ItemShell = component$(
	(props: {itemData?: IItemData; error?: string, smaller?: boolean;}) => {
		const session = useContext(SessionContext);

		const headerStyles = `max-h-[56px] ${props?.smaller? "text-xl" : "text-3xl"} text-center bg-white p-2 w-full self-center`;
		const imageStyles = `h-[240px] w-full bg-gray-100`;
		return (
			<div class={`flex-1 p-2 mx-auto flex flex-wrap flex-col text-lg text-left bg-blue-100 gap-1 overflow-y-clip shrink-0 ${props?.smaller ? "min-w-[260px]" : "min-w-[310px]"} max-w-[500px]`}>
				{props?.itemData ? (
					<h3
						class={`${headerStyles} text-gray-700 ${
							props?.itemData?.name && "cursor-pointer"
						}`}
						onClick$={() => seeDetails(props?.itemData?.id, session)}
					>
						{shortText(props.itemData?.name, 20)}
					</h3>
				) : props?.error ? (
					<h3 class={`${headerStyles} text-gray-700`}>
						{props.error}
					</h3>
				) : (
					<h3 class={`${headerStyles} text-white`}>
						Loading...
					</h3>
				)}
				{props?.itemData?.imgUrl ? (
					<div
						class={`cursor-pointer ${imageStyles}`}
						style={`background: url(${props.itemData.imgUrl}); 
						background-repeat: no-repeat; 
						background-size: cover; 
						background-position: center; 
						`}
						onClick$={() => seeDetails(props?.itemData?.id, session)}
					></div>
				) : (
					<div
						class={imageStyles}
					></div>
				)}
				<div class="grid gap-1 bg-gray-100 text-gray-700 p-2">
					<div class="flex justify-end">
						<Price
							price={props?.itemData?.price ?? ""}
							class={`ml-2 ${!props?.itemData ? `text-gray-400` : ""} `}
						/>
					</div>
					<div>
						<p class="text-sm text-gray-500">Listed by:</p>
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
								? `m-1 p-2 border border-gray-400 rounded bg-gray-200 shadow-md hover:shadow-sm hover:bg-gray-300`
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
