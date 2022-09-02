import {$, component$, useClientEffect$, useStore} from "@builder.io/qwik";

// interface IPropTypes {
// 	notifications: store;
// 	index: number;
// 	timeoutMs?: number;
// 	bgColor: string
// }

/* props: 
	store: notifications store,
	index: index of this notification
	thisNotification: {
			message,
			type,
			index,
			timeout
	}



*/



export const Notification = component$(({ thisNotification, remove$ }) => {
	const notification = useStore({
		// ...thisNotification,
		message: thisNotification.message,
		timeout: thisNotification.timeout,
		id: thisNotification.id,
		bgColor: thisNotification.type === "error"
		? "bg-red-200"
		: thisNotification.type === "warning"
		? "bg-orange-200"
		: thisNotification.type === "success"
		? "bg-green-200"
		: "bg-blue-200",			
	});


	useClientEffect$(() => {
		// console.log("NOTIFICATION: rendering:", {notification});
		if (notification.timeout === 0 || !notification.timeout) return;

		const timer = setTimeout(() => {
			// console.log("~~~~NOTIFICATION: timeout, running remove");
			remove$();
		}, notification.timeout);

		return () => clearTimeout(timer);
	});

	return(
		<div class={`w-[600px] rounded ${notification.bgColor} flex content-between`}>
			<p class="flex-grow">
				{notification.message}
			</p>
			<button onClick$={() => remove$()} class="text-red-600 hover:text-black">X</button>
		</div>
	);
});
