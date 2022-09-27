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
  const items = session.items.list.filter((item) => item?.owner === address);
  
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
  // const prevItem = session.details.item;
  const item = session.items.list.find((item) => item?.id === id);
  let stale: boolean = false; // probably don't need this...

  // if (prevItem?.id !== item.id) {
  //   stale = true;
  // }

  // console.log('details item is now', {item}, 'and was it stale?', {stale});

  session.details = {
    item, 
    show: true,
    stale,
  };
};

export const closeAll = (session: ISessionContext) => {
  session.store.show = false;
  session.details.show = false;
  session.create.show = false;
}
