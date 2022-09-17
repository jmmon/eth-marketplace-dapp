import {
	$,
	component$,
	mutable,
	useClientEffect$,
	useContext,
	useStylesScoped$,
} from "@builder.io/qwik";
import {SessionContext} from "~/libs/context";
import {getItemsFromAddress} from "~/libs/ethUtils";
import {ItemPreview} from "../itemPreview/itemPreview";
import Styles from "./store.css";

export default component$((props: {address: string}) => {
	const session = useContext(SessionContext);
	useStylesScoped$(Styles);

	const handleClose$ = $(() => {
		console.log("closing store");
		session.store = {
			...session.store,
			show: false,
		}
	});

	return (
		<aside class={`store wrapper ${session?.store?.show && "showing"}`}>
			<div class={`store body ${session?.store?.show && "showing"}`}>
				<div class="flex bg-blue-100">
					<button
						onClick$={handleClose$}
						class="bg-blue-200 p-4 text-lg w-[60px] h-[60px]"
					>
						X
					</button>
					<h1 class=" mx-auto text-md pr-[60px]">
						Items From <br />
						{props.address}
					</h1>
				</div>
				<div class="flex flex-wrap">
					{session?.store?.items?.length === 0 ? (
						<div>Looks like seller {props.address} has no items listed.</div>
					) : (
						<>
							{session?.store?.items?.map((item, index) => (
								<ItemPreview key={index} item={mutable(item)} {...props} />
							))}
							<div class="text-gray-700 text-center p-4 m-auto">That's the end of their items!</div>
						</>
					)}
				</div>
			</div>
		</aside>
	);
});
