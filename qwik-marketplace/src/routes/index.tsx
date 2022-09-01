import {
	component$,
	createContext,
	useClientEffect$,
	useContext,
	useContextProvider,
	useResource$,
	useStore,
} from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

interface IMetamaskStore {
	hasMetamask: boolean;
	error: undefined | string;
	account: string;
	blockNumber: number;
	provider: undefined | object;
}

export const MyContext = createContext("my-context");

export default component$(() => {
	const metamask = useStore<IMetamaskStore>({
		hasMetamask: true, // will check and switch to false if needed
		error: undefined,
		account: "",
		blockNumber: -1,
		provider: undefined,
	});

	// context should hold metamask logged in info, account;
	// for site-wide metamask integration
	useContextProvider(MyContext, metamask);

	useClientEffect$(async () => {
		const { default: detectProvider } = await import(
			"@metamask/detect-provider"
		);

		//check for web3 provider
		const provider = await detectProvider();
		console.log("typeof provider", typeof provider);

		// if there's no web3 provider
		if (!provider) {
			// no metamask detected
			metamask.hasMetamask = false;
			metamask.error =
				"Error: Metamask not detected. You may browse products, but you may not purchase any products without using Metamask.";
			return;
		}

		// if there's a web3 provider that's not metamask
		if (provider !== window.ethereum) {
			metamask.error =
				"Error: Metamask not selected as provider. Maybe you have multiple wallets installed?";
			return;
		}

		// first try to see if metamask is already connected?
		// if not, try showing the log in button.

		// Successfully logged in, do stuff!
		const ethereum = window.ethereum;
		const accounts = await ethereum.request({
			method: "eth_requestAccounts",
		});
		metamask.account = accounts[0];

		const chainId = await ethereum.request({
			method: "eth_chainId",
		});
		console.log({ chainId });
	});

	const handleConnect = $(async () => {
		// log in with ethereum
		const ethereum = window.ethereum;
		try {
			// check if unlocked
			const accounts = await ethereum.request({
				method: "eth_requestAccounts",
			});
			//save accounts to our store
			metamask.account = accounts[0];
			console.log('account:', metamask.account);
			
		} catch (error) {
			metamask.error = error.message;
		}
	});

	return (
		<div>
			<h1 class="pb-2 text-lg">Welcome to Qwik City</h1>

			{!metamask.account && (
				<button
					class="bg-gray-200 hover:bg-sky-100 rounded p-2"
					onClick$={handleConnect}
				>
					Connect Metamask
				</button>
			)}

			{metamask.account && (
				<div class="bg-green-200 p-2 rounded">
					<p>You have connected Metamask! Here's your account:</p>
					<ul>
						<li>{metamask.account}</li>
					</ul>
				</div>
			)}

			{metamask.error && (
				<div class="bg-red-200 p-2 rounded">
					<p>{metamask.error}</p>
					<button onCLick$={() => (metamask.error = undefined)}>
						X
					</button>
				</div>
			)}

			{metamask.blockNumber > 0 && (
				<p>Found block number {metamask.blockNumber} from etherjs!</p>
			)}

			<p>The meta-framework for Qwik.</p>
      <br/>
      <br/>
      <Marketplace />
		</div>
	);
});

export const Marketplace = component$((props) => {
	const context = useContext(MyContext);

	// has to fetch the data from the contract;
	// then each item has to fetch the data from IPFS
	return (
		<div>
			<h1>The marketplace</h1>
			<div>Some products</div>
			{Object.keys(context).map((key) => {
        return (<div>{key}: {context[key]}</div>);
      })}
		</div>
	);
});

export const Item = component$((props) => {
	const context = useContext(MyContext);

	const itemResource = useResource$(({track, cleanup}) => {

	});
	return (
		<div>
			<div>Image</div>
			<div></div>
		</div>
	);
})








export const head: DocumentHead = {
	title: "Marketplace",
};
