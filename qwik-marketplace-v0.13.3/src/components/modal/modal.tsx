import {
	component$,
	Slot,
	useSignal,
	useStylesScoped$,
	type Signal,
} from "@builder.io/qwik";
import Styles from "./modal.css?inline";
import TabStyles from "./tabStyles.css?inline";

interface Modal {
	modal: any;
	tab?: boolean;
}
export const Modal = component$(({modal, tab}: Modal) => {
	useStylesScoped$(Styles);
	const click = useSignal(false);

	return (
		<aside
			class={`modal ${
				modal.show
					? "showing bg-black bg-opacity-10 backdrop-blur"
					: "bg-transparent backdrop-blur-0"
			} ${!tab ? "noTab" : ""}`}
			onClick$={() => {
				if (click.value) click.value = false;
				else modal.show = false;
			}}
		>
			{tab ? <TabHandle modal={modal} click={click} /> : <div></div>}
			<div
				class={`body ${modal.show ? "opacity-100" : "opacity-0"}`}
				onClick$={() => {
					click.value = true;
				}}
			>
				<div class="header-container overflow-x-hidden">
					<button
						onClick$={() => {
							modal.show = false;
						}}
						class="close bg-blue-200 hover:bg-blue-300"
					>
						X
					</button>
					<Slot name="header" />
				</div>
				<Slot />
			</div>
		</aside>
	);
});

interface TabHandle {
	modal: any;
	click: Signal<boolean>;
}
export const TabHandle = component$(({modal, click}: TabHandle) => {
	useStylesScoped$(TabStyles);

	return (
		<div
			class={`spacer tab bg-gray-100 bg-opacity-60 backdrop-blur ${
				modal.show ? "show bg-opacity-100 opacity-0" : "hover:bg-opacity-90"
			}`}
			onClick$={() => {
				click.value = true; // for preventing bubbling
				modal.show = !modal.show;
			}}
		>
			<div class="tab-text">Add An Item</div>
		</div>
	);
});
