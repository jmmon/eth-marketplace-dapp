import {component$, useContext} from "@builder.io/qwik";
import {SessionContext} from "~/libs/context";
import {handleConnect} from "~/libs/ethUtils";

export default component$(() => {
	const session = useContext(SessionContext);
	
	return (
		<div class={`px-[min(1vw,0.5rem)] py-0 relative justify-self-center flex gap-2 items-center bg-white ml-[1vw] h-[70px] max-w-[54vw] transition-all duration-200 ${!session.address ? "opacity-100 top-0" : "opacity-0 top-[-4.5rem]"}`}>
			<button
				class="m-1 p-2 border border-gray-400 rounded bg-gray-200 shadow-md hover:shadow-sm hover:bg-gray-300 w-min md:w-auto"
				onClick$={() => handleConnect(session)}
			>
				Connect Metamask
			</button>
			<div class="hidden md:inline">Connect With Your Metamask Wallet To Buy Items</div>
		</div>
	);
});
