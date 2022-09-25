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

export default component$(() => {
	const loc = useLocation();
	const session = useContext(SessionContext);
	const store = useStore({fullAddress: false, inFront: false});
	console.log({loc});

	useClientEffect$(({track}) => {
		track(session, "address");

		if (session.address === "") return;
		const timer = setTimeout(() => {
			store.inFront = true;
		}, 200);

		return () => clearTimeout(timer);
	});

	return (
		<header
			class={`bg-qwikBlue-dark w-full flex items-center h-20 backdrop-blur bg-opacity-70 fixed top-0 ${
				store.inFront && "z-10"
			}`}
		>
			<div class="flex justify-between items-end m-auto w-full max-w-[800px] text-[2rem] px-2 pt-1 md:px-0 md:pt-0">
				<div class="justify-self-start grid grid-flow-row md:grid-flow-col h-full gap-0 md:gap-2">
					<Link
						href="/flower"
						class=" transition-all duration-100 rounded bg-white bg-opacity-0 hover:bg-opacity-30 hover:backdrop-blur flex items-end mr-auto px-1 my-[-4px] md:my-0"
					>
						<QwikLogo />
					</Link>
					{loc.pathname === "/" ? (
						<h1
							class="font-bold text-white cursor-pointer transition-all duration-100 rounded bg-white bg-opacity-0 hover:bg-opacity-30 hover:backdrop-blur px-1 my-[-4px] md:my-0"
							onClick$={() => closeAll(session)}
						>
							Marketplace
						</h1>
					) : (
						<Link
							href="/"
							class="font-bold text-white cursor-pointer text-[2rem] transition-all duration-100 rounded bg-white bg-opacity-0 hover:bg-opacity-30 hover:backdrop-blur"
						>
							Marketplace
						</Link>
					)}
				</div>
				{session.address && (
					<>
					{/* large screens */}
						<div
							key={0}
							onClick$={() => (store.fullAddress = !store.fullAddress)}
							class="text-white text-base self-center cursor-pointer w-min text-right hidden md:block md:z-0 z-10"
						>
							Welcome,{" "}
							{store.fullAddress
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
