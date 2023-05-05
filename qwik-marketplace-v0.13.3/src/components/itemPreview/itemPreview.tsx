import {
	$,
	component$,
	Resource,
	useContext,
	useResource$,
} from "@builder.io/qwik";
import {SessionContext} from "~/libs/context";
import {itemDataFromIPFS} from "~/libs/ethUtils";
import {seeDetails, seeStore, shortAddress, shortText} from "~/libs/utils";
import {Price} from "../price/price";

export const ItemPreview = component$(
	(props: {item: IContractItem | null; index?: number; smaller?: boolean}) => {
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
				onRejected={(error) => <ItemShell error={error.message} />}
				onResolved={(itemData: IItemData) => {
					// console.log(itemData);
					return (
						// <div>test</div>
						<ItemShell
							itemData={itemData}
							key={itemData.id}
							smaller={props.smaller}
						/>
					);
				}}
			/>
		);
	}
);

interface ItemShell {
	itemData?: IItemData;
	error?: string;
	smaller?: boolean;
}
export const ItemShell = component$((props: ItemShell) => {
	const session = useContext(SessionContext);

	const headerStyles = `max-h-[56px] ${
		props.smaller ? "text-xl" : "text-3xl"
	} text-center bg-white p-2 w-full self-center`;
	const imageStyles = `h-[240px] w-full bg-gray-100 flex-grow`;

	return (
		<div
			class={`mx-auto flex flex-1 shrink-0 flex-col flex-wrap gap-1 overflow-y-clip bg-blue-100 p-2 text-left text-lg ${
				props.smaller ? "min-w-[260px]" : "min-w-[310px]"
			} max-w-[500px]`}
		>
			{props.itemData ? (
				<h3
					class={`${headerStyles} text-gray-700 ${
						props.itemData?.name && "cursor-pointer"
					}`}
					onClick$={() => seeDetails(props.itemData?.id ?? null, session)}
				>
					{shortText(props.itemData?.name, 20)}
				</h3>
			) : props.error ? (
				<h3 class={`${headerStyles} text-gray-700`}>{props.error}</h3>
			) : (
				<h3 class={`${headerStyles} text-white`}>Loading...</h3>
			)}
			{props.itemData?.imgUrl ? (
				<div
					class={`cursor-pointer ${imageStyles}`}
					style={`background: url(${props.itemData.imgUrl}); 
						background-repeat: no-repeat; 
						background-size: cover; 
						background-position: center; 
						`}
					onClick$={() => seeDetails(props.itemData?.id ?? null, session)}
				></div>
			) : (
				<div class={imageStyles}></div>
			)}
			<div class="grid gap-1 bg-gray-100 p-2 text-gray-700">
				<div class="flex justify-end">
					<Price
						price={props.itemData?.price ?? ""}
						class={`ml-2 ${!props.itemData ? `text-gray-400` : ""} `}
					/>
				</div>
				<div>
					<p class="text-sm text-gray-500">Listed by:</p>
					{session.address && props.itemData?.owner ? (
						<span
							class="cursor-pointer text-blue-400"
							onClick$={() => seeStore(props.itemData?.owner ?? null, session)}
						>
							{shortAddress(props.itemData?.owner)}
						</span>
					) : (
						<span class={!props.itemData ? `ml-2 text-gray-400` : "ml-2"}>
							{shortAddress("#".repeat(42))}
						</span>
					)}
				</div>
				<button
					class={
						props.itemData?.id
							? `m-1 rounded border border-gray-400 bg-gray-200 p-2 shadow-md hover:bg-gray-300 hover:shadow-sm`
							: `m-1 rounded border-gray-300 bg-gray-50 p-2 text-gray-400 shadow-sm`
					}
					disabled={!props.itemData?.id}
					onClick$={$(() =>
						props.itemData?.id
							? seeDetails(props.itemData?.id, session)
							: null
					)}
				>
					See Details
				</button>
			</div>
		</div>
	);
});
