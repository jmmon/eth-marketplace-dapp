import {component$, useContext, useStyles$} from "@builder.io/qwik";
import styles from "./header.css?inline";

import {SessionContext} from "~/libs/context";
import {handleConnect} from "~/libs/ethUtils";

export default component$(() => {
	const session = useContext(SessionContext);
	useStyles$(styles);

	return (
		<header>
			<div class="header-inner">
				<h1>Marketplace</h1>
				{session.address && (
					<div class="text-red-200 justify-end pt-2">
						Welcome,{" "}
						{String.prototype.concat(
							session.address.slice(0, 5),
							"...",
							session.address.slice(-4)
						)}
					</div>
				)}
			</div>
		</header>
	);
});
