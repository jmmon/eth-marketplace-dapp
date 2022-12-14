export const shortText = (text: string, length: number = 20): string =>
  text.length <= length
    ? text
    : text
        .slice(0, length - 3)
        .trim()
        .concat("...");

export const shortAddress = (address: string) =>
  String.prototype.concat(address.slice(0, 5), "...", address.slice(-4));

export const seeStore = (address: string, session: ISessionContext) => {
  // filter our items to find all created by a given address
  const items = session.items.all.filter((item) => item?.owner === address);
  
  // hide details page, and set and show store page
  session.details.show = false;
	session.store = {
    items, 
    address, 
    show: true
  };
};

export const seeDetails = (id: string, session: ISessionContext) => {
  session.store.show = false;

  // search our already fetched items for the matching one
  const item = session.items.all.find((item) => item?.id === id);

  session.details = {
    item, 
    show: true,
  };
};

export const closeAll = (session: ISessionContext) => {
  session.store.show = false;
  session.details.show = false;
  session.create.show = false;
}
