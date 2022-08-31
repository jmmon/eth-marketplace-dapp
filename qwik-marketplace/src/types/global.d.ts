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

declare interface IFormStore {
	photo: object;
	price: number;
	name: string;
	description: string;
	submit: boolean;
}