# Marketplace Smart Contract Project

## Built on Ethereum, with a Qwik client and using IPFS for item data storage

Connects to a marketplace smart contract on the Ethereum Goerli testnet, and stores and looks up data on a local IPFS node on your computer. If you want to run it entirely locally you can deploy a smart contract on a local Ethereum blockchain and adjust the libs/constants.ts to reflect the local contract address and ABI.

- (Install go-ipfs and) run `ipfs daemon` in one terminal window
- `cd qwik-marketplace` and `npm start` to start the qwik client in dev mode
- Note: Since Qwik is new and in beta, there is a bug preventing production builds of this app due to the Buffer polyfill used on the client. Once that bug is fixe

![Marketplace Homepage](https://user-images.githubusercontent.com/67028427/200962692-9afde788-90ea-413d-8214-47e4579f590f.png =500x500)

You'll see a toggle to show items with missing data. If this is connected to the Goerli testnet, the IPFS data is always stored locally so some items that were added previously may not have a valid IPFS data link anymore, so they are hidden by default.

If starting all locally, the toggle should do nothing since the local deployed smart contract should not have any items stored yet.

![Not logged in](https://user-images.githubusercontent.com/67028427/200963054-a9a627d4-bd42-4c84-b635-f22155e7ad69.png)

## Functionality

### Browse items and item details

![Logged in](https://user-images.githubusercontent.com/67028427/200963323-4f368c5c-c73e-4e33-8e31-d4dbc6fd53e7.png)

If not logged in, you can view items on the marketplace, and view details of each item. If no items are listed, you may list an item on the marketplace after you log in with Metamask.

### Log in with Metamask

Once logged in, you may list an item on the marketplace. Add the necessary details, and when you submit the item your metamask wallet will be prompted with a transaction. Once complete, the item should appear in the marketplace.

![Adding an item](https://user-images.githubusercontent.com/67028427/200962789-950054db-3a3c-4485-8afc-e8c5f9cd5b55.png)

Logged in users will also see addresses of the owners of the listed items. You can click on an address to view all items listed by that address.

![User's store page](https://user-images.githubusercontent.com/67028427/200963194-9e296d78-d5ff-4319-a4ca-14fff414e3d8.png)

### Buy an item

![Buy an item from someone else](https://user-images.githubusercontent.com/67028427/200962850-fa24f17e-46ef-4c48-b44a-05abf202c13c.png)

Find an item you like? Purchase that item from the item details page and your metamask wallet will be prompted with a purchase transaction. Once complete, the item should be removed from the marketplace.

### Delete your listed item

![Your items are deletable](https://user-images.githubusercontent.com/67028427/200962924-9e476473-088a-450e-9d7e-25a81dc7b0d6.png)

Want to remove one of your listed items? Click on the details for the specific item, and if your linked metamask account is the owner of the item, there will be a delete button to remove the item. This prompts a delete transaction inside your linked metamask account. Once that is complete, the item should be removed.

## Thank you for viewing!

This project was created to complete my Advanced dApp project as part of Kingsland University's Zero to Blockchain bootcamp course. Thank you for your attention!

---

### Why Qwik?

Qwik is a new javascript framework that promises lightning-fast time-to-interaction (TTI) speed. Other modern frameworks are surprisingly slow at first page load, especially on slow networks or slow devices. Qwik serializes all the necessary data (listeners, state) into the HTML on the server, so when the client loads it does not need to download the entire client to hydrate it to discover the listeners. 

Instead, the client reads the listeners in the HTML and knows which functions and which state to fetch for the client, and so the work done on the server does not need to repeat on the client (like with NextJS). Qwik is able to only send the basic functions needed for interactivity, keeping ahead of the user using smart prefetching of code so there are never any load times or waiting times for users!

Compared to NextJs and other javascript frameworks, a web app built with Qwik might load 4x+ faster on slow 3g networks!
