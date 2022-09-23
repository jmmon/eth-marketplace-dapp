import {$, component$, useClientEffect$, useContext, useStore, useStyles$} from "@builder.io/qwik";
import styles from "./header.css?inline";

import {SessionContext} from "~/libs/context";
import {handleConnect} from "~/libs/ethUtils";
import {closeAll, shortAddress} from "~/libs/utils";

import {QwikLogo} from "../icons/qwik";
import {Link, useLocation} from "@builder.io/qwik-city";

export default component$(() => {
	const loc = useLocation();
	const session = useContext(SessionContext);
	useStyles$(styles);
	const store = useStore({fullAddress: false, inFront: false,});
	console.log({loc});


	// const store = useStore({behind: false});


	useClientEffect$(({track}) => {
		track(session, "address");

		if (session.address === "") return;
		const timer = setTimeout(() => {
			store.inFront = true;
		}, 200);

		return () => clearTimeout(timer);
	})

	return (
		<header class={`bg-qwikBlue-dark w-full h-20 backdrop-blur bg-opacity-70 fixed top-0 ${store.inFront && "inFront"}`}>
			<div class="header-inner">
				<div class="justify-self-start grid grid-flow-col h-full">
					<Link href="/flower" class="p-2 transition-all duration-100 rounded bg-white bg-opacity-0 hover:bg-opacity-30 hover:backdrop-blur flex items-end">
						<QwikLogo />
					</Link>
					{loc.pathname === "/" ?
					(<h1
						class="font-bold text-white cursor-pointer p-2  transition-all duration-100 rounded bg-white bg-opacity-0 hover:bg-opacity-30 hover:backdrop-blur"
						onClick$={() => closeAll(session)}
					>
						Marketplace
					</h1>) : 
					(<Link href="/" class="font-bold text-white cursor-pointer text-[2rem] p-2 transition-all duration-100 rounded bg-white bg-opacity-0 hover:bg-opacity-30 hover:backdrop-blur" >Marketplace</Link>)}
				</div>
				{session.address && (
					<div
						onClick$={() => (store.fullAddress = !store.fullAddress)}
						class="text-white text-lg self-center cursor-pointer w-min text-right"
					>
						Welcome,{" "}
						{store.fullAddress
							? session.address
							: shortAddress(session.address)}
					</div>
				)}
			</div>
		</header>
	);
});
