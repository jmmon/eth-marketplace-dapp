import {component$, useClientEffect$, useContext, useStore, useStylesScoped$} from "@builder.io/qwik";
import { SessionContext } from "~/libs/context";
import { handleConnect } from "~/libs/ethUtils";
import Styles from "./connect.css?inline";

export default component$(() => {
  const session = useContext(SessionContext);
	useStylesScoped$(Styles);



	return (
		<div class={`connector ${!session.address && "showing"}`}>
			<button 
			class="m-1 p-2 border border-gray-400 rounded bg-gray-200 shadow-md hover:shadow-sm hover:bg-white"
			onClick$={() => handleConnect(session)}>Connect Metamask</button>
			<div class="text">Connect With Your Metamask Wallet To Buy Items</div>
		</div>
	);
});
