declare interface IContractItem {
	owner: string;
	ipfsHash: string;
	price: string | number | object;
 	id: string;
}

declare interface IItemData {
	price: string;
	name: string;
	description: string;
	imgHash: string;
	owner: string;
	ipfsHash: string;
	id: string;
	imgUrl: string;
}

declare interface INotifications {
	each: INotificationsEach[];
	nextIndex: number;
}


// // maybe try swapping "each" back to an array?? later...
declare interface INotificationsEach {
	message: string;
	type: string;
	id: number;
	timeout: number;
}

declare interface ISessionContext {
	address?: string;
	unlocked?: boolean;
	isBrowser?: boolean;
	items: IContractItem[];
	notifications: INotifications;
	test: number;
}