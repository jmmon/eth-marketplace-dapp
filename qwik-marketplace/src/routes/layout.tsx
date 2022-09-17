declare var window: any;
import {
	component$,
	Slot,
	useClientEffect$,
	useContextProvider,
	useStore,
} from "@builder.io/qwik";
import {RequestHandler, useEndpoint} from "@builder.io/qwik-city";
import Footer from "../components/footer/footer";
import Header from "../components/header/header";
import { SessionContext } from "~/libs/context";
import { Notifications } from "~/components/notifications/notifications";
import Connect from "~/components/connect/connect";


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
		store: {
			show: false,
			address: '',
			items: [],
		},
		notifications: {
			each: [],
			nextIndex: 0,
		},
	} as ISessionContext,
	{recursive: true});

	useContextProvider(SessionContext, session);

	
	useClientEffect$(async () => {
		session.isBrowser = true;
		if (typeof window.ethereum === 'undefined') {
			session.unlocked = false;
			session.address = undefined;
		}
	})

	return (
		<div>
			<Header />
			<Connect />
			<main>
				<Slot />
			</main>
			<Notifications />
		</div>
	);
});

