import {$, component$, useClientEffect$, useStore} from "@builder.io/qwik";


export const Notification = component$(({ thisNotification, remove$ }: {thisNotification: INotificationEach; remove$: () => void; }) => {
	const notification = useStore({
		...thisNotification,
		// message: thisNotification.message,
		// timeout: thisNotification.timeout,
		// id: thisNotification.id,
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
		<div class={`w-[600px] rounded ${notification.bgColor} flex flex-col`}>
			<button onClick$={() => remove$()} class="self-end text-red-600 hover:text-black">X</button>
			<p class="break-all self-start">
				{notification.message}
			</p>
		</div>
	);
});
