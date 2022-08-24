pragma solidity ^0.8.3;

// convert number to string
function toString(uint256 value) pure returns (string memory) {
	// Inspired by OraclizeAPI's implementation - MIT licence
	// https://github.com/oraclize/ethereum-api/blob/b42146b063c7d6ee1358846c198246239e9360e8/oraclizeAPI_0.4.25.sol

	if (value == 0) {
		return "0";
	}
	uint256 temp = value;
	uint256 digits;
	while (temp != 0) {
		digits++;
		temp /= 10;
	}
	bytes memory buffer = new bytes(digits);
	while (value != 0) {
		digits -= 1;
		buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
		value /= 10;
	}
	return string(buffer);
}

// sellers register/list items for sale in the ethereum blockchain
// item == hash of IPFS JSON Object
// smart contract has a collection of sellers, and each seller has a collection of items

// visitors DO NOT see sellers' address/contacts
// visitors can register as buyers if they have a wallet (metamask)
// Buyers can buy; payment goes to smart contract, then 95% goes to the seller ?

// "buyers" registration can be app logic; smart contract does not need to keep
//      a list of registered buyers

contract Marketplace {
	address payable private contractOwner;

	struct Item {
		address owner;
		string ipfsHash;
		uint256 price; // in wei
		bytes32 id;
	}

	mapping(address => bytes32[]) sellerItemIds;
	mapping(bytes32 => Item) stockOfItemIds;
	bytes32[] public itemIdList;
	
	event eventRegisterItem(
		Item _item,
		uint256 _itemsForSaleCount,
		uint256 _sellersItemsLength
	);
	event eventSellItem(
		uint256 _contractBalance,
		uint256 _sellerProceeds,
		uint256 _remainingItemsForSale
	);
	event eventItemRemoved(bytes32 _removedItemId);
	event eventItemRemovedFromSeller(uint256 _index, bytes32 _itemId);
	event eventItemRemovedFromIdList(uint256 _index, bytes32 _itemId);

	constructor() {
		contractOwner = payable(msg.sender);
	}

	function getForSaleItemIds() external view returns (bytes32[] memory) {
		return itemIdList;
	}

	function getForSaleItemIdsCount() external view returns (uint256) {
		return itemIdList.length;
	}

	function getItemById(bytes32 _id) external view returns (Item memory) {
		return stockOfItemIds[_id];
	}

	function getForSaleItemIdsFromSeller(address _sellerAddress)
	  view external
		returns (bytes32[] memory)
	{
		return sellerItemIds[_sellerAddress];
	}

	// register item to the sender/seller's address:
	function registerItemForSale(string memory _dataHash, uint256 _price) external {
		// making an id for the item: hash the IPFS data hash, price, and sender address
		string memory itemData = string.concat(
			_dataHash,
			toString(_price),
			toString(uint256(uint160(msg.sender)))
		);
		bytes32 itemHashId = keccak256(abi.encodePacked(itemData));

		// create a new item
		Item memory item = Item({
			owner: msg.sender,
			ipfsHash: _dataHash,
			price: _price,
			id: itemHashId
		});

		// push the itemHashId to our seller's list of items
		sellerItemIds[msg.sender].push(itemHashId);

		// add {itemHashId: item} to our stockOfItemIds (list of all items for sale)
		stockOfItemIds[itemHashId] = item;

		//push to itemIdList, our list of all items
		itemIdList.push(itemHashId);

		emit eventRegisterItem(
			item,
			itemIdList.length,
			sellerItemIds[msg.sender].length
		);
	}


	function sellItem(bytes32 _itemId) external payable {
		Item memory foundItem = stockOfItemIds[_itemId];
		require(foundItem.owner != msg.sender, "Owner cannot buy their own items!");
		require(
			msg.value >= foundItem.price,
			"Not sent enough money to buy the item"
		);

		// remove id from seller's items list
		bool successRemoveFromSellerList = removeItemFromSellerItemIds(
			foundItem.owner,
			_itemId
		);

		// remove item from our mapping
		bool successRemoveFromStockMap = removeItemFromStockList(_itemId);

		// remove item from our itemIdList
		bool successRemoveFromItemIdList = removeItemFromItemsList(_itemId);

		require(
			successRemoveFromSellerList,
			"Error removing item from seller's list"
		);
		require(
			successRemoveFromStockMap,
			"Error removing item from stock items"
		);
		require(
			successRemoveFromItemIdList,
			"Error removing item from item id list"
		);

		uint256 sellerProceeds = (foundItem.price * 95) / 100;

		(bool success, ) = foundItem.owner.call{value: sellerProceeds}("");
		require(success, "failed to send ether"); // what happens if this fails?? item still gets removed, but seller does not get proceeds I guess?? Or maybe it cancels the whole function, don't remember


		emit eventSellItem(
			address(this).balance,
			sellerProceeds,
			itemIdList.length
		);
	}


	function removeItemFromItemsList(bytes32 _itemId) public returns (bool) {
		// find our item by id
		uint256 itemIdListLength = itemIdList.length;
		for (uint256 i = 0; i < itemIdListLength; i++) {
			if (itemIdList[i] == _itemId) {
				uint256 itemIdLocation = i;

				// once found, shuffle our item list forward
				for (i; i < itemIdListLength - 1; i++) {
					itemIdList[i] = itemIdList[i + 1];
				}
				// remove the last item to reduce the length
				itemIdList.pop();

				emit eventItemRemovedFromIdList(
					itemIdLocation,
					_itemId
				);
				return true;

			}
		}
		return false;
	}

	function removeItemFromStockList(bytes32 _itemId) private returns (bool) {
		// delete struct from our itemsForSale mapping
		delete stockOfItemIds[_itemId];

		emit eventItemRemoved(_itemId);
		return true;
	}


	function removeItemFromSellerItemIds(address _owner, bytes32 _itemId)
		private
		returns (bool)
	{
		// find our item in our seller's list
		uint256 sellerItemsLength = sellerItemIds[_owner].length;
		for (uint256 i = 0; i < sellerItemsLength; i++) {
			if (sellerItemIds[_owner][i] == _itemId) {
				uint256 itemIdLocation = i;
				bytes32 itemId = sellerItemIds[_owner][i];

				// reshuffle our seller's item list so we remove the item
				for (i; i < sellerItemsLength - 1; i++) {
					sellerItemIds[_owner][i] = sellerItemIds[_owner][i + 1];
				}
				// remove the last item to reduce the length
				sellerItemIds[_owner].pop();

				emit eventItemRemovedFromSeller(itemIdLocation, itemId);

				return true;
			}
		}

		// return if not found;
		return false;
	}

}

/* NOTES:
	Item ids are currently changing (or rather the index to find the item is changing)
		Instead, we need the ids to purchase the item to stay the same

	Payments seem to work! Contract receives coins, then send soff 95% of them to the seller.



*/
