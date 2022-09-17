import { $, component$, Resource, useContext, useResource$ } from "@builder.io/qwik";
import { SessionContext } from "~/libs/context";
import { fetchItemDataFromIPFS, getItemsFromAddress } from "~/libs/ethUtils";
import { shortText } from "~/libs/utils";

export const ItemPreview = component$((props: {item: IContractItem | null}) => {
	const session = useContext(SessionContext);
	const resource = useResource$<IItemData>(async ({track, cleanup}) => {
		track(props);

		const controller = new AbortController();
		cleanup(() => controller.abort());

		return await fetchItemDataFromIPFS(props.item, controller);
	});

	const seeStore$ = $(async (address: string) => {
		console.log('seeStore: opening store for ', address);

		session.details = {
			...session.details,
			show: false,
		}

		session.store = {
			show: true, 
			address,
			items: await getItemsFromAddress(address),
		}
	});

	const seeDetails$ = $((id: string) => {
		const thisItem = session.items.find(item => item?.id === id);
		console.log('see details button: showing item:', {id, session, thisItem});
	
		session.store = {
			...session.store,
			show: false,
		}

		// create new object so that we can track the change
		session.details = {
			item: thisItem ?? null, 
			show: true,
		}
	})

	return (
		<Resource
			value={resource}
			onPending={() => <div>Loading Items...</div>}
			onRejected={(error) => <div>Error: {error.message}</div>}
			onResolved={(itemData: IItemData) => (
				<div class="min-w-max p-2 m-2 flex flex-wrap flex-col flex-1 text-lg text-left bg-blue-400 gap-1 w-4/12 overflow-y-clip">
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
								? (
								<span 
									class="text-blue-400 cursor-pointer" 
									onClick$={async () => await seeStore$(itemData.owner)}
								>
									{shortText(itemData.owner, 20)}
								</span>)
								: (
									<span>{shortText("#".repeat(42), 20)}</span>
								)
							}
						</div>
						<button
							class="border rounded bg-white mt-1 p-1"
							onClick$={() => seeDetails$(itemData.id)}
						>
							See Details
						</button>
					</div>
				</div>
			)}
		/>
	);
});