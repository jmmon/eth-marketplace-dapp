import {
	$,
	component$,
	Slot,
	useStore,
	useStylesScoped$,
} from "@builder.io/qwik";
import {SessionContext} from "~/libs/context";
import Styles from "./modal.css?inline";
import TabStyles from "./tabStyles.css?inline";

export const Modal = component$((props: {modal: any; tab?: boolean}) => {
	useStylesScoped$(Styles);
	const click = useStore({inside: false});

	const handleClose = $(() => {
		props.modal.show = false;
	});

	return (
		<aside
			class={`modal ${
				props.modal.show
					? "showing bg-black bg-opacity-10 backdrop-blur"
					: "bg-transparent backdrop-blur-0"
			} ${!props.tab ? "noTab" : ""}`}
			onClick$={() => {
				if (click.inside) click.inside = false;
				else handleClose();
			}}
		>
			{props.tab ? (
				<TabHandle modal={props.modal} click={click} />
			) : (
				<div></div>
			)}
			<div
				class={`body ${props.modal.show ? "opacity-100" : "opacity-0"}`}
				onClick$={() => {
					click.inside = true;
				}}
			>
				<div class="header-container overflow-x-hidden">
					<button
						onClick$={() => {
							handleClose();
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

export const TabHandle = component$((props) => {
	useStylesScoped$(TabStyles);

	const handleToggle = $(() => {
		props.modal.show = !props.modal.show;
	});

	return (
		<div
			class={`spacer tab bg-gray-100 bg-opacity-60 backdrop-blur ${
				props.modal.show
					? "show bg-opacity-100 opacity-0"
					: "hover:bg-opacity-90"
			}`}
			onClick$={() => {
				props.click.inside = true; // for preventing bubbling
				handleToggle();
			}}
		>
			<div class="tab-text">Add An Item</div>
		</div>
	);
});
