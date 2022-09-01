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

export const Notification = component$(
	(props) => {
		const notification = useStore({
			...props.thisNotification,
		});
		console.log('NOTIFICATION: rendering:', {notification});


		const remove = $(() => {
			// splice out our notification from the parent list
			console.log('~~NOTIFICATION: parent store before remove:', props.store);
			props.store.each.splice(notification.index, 1);
			console.log('~~NOTIFICATION: parent store after remove:', props.store);

			// // remove the index matching ours from original store
			// const newNotificationsArray = store.each
			// 	.filter(eachNotification => eachNotification.index !== notification.index)

			// // set store to new list (without ours)
			// store.each = newNotificationsArray;
		})

		useClientEffect$(() => {
			if (notification.timeout === 0 || !notification.timeout) return;

			const timer = setTimeout(() => {
				console.log("~~~~NOTIFICATION: timeout, running remove");
				remove();
				// notification.message = "";
				// remove this index from the original store
				// _store.notifications.splice(props.index, 1);
			}, notification.timeoutMs);

			return () => clearInterval(timer);
		});



		return notification.message !== "" ? (
			<div>
				<h3>NEW NOTIFICATION</h3>
				<p 
					class={`w-[600px] rounded ${
						notification.type === "error" 
						? 'bg-red-200' 
						: notification.type === "success"
						? 'bg-green-200'
						: 'bg-blue-200'
					}`}
				>
					{notification.message}
				</p>
				<button 
					onClick$={() => remove()}
				>
					X
				</button>
			</div>
		) : null;
	}
);
