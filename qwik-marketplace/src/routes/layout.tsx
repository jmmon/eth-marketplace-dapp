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
import Connect from "~/components/connect/connect";
import {SessionContext} from "~/libs/context";
import {Notifications} from "~/components/notifications/notifications";

export default component$(() => {
	const session = useStore(
		{
			address: "", // address of the connected wallet
			// isBrowser: false, // set to true in useClientEffect... needed??
			create: { // create page
				show: false,
				note: {
					message: "",
					class: "",
				},
			},
			items: {
				stale: true,
				list: [],
			},
			details: { // details page
				show: false,
				item: null,
			},
			store: { // store page for particular address
				show: false,
				address: "",
				items: [],
			},
			notifications: { // notifications for various actions
				each: [],
				nextIndex: 0,
			},
		} as ISessionContext,
		{recursive: true}
	);

	useContextProvider(SessionContext, session);

	//debugging:
	// useWatch$(({track}) => {
	// 	track(session);
	// 	console.log("session changed:", session);
	// });

	// useClientEffect$(async () => {
	// 	session.isBrowser = true;
	// 	if (typeof window.ethereum === "undefined") {
	// 		session.address = undefined;
	// 	}
	// });

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
