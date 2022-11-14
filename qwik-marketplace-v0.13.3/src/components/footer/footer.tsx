import {component$} from "@builder.io/qwik";
import {Link} from "@builder.io/qwik-city";

export default component$(() => {
	const linkStyles = "text-blue-400 underline hover:text-blue-600";
	return (
		<footer class="flex flex-col items-center gap-2 p-4 text-gray-700">
			<div class="grid grid-flow-col gap-4">
				<Link href="/" class={`${linkStyles}`}>
					Home
				</Link>

				<Link href="/about" class={`${linkStyles}`}>
					About
				</Link>
			</div>
			<div>Powered By Ethereum, IPFS, and Qwik</div>
		</footer>
	);
});
