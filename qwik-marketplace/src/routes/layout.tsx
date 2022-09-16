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
import { connect, getContract } from "~/libs/ethUtils";
import { Notifications } from "~/components/notifications/notifications";


//display metamask login
// once logged in, run an interval to check check if the account changes?
// save loggedIn or connected context for other components


export default component$(() => {
	const session = useStore({
		address: '',
		unlocked: false,
		isBrowser: false,
		items: [],
		details: {
			show: false,
			item: null,
		},
		notifications: {
			each: [],
			nextIndex: 0,
		},
		test: 0
	} as ISessionContext,
	{recursive: true});

	useContextProvider(SessionContext, session);

	const startWatchAddress = $(async () => {
		session.address = (await window.ethereum.request({ method: 'eth_accounts' }))[0];
		console.log('address:', session.address);
		const accountInterval = setInterval(async () => {
			console.log('account interval');
			const address = (await window.ethereum.request({ method: 'eth_accounts' }))[0];

			if (address !== session.address && session.address !== "undefined") {
				console.log('new address:', session.address);
				session.address = address;
				// location.reload();
			}

			if (!address) {
				if (session.address !== undefined) {
					console.log('no address now, clearing address from context');
				}
				session.address = undefined;
			}
		}, 1000);

		return () => clearInterval(accountInterval);
	});

	const handleConnect$ = $(async () => {
		try {
			// check if unlocked
			console.log('checking if unlocked from handleConnect');
			const address = (await window.ethereum.request({
				method: "eth_requestAccounts",
			}))[0];

			//save address to our store
			session.unlocked = true;
			session.address = address;

			startWatchAddress();
	
		} catch (error) {
			console.log('Error connecting metamask:', error.message);
		}
	});
	
	useClientEffect$(async () => {
		session.isBrowser = true;
		if (typeof window.ethereum === 'undefined') {
			session.unlocked = false;
			session.address = undefined;
		}
	})

	return (
		<div>
			<Header connect$={handleConnect$} />
			{/* <div>{session.test}</div> */}
			<main>
				<Slot />
			</main>
			<Notifications />
		</div>
	);
});

