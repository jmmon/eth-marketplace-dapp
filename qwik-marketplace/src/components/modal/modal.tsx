import {
	$,
	component$,
	Slot,
	useStore,
	useStylesScoped$,
	useWatch$,
} from "@builder.io/qwik";
import Styles from "./modal.css?inline";

export const Modal = component$(
	(props: {
		modal: any;
		handleClose$?: () => void;
		handleToggle$?: () => void;
		tab?: boolean;
		index: number;
	}) => {
		useStylesScoped$(Styles);
		const click = useStore({inside: false});
		// console.log("modal renders");

		const handleClose = $(() => {
			props.modal.show = false;
		});

		const handleToggle = $(() => {
			props.modal.show = !props.modal.show;
		})

		return (
			<aside
				class={`modal ${
					props.modal.show
						? "showing bg-black backdrop-blur bg-opacity-10"
						: "bg-transparent"
				} ${ 
					// !props.handleToggle$ ? "noTab" : ""
					!props.tab ? "noTab" : ""
				}`}
				onClick$={() => {
					// console.log(
					// 	"modal #" + props.index + " clicked:",
					// 	!click.inside
					// 		? "click outside: running handleClose"
					// 		: "click inside: no handleClose"
					// );
					if (click.inside) click.inside = false;
					// else props.handleClose$();
					else handleClose();
				}}
			>
				{ props.tab ? (
				// {props.handleToggle$ ? (
					<div
						class={`spacer tab ${props.modal.show ? "showing" : ""}`}
						onClick$={() => {
							// console.log("tab clicked", props.index);
							click.inside = true;
							// props.handleToggle$();
							handleToggle();
						}}
					>
						<div class="tab-text">
							{props.modal.show ? "/\\ " : "\\/ "}Add An Item
						</div>
					</div>
				) : (
					<div class={props.modal.show ? "spacer" : ""}></div>
				)}
				<div
					class={`body`}
					onClick$={() => {
						// console.log("body clicked", props.index);
						click.inside = true;
					}}
				>
					<div class="header-container">
						<button
							onClick$={() => {
								// console.log("x clicked", props.index);
								// props.handleClose$();
								handleClose();
							}}
							class="close"
						>
							X
						</button>
						<h1 class="header">Details</h1>
					</div>
					<Slot />
				</div>
			</aside>
		);
	}
);
