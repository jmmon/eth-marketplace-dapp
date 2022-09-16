import {
	$,
	component$,
	createContext,
	useClientEffect$,
	useContext,
	useContextProvider,
	useResource$,
	useStore,
} from "@builder.io/qwik";
import type {DocumentHead} from "@builder.io/qwik-city";
import Browse from "~/components/browse/browse";
import Create from "~/components/create/create";
import Details from "~/components/details/details";
import { SessionContext } from "~/libs/context";

export default component$(() => {
	const session = useContext(SessionContext); // our connected/logged in state
	useClientEffect$(() => console.log('session:', {session}));

	return (
		<div>
			{session.address &&  <Create />}

			{session.details.show && <Details session={session}/>}


			<Browse showItem$={showItem$} />
		</div>
	);
});

export const showItem$ = $((id: string, session: object) => {
	console.log({session});
	console.log('showing item, id:', id);
	const thisItem = session.items.find(item => item?.id === id);
	console.log({thisItem});

	session.details.item = thisItem ?? null;
	session.details.show = true;
})


export const head: DocumentHead = {
	title: "Marketplace",
};
