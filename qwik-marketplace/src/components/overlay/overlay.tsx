import {component$, useStylesScoped$} from "@builder.io/qwik";
import Connect from "../connect/connect";
import { Notifications } from "../notifications/notifications";
import Styles from "./overlay.css?inline";

export const Overlay = component$(() => {
	useStylesScoped$(Styles);

	return (
		<div class="overlay">
			{/* (testing overlay) */}
			<Connect />
			<Notifications />
		</div>
	);
})