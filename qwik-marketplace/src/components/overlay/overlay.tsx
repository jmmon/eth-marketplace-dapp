import {component$, 
	// useContext, 
	useStylesScoped$} from "@builder.io/qwik";
// import { SessionContext } from "~/libs/context";
import Connect from "../connect/connect";
import { Notifications } from "../notifications/notifications";
import Styles from "./overlay.css?inline";

export const Overlay = component$(() => {
	// const session = useContext(SessionContext);
	useStylesScoped$(Styles);

	return (
		<div class={`overlay`}>
			{/* (testing overlay) */}
			<Connect />
			<Notifications />
		</div>
	);
})