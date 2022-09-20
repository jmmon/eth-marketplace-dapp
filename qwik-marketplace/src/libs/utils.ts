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
  console.log("seeStore: opening store for ", address);

  session.details.show = false;

  // session.store.address = address;
  // session.store.show = true;
	session.store = {address, show: true};
	// session.store.stale = true;
};

export const seeDetails = (id: string, session: ISessionContext) => {
  const thisItem = session.browse.items.find((item) => item?.id === id);
  console.log("see details button: showing item:", { id, session, thisItem });

  session.store.show = false;

  session.details.item = thisItem;
  session.details.show = true;
};
