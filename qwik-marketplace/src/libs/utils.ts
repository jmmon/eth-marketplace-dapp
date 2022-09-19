export const shortText = (text: string, length: number = 20): string => {
	console.log('text length:', text.length);
	console.log('length:', length);
	if (text.length <= length) return text;
	return text.slice(
		0,
		length - 3,
	)
	.trim()
	.concat("...")
}

export const shortAddress = (address: string) => {
	return (String.prototype.concat(
		address.slice(0, 5),
		"...",
		address.slice(-4)
	))
};

export const seeStore = (address: string, session: ISessionContext) => {
	console.log("seeStore: opening store for ", address);
	session.details = {
		...session.details,
		show: false,
	};
	session.store = {
		...session.store,
		show: true,
		address,
		stale: true,
	};
};

export const seeDetails = (id: string, session: ISessionContext) => {
	const thisItem = session.items.find((item) => item?.id === id);
	console.log("see details button: showing item:", {id, session, thisItem});
	session.store = {
		...session.store,
		show: false,
	};
	session.details = {
		item: thisItem,
		show: true,
	};
};