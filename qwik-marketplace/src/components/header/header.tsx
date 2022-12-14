import {
	component$,
	useClientEffect$,
	useContext,
	useStore,
	useStyles$,
} from "@builder.io/qwik";

import {SessionContext} from "~/libs/context";
import {closeAll, shortAddress} from "~/libs/utils";

import {QwikLogo} from "../icons/qwik";
import {Link, useLocation} from "@builder.io/qwik-city";
import { EthLogo } from "../icons/eth";

export default component$(() => {
	const loc = useLocation();
	const session = useContext(SessionContext);
	const state = useStore({fullAddress: false, inFront: false});
	// console.log({loc});

	// 
	useClientEffect$(({track}) => {
		track(session, "address");

		if (session.address === "") return;
		const timer = setTimeout(() => {
			state.inFront = true;
		}, 200);

		return () => clearTimeout(timer);
	});

	return (
		<header
			class={`bg-qwikBlue-dark w-full flex items-center h-20 backdrop-blur bg-opacity-70 fixed top-0 px-2 ${
				state.inFront && "z-10"
			}`}
		>
			<div class="flex justify-between items-end m-auto w-full max-w-[800px] text-[2rem] pt-1">
				<div class="justify-self-start grid grid-flow-col h-full gap-2 md:gap-6">
					{/* <Link
						href="/flower"
						class=" transition-all duration-100 rounded bg-white bg-opacity-0 hover:bg-opacity-30 hover:backdrop-blur flex items-end mr-auto px-1 my-[-4px] md:my-0"
					>
						<QwikLogo />
					</Link> */}
					<div class="h-[60px]">
						<EthLogo />
					</div>
					{loc.pathname === "/" ? (
						<h1
							// class="font-bold text-white cursor-pointer transition-all duration-100 rounded bg-white bg-opacity-0 hover:bg-opacity-30 hover:backdrop-blur px-1 my-[-4px] md:my-0"
							class="font-bold text-white cursor-pointer pt-1"
							onClick$={() => closeAll(session)}
						>
							Marketplace
						</h1>
					) : (
						<Link
							href="/"
							// class="font-bold text-white cursor-pointer text-[2rem] transition-all duration-100 rounded bg-white bg-opacity-0 hover:bg-opacity-30 hover:backdrop-blur"
							class="font-bold text-white cursor-pointer text-[2rem] pt-1" >
							Marketplace
						</Link>
					)}
				</div>
				{session.address && (
					<>
					{/* large screens */}
						<div
							key={0}
							onClick$={() => (state.fullAddress = !state.fullAddress)}
							class="text-white text-base self-center cursor-pointer w-min text-right hidden md:block md:z-0 z-10"
						>
							Welcome,{" "}
							{state.fullAddress
								? session.address
								: shortAddress(session.address)}
						</div>
					{/* small screens */}
						<div key={1} class="text-white text-base self-center w-min text-right block md:hidden z-0 md:z-10">
							Welcome,{" "} {shortAddress(session.address)}
						</div>
					</>
				)}
			</div>
		</header>
	);
});
