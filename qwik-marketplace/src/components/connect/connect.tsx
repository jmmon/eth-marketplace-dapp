import {component$, useContext, useStylesScoped$} from "@builder.io/qwik";
import { SessionContext } from "~/libs/context";
import { handleConnect } from "~/libs/ethUtils";
import Styles from "./connect.css?inline";

export default component$(() => {
  const session = useContext(SessionContext);
	useStylesScoped$(Styles);

	return (
		<div class={`connector ${!session.address && "showing"}`}>
			<button onClick$={() => handleConnect(session)}>Connect Metamask</button>
			<div class="text">Connect With Your Metamask Wallet To Buy Items</div>
		</div>
	);
});
