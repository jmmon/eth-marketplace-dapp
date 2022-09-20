import {component$, useContext, useStore, useStyles$} from "@builder.io/qwik";
import styles from "./header.css?inline";

import {SessionContext} from "~/libs/context";
import {handleConnect} from "~/libs/ethUtils";
import { shortAddress } from "~/libs/utils";

import { QwikLogo } from '../icons/qwik';


export default component$(() => {
	const session = useContext(SessionContext);
	useStyles$(styles);
	const store = useStore({fullAddress: false});

	return (
		<header>
			<div class="header-inner">
        <QwikLogo class="justify-self-start"/>
				<h1 class="justify-self-start">Marketplace</h1>
				{session.address && (
					<div onClick$={() => store.fullAddress = !store.fullAddress} class="text-red-200 justify-self-end pt-2 cursor-pointer">
						Welcome,{" "}
						{store.fullAddress? session.address : shortAddress(session.address)}
					</div>
				)}
			</div>
		</header>
	);
});
