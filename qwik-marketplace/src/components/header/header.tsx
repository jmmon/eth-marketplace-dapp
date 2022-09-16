import {component$, useContext, useStyles$} from "@builder.io/qwik";
import styles from "./header.css?inline";

import {SessionContext} from "~/libs/context";

export default component$(({connect$}) => {
	useStyles$(styles);
  const session = useContext(SessionContext);

	return (
		<header>
			<div class="header-inner">
				<h1>Marketplace</h1>
				<div class={`connector ${!session.address && 'showing'}`}>
					<button onClick$={connect$}>
						Connect Metamask
					</button>
					<div class="text">Connect With Your Metamask Wallet To Buy Items</div>
				</div>
			</div>
		</header>
	);
});
