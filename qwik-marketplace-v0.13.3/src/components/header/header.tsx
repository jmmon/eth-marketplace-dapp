import {
	component$,
	useVisibleTask$,
	useContext,
	useStore,
} from "@builder.io/qwik";

import {SessionContext} from "~/libs/context";
import {closeAll, shortAddress} from "~/libs/utils";
import {Link, useLocation} from "@builder.io/qwik-city";
import {EthLogo} from "../icons/eth";

export default component$(() => {
	const loc = useLocation();
	const session = useContext(SessionContext);
	const state = useStore({fullAddress: false, inFront: false});
  //console.log('header component:', {loc});

	useVisibleTask$(({track}) => {
		track(() => session.address);

		if (session.address === "") return;

		const timer = setTimeout(() => {
			state.inFront = true;
		}, 200);

		return () => clearTimeout(timer);
	});

	return (
		<header
			class={`bg-qwikBlue-dark fixed top-0 flex h-20 w-full items-center bg-opacity-70 px-2 backdrop-blur ${
				state.inFront && "z-10"
			}`}
		>
			<div class="m-auto flex w-full max-w-[800px] items-end justify-between pt-1 text-[2rem]">
				<div class="grid h-full grid-flow-col gap-2 justify-self-start md:gap-6">
					{/* <Link
						href="/flower"
						class=" transition-all duration-100 rounded bg-white bg-opacity-0 hover:bg-opacity-30 hover:backdrop-blur flex items-end mr-auto px-1 my-[-4px] md:my-0"
					>
						<QwikLogo />
					</Link> */}
					<div class="h-[60px]">
						<EthLogo />
					</div>
					{loc.url.pathname === "/" ? (
						<h1
							// class="font-bold text-white cursor-pointer transition-all duration-100 rounded bg-white bg-opacity-0 hover:bg-opacity-30 hover:backdrop-blur px-1 my-[-4px] md:my-0"
							class="cursor-pointer pt-1 font-bold text-white"
							onClick$={() => closeAll(session)}
						>
							Marketplace
						</h1>
					) : (
						<Link
							href="/"
							// class="font-bold text-white cursor-pointer text-[2rem] transition-all duration-100 rounded bg-white bg-opacity-0 hover:bg-opacity-30 hover:backdrop-blur"
							class="cursor-pointer pt-1 text-[2rem] font-bold text-white"
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
							onClick$={() => (state.fullAddress = !state.fullAddress)}
							class="z-10 hidden w-min cursor-pointer self-center text-right text-base text-white md:z-0 md:block"
						>
							Welcome,{" "}
							{state.fullAddress
								? session.address
								: shortAddress(session.address)}
						</div>
						{/* small screens */}
						<div
							key={1}
							class="z-0 block w-min self-center text-right text-base text-white md:z-10 md:hidden"
						>
							Welcome, {shortAddress(session.address)}
						</div>
					</>
				)}
			</div>
		</header>
	);
});
