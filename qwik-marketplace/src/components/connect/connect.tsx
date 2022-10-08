import {component$, useContext} from "@builder.io/qwik";
import {SessionContext} from "~/libs/context";
import {connectMetamask, metamaskConnect, metamaskInit} from "~/libs/ethUtils";

export default component$(() => {
	const session = useContext(SessionContext);
	const container = `rounded pr-[1vw] py-0 relative justify-self-center flex gap-2 items-center bg-white ml-[1vw] h-[70px] max-w-[54vw] transition-all duration-200 bg-opacity-0 md:bg-opacity-100`

	return (
		<div class={`${container} ${!session.address ? "opacity-100 top-0" : "opacity-0 top-[-4.5rem]"}`}>
			<button
				class="m-1 p-2 border border-gray-400 rounded bg-gray-200 shadow-md hover:shadow-sm hover:bg-gray-300 w-min px-3 text-gray-700 mr-[-2px] md:mr-0"
				onClick$={() => connectMetamask(session)}
				// onClick$={() => metamaskConnect(session)}
			>
				Connect Metamask
			</button>
			<div class="hidden md:inline text-lg text-gray-700">Connect With Your Metamask Wallet To Buy Items</div>
		</div>
	);
});
