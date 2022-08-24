pragma solidity ^0.8.3;

contract Marketplace {
    // sellers register/list items for sale in the ethereum blockchain
    // item == hash of IPFS JSON Object
    // smart contract has a collection of sellers, and each seller has a collection of items

    // visitors DO NOT see sellers' address/contacts
    // visitors can register as buyers if they have a wallet (metamask)
    // Buyers can buy; payment goes to smart contract, then 95% goes to the seller ?

    // "buyers" registration can be app logic; smart contract does not need to keep
    //      a list of registered buyers

    address payable private contractOwner;
		uint256 public index;

    struct Item {
        address owner;
        string ipfsHash;
        uint256 price;
				uint256 id;
    }

    // struct Seller {
    //     address account;
    //     Item[] items;
    // }

    // mapping(address => Seller) sellers;
    // mapping(address => Item[]) sellerItems;
		// mapping(string => Item[]) hashToItems; //
		mapping(address => uint256[]) sellerItemIds;


		Item[] public items;

    constructor() {
			contractOwner = payable(msg.sender);
    }

    function registerItem(string memory _dataHash, uint256 _price) public {
        // register item to the sender/seller's address:
        // 
				Item memory _item = Item(
					msg.sender, 
					_dataHash, 
					_price, 
					index
				);

				items.push(_item);
				sellerItemIds[msg.sender].push(index); // push the item index to our seller's list of items
				
				// increment index for next incoming item
				index++;

				emit RegisterItemEvent(
					_item,
					items.length,
					sellerItemIds[msg.sender].length
				);
    }

		event RegisterItemEvent(
			Item _item,
			uint256 _itemsLength,
			uint256 _sellersItemsLength
		);

		function sellItem(uint256 _itemId) public payable {

			Item memory foundItem = items[_itemId];
			require(items[_itemId].owner != msg.sender, "Owner cannot buy their own item");
			require(msg.value >= foundItem.price, "Not sent enough money to buy the item");



			// remove id from seller's items list
			removeSellerItem(foundItem.owner, _itemId);
			
			// remove item from our items list
			removeItem(_itemId);

			uint256 sellerProceeds = foundItem.price * 95 / 100;
			
			(bool success, ) = foundItem.owner.call{value: sellerProceeds}("");
			require(success, "failed to send ether");


			emit SellItemAmounts(address(this).balance, sellerProceeds);
		}

		event SellItemAmounts(
			uint256 _contractBalance,
			uint256 _sellerProceeds
		);

		function removeItem(uint256 _itemId) private {
			// bring all items up one
			for (uint256 i = _itemId; i < items.length - 1; i++) {
				items[i] = items[i + 1];
			}
			// remove the last item to reduce the length
			items.pop();
			
			emit ItemRemovedEvent(
				"items array",
				items.length
			);
		}

		event ItemRemovedEvent(
			string _name,
			uint256 _itemsLength
		);

		function removeSellerItem(address _owner, uint256 _itemId) private returns(bool){
			// find our item in our seller's list
			uint256 itemLocation;
			bool found = false;
			for (uint256 i = 0; i < sellerItemIds[_owner].length; i++) {
				if (sellerItemIds[_owner][i] == _itemId) {
					itemLocation = _itemId;
					found = true;
					break;
				}
			}
			// return if not found;
			if (!found) {
				// TODO
				return false;
			}
			
			// reshuffle our seller's item list so we remove the item
			for (uint256 i = itemLocation; i < sellerItemIds[_owner].length - 1; i++) {
				sellerItemIds[_owner][i] = sellerItemIds[_owner][i + 1];
			}
			// remove the last item to reduce the length
			sellerItemIds[_owner].pop();

			emit ItemRemovedEvent(
				"sellerItems array",
				sellerItemIds[_owner].length
			);
			return true;
		}


}






/* NOTES:
	Item ids are currently changing (or rather the index to find the item is changing)
		Instead, we need the ids to purchase the item to stay the same

	Payments seem to work! Contract receives coins, then send soff 95% of them to the seller.

	

*/