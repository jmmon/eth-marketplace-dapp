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
				<div class="justify-self-start flex items-end gap-1">
        	<QwikLogo />
					<h1 class="font-bold" >Marketplace</h1>
				</div>
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
