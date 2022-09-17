import {component$, useContext, useStyles$} from "@builder.io/qwik";
import styles from "./header.css?inline";

import {SessionContext} from "~/libs/context";
import { handleConnect } from "~/libs/ethUtils";

export default component$(() => {
	useStyles$(styles);

	return (
		<header>
			<div class="header-inner">
				<h1>Marketplace</h1>
			</div>
		</header>
	);
});
