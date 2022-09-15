import {
	component$,
	Slot,
	useClientEffect$,
	useContextProvider,
	useStore,
	$,
} from "@builder.io/qwik";
import {RequestHandler, useEndpoint} from "@builder.io/qwik-city";
import Footer from "../components/footer/footer";
import Header from "../components/header/header";
import { SessionContext } from "~/libs/context";


	//display metamask login
	// once logged in, run an interval to check check if the account changes?
	// save loggedIn or connected context for other components

export default component$(() => {
	const session = useStore({
		connected: false, 
		loggedIn: false, 
		address: '',
		unlocked: false,
	} as ISessionContext);

	useContextProvider(SessionContext, session);


	const handleConnect$ = $(async () => {
		// log in with ethereum
		const ethereum = window.ethereum;
		try {
			// check if unlocked
			const accounts = await ethereum.request({
				method: "eth_requestAccounts",
			});

			//save accounts to our store
			session.unlocked = true;
			session.address = accounts[0];

	
		} catch (error) {
			console.log('Error connecting metamask:', error.message);
		}
	});

	useClientEffect$(async () => {
		if (typeof web3 === 'undefined') {
			session.unlocked = false;
		}

		session.address = (await window.ethereum.request({ method: 'eth_accounts' }))[0];
		console.log('address:', session.address);
		const accountInterval = setInterval(async () => {
			const address = (await window.ethereum.request({ method: 'eth_accounts' }))[0];
			if (address !== session.address && session.address !== "undefined") {
				console.log('new address:', session.address);
				session.address = address;
				location.reload();
			}
		}, 1000);

		return () => clearInterval(accountInterval);
	})

	return (
		<div>
			{!session.unlocked  && <Header connect$={handleConnect$} />}
			<main>
				<Slot />
			</main>
			<Footer />
		</div>
	);
});

