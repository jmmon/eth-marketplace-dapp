import {
	$,
	component$,
	mutable,
	Slot,
	useContext,
	useStore,
	useStylesScoped$,
	useWatch$,
} from "@builder.io/qwik";
import { SessionContext } from "~/libs/context";
import Styles from "./modal.css?inline";
import TabStyles from "./tabStyles.css?inline";

export const Modal = component$(
	(props: {
		modal: any;
		handleClose$?: () => void;
		handleToggle$?: () => void;
		tab?: boolean;
		title: any;
	}) => {
		useStylesScoped$(Styles);
		const click = useStore({inside: false});

		const handleClose = $(() => {
			props.modal.show = false;
		});

		return (
			<aside
				class={`modal ${
					props.modal.show
						? "showing bg-black backdrop-blur bg-opacity-10"
						: "bg-transparent"
				} ${
					!props.tab ? "noTab" : ""
				}`}
				onClick$={() => {
					if (click.inside) click.inside = false;
					else handleClose();
				}}
			>
				{props.tab ? (
					<TabHandle modal={mutable(props.modal)} click={click} />
				) : (
					<div class={props.modal.show ? "spacer" : ""}></div>
				)}
				<div
					class={`body`}
					onClick$={() => {
						click.inside = true;
					}}
				>
					<div class="header-container">
						<button
							onClick$={() => {
								handleClose();
							}}
							class="close"
						>
							X
						</button>
						<h1 class="header">{props.title}</h1>
					</div>
					<Slot />
				</div>
			</aside>
		);
	}
);

export const TabHandle = component$((props) => {
	useStylesScoped$(TabStyles);

	const handleToggle = $(() => {
			props.modal.show = !props.modal.show;
		});

	return (
		<div
			class={`spacer tab ${props.modal.show ? "showing" : ""}`}
			onClick$={() => {
				props.click.inside = true; // for preventing bubbling
				handleToggle();
			}}
		>
			<div class="tab-text">{props.modal.show ? "/\\ " : "\\/ "}Add An Item</div>
		</div>
	);
});
