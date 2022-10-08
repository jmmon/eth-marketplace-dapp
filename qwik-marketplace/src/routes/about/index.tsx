import {component$} from "@builder.io/qwik";

export default component$(() => {
	return (
		<section class="my-6 flex flex-col text-sm md:text-lg">
			<div class="mx-auto grid w-[60ch] min-w-[300px] max-w-[80%] gap-6 md:gap-12">
				<h1 class="text-center text-3xl md:text-5xl lg:text-6xl text-blue-800 mx-auto">
					About This App
				</h1>
				<div class="grid gap-4">
					<h2 class="text-center text-2xl md:text-3xl">What can this do?</h2>
					<p>
						When you log in with a Metamask wallet, you may purchase items and
						see the owner addresses of the items, and you may also add an item
						yourself. If you own an item, you can also delete it from the
						marketplace.
					</p>
				</div>
				<div class="grid gap-4">
					<h2 class="text-center text-2xl md:text-3xl">How does it do it?</h2>
					<p>
						This app combines the power of blockchain smart contracts,
						decentralized storage, and the fastest-loading web framework to
						create a cool marketplace app.
					</p>
					<p>
						Ethereum is the backbone of the marketplace. A smart contract is
						used to store references to the list of items in the blockchain. The
						contract is the controller of the base marketplace layer.
					</p>
					<p>
						To save on Ethereum fees, the item references stored in the
						blockchain are kept small, holding just price, the owner, the data
						reference hash for item data lookup, and an ID hash for item lookup.
						The data hash is an IPFS location hash that points to the other data
						for the item, like description and the image hash (the image is also
						stored in IPFS).
					</p>
					<p>
						To tie it all together in a seamless experience, Qwik is used to
						build the frontend. Qwik is able to precisely prefetch only the code
						that is needed, making for instant website startup and instant
						interactivity for the user on startup. As the user interacts with
						more of the website, Qwik will continue to prefetch the pieces that
						might be needed, while refraining from actually running those bits
						of code until the user actually interacts with that part of the
						page. This fine-grained downloading and execution results in a
						lightning-fast user experience.
					</p>
				</div>
				<div class="grid gap-4">
					<h2 class="text-center text-2xl md:text-3xl">Note on IPFS data</h2>
					<p>Because this currently only maintains an IPFS node on the client, the item data stored in IPFS may become lost when changing sessions.</p>

				</div>
			</div>
		</section>
	);
});
