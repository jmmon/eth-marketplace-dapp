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

export const Notification = component$(({store, thisNotification}) => {
	const notification = useStore({
		...thisNotification,
		bgColor:
			notification.type === "error"
				? "bg-red-200"
				: notification.type === "warning"
				? "bg-orange-200"
				: notification.type === "success"
				? "bg-green-200"
				: "bg-blue-200",
	});
	console.log("NOTIFICATION: rendering:", {notification});

	const remove = $(() => {
		// splice out our notification from the parent list
		console.log("~~NOTIFICATION: parent store before remove:", store);

		const adjustedNotifications = store.each.splice(notification.index, 1);
		store.each = adjustedNotifications;

		console.log("~~NOTIFICATION: parent store after remove:", store);
		
	});

	useClientEffect$(() => {
		if (notification.timeout === 0 || !notification.timeout) return;

		const timer = setTimeout(() => {
			console.log("~~~~NOTIFICATION: timeout, running remove");
			remove();
		}, notification.timeoutMs);

		return () => clearInterval(timer);
	});

	return notification.message !== "" ? (
		<div>
			<h3>NEW NOTIFICATION</h3>
			<p class={`w-[600px] rounded ${notification.bgColor}`}>
				{notification.message}
			</p>
			<button onClick$={() => remove()}>X</button>
		</div>
	) : null;
});
