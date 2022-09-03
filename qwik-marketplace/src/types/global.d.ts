declare interface IItem {
	owner: string;
	ipfsHash: string;
	price: string | number;
 	id: string;
}

declare interface IItemData {
	price: string;
	name: string;
	description: string;
	imgHash: string;
}

declare interface INotifications {
	each: object;
	nextIndex: number;
}


// // maybe try swapping "each" back to an array?? later...
declare interface INotificationEach {
	message: string;
	type: string;
	id: number;
	timeout: number;
}