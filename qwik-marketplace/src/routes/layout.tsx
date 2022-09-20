declare var window: any;
import {
	component$,
	Slot,
	useClientEffect$,
	useContextProvider,
	useStore,
	useWatch$,
} from "@builder.io/qwik";
import {RequestHandler, useEndpoint} from "@builder.io/qwik-city";
// import Footer from "../components/footer/footer";
import Header from "../components/header/header";
import { SessionContext } from "~/libs/context";
import { Notifications } from "~/components/notifications/notifications";
import Connect from "~/components/connect/connect";

export default component$(() => {
	const session = useStore({
		address: '',
		isBrowser: false,
		showCreate: false,
		create: {
			show: false,
			note: {
				message: '',
				class: '',
			},
		},
		browse: {
			items: [],
			stale: false,
		},
		details: {
			show: false,
			item: null,
		},
		store: {
			show: false,
			address: '',
			items: [],
			stale: false,
		},
		notifications: {
			each: [],
			nextIndex: 0,
		},
	} as ISessionContext,
	{recursive: true});

	useContextProvider(SessionContext, session);

	//debugging:
	useWatch$(({track}) => {
		track(session);
		console.log('session changed:', session);
	})

	
	useClientEffect$(async () => {
		session.isBrowser = true;
		if (typeof window.ethereum === 'undefined') {
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
