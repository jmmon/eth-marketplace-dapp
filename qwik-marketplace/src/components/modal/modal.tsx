import {component$, Slot, useStore, useStylesScoped$, useWatch$} from "@builder.io/qwik";
import Styles from "./modal.css?inline";

export const Modal = component$(
	(props: {modal: any; handleClose$: () => void}) => {
		useStylesScoped$(Styles);
		const click = useStore({inside: false});
		console.log('modal renders');
		useWatch$(({track}) => {
			track(props, 'store');
		console.log('modal show', props.modal.show);

		});

		useWatch$(({track}) => {
			track(click, 'inside');
			console.log('click.inside:', click.inside)
		})
		return (
			<aside
				class={`modal ${props.modal.show ? "showing bg-black backdrop-blur bg-opacity-10": "bg-transparent"}`}
				onClick$={() => {
					if (click.inside) click.inside = false;
					else props.handleClose$();
				}}
			>
				<div class="body" onClick$={() => { console.log('body click');click.inside = true}}>
					<div class="header container">
						<button onClick$={props.handleClose$} class="close">
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
