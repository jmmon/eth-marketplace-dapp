const { assert } = require("chai");

const {
  BN,
  constants,
  expectEvent,
  expectRevert,
} = require("@openzeppelin/test-helpers");

const Marketplace = artifacts.require("Marketplace");

contract("Marketplace", function (accounts) {

  // initialization


  // add items

  
  // sell items


  // delete items


  // owner
  it("should block withdrawal if balance is less than amount", async function () {
    const instance = await Marketplace.deployed();

    await expectRevert(
      instance.withdraw(100, { from: accounts[0] }),
      "can only withdraw balance that is available"
    );
  });


  // owner
  it("should block balance viewing if not owner", async function () {
    const instance = await Marketplace.deployed();

    await expectRevert(
      instance.balance({ from: accounts[1] }),
      "Not permitted to view balance"
    );
  });


  // owner
  it("should allow balance check from owner", async function () {
    const instance = await Marketplace.deployed();

    const balance = await instance.balance({ from: accounts[0] });
    assert.equal(balance, 0, "initial balance should be 0");
  });


  // initialization
  it("should start with no items", async function () {
    const instance = await Marketplace.deployed();
    const itemIdsLength = await instance.getAllItems();
    assert.equal(itemIdsLength, 0, "should start with no items");
  });


  // sell item
  it("reverts when seller tries to buy their own item", async function () {
    const instance = await Marketplace.deployed();
    const item = {
      ipfsHash: "some data hash to ipfs",
      price: 1_000_000_000,
    };
    await instance.addItem(item.ipfsHash, item.price, {
      from: accounts[0],
    });

    const itemIdFromSeller = await instance.itemIdsFromSeller(accounts[0], 0);
    await expectRevert(
      instance.sell(itemIdFromSeller, { from: accounts[0] }),
      "Owner cannot buy their own items!"
    );
  });


  // register items:
  it("should register an item", async function () {
    const instance = await Marketplace.deployed();
    const item = {
      ipfsHash: "some data hash to ipfs",
      price: 1000000000,
    };
    await instance.addItem(item.ipfsHash, item.price, {
      from: accounts[1],
    });
    const itemIdFromSeller = await instance.itemIdsFromSeller(accounts[1], 0);
    const itemFromSeller = await instance.itemFromId(itemIdFromSeller);

    assert.equal(
      itemFromSeller.ipfsHash,
      item.ipfsHash,
      "should have the same ipfsHash that we added"
    );

    assert.equal(
      itemFromSeller.price,
      item.price,
      "should have the same price that we added"
    );

    assert.equal(
      itemFromSeller.owner,
      accounts[1],
      "should have account 1 as the owner of the item"
    );
  });

  it("should add item with price of 0", async function () {
    const instance = await Marketplace.deployed();
    const item = { ipfsHash: "some string for the data", price: 0 };

    await instance.addItem(item.ipfsHash, item.price, { from: accounts[2] });

    const itemIdFromSeller = await instance.itemIdsFromSeller(accounts[2], 0);
    const foundItem = await instance.itemFromId(itemIdFromSeller);
    assert.equal(
      foundItem.ipfsHash,
      item.ipfsHash,
      "should have the same ipfs hash"
    );
  });
  

  // sell items:
  it("should sell an item", async function () {
    const instance = await Marketplace.deployed();
    const item = {
      ipfsHash: "some data hash to ipfs",
      price: 1000000000,
    };

    // add item
    await instance.addItem(item.ipfsHash, item.price, { from: accounts[3] });

    const itemIdFromAddress = await instance.itemIdsFromSeller(accounts[3], 0);

    await instance.sell(itemIdFromAddress, {
      from: accounts[1],
      value: "1000000000",
      gasLimit: "3000000",
    });

    // after sold, that means the seller should no longer hold the item;
    const itemFromIds = await instance.itemFromId(itemIdFromAddress);
    assert.notEqual(
      item.ipfsHash,
      itemFromIds.ipfsHash,
      "the hash should be different because it's deleted"
    );
    assert.notEqual(
      item.price,
      itemFromIds.price,
      "the price should be different because it's deleted"
    );
  });
  

  // sell items
  it("should revert sell from not enough funds", async function () {
    const instance = await Marketplace.deployed();
    const item = {
      ipfsHash: "some data hash to ipfs",
      price: 100000000,
    };
    await instance.addItem(item.ipfsHash, item.price, { from: accounts[4] });

    const itemIdFromAddress = await instance.itemIdsFromSeller(accounts[4], 0);

    await expectRevert(
      instance.sell(itemIdFromAddress, {
        from: accounts[1],
        value: "100",
      }),
      "Not sent enough money to buy the item"
    );
  });

  
  // delete item
  it("should delete item if owner", async function () {
    const instance = await Marketplace.deployed();
    // add an item so we can track it to compare to make sure it worked
    const item = {
      ipfsHash: "some data hash to ipfs",
      price: 100000000,
    };
    await instance.addItem(item.ipfsHash, item.price, { from: accounts[5] });

    const itemIdFromAddress = await instance.itemIdsFromSeller(accounts[5], 0);

    await instance.deleteItem(itemIdFromAddress, {
      from: accounts[5],
    });

    const receivedItem = await instance.itemFromId(itemIdFromAddress);

    assert.notEqual(
      item.ipfsHash,
      receivedItem.ipfsHash,
      "the hash should be different because it's deleted"
    );
    assert.notEqual(
      item.price,
      receivedItem.price,
      "the price should be different because it's deleted"
    );
  });
  

  // delete item
  it("should force owner items to shuffle", async function () {
    const instance = await Marketplace.deployed();
    const item = {
      ipfsHash: "some data hash to ipfs",
      price: 1_000_000_000,
    };
    await instance.addItem(item.ipfsHash, item.price, { from: accounts[1] });
    await instance.addItem(item.ipfsHash, item.price, { from: accounts[1] });
    await instance.addItem(item.ipfsHash, item.price, { from: accounts[1] });
    await instance.addItem(item.ipfsHash, item.price, { from: accounts[1] });
    await instance.addItem(item.ipfsHash, item.price, { from: accounts[1] });

    const itemIdFromAddress = await instance.itemIdsFromSeller(accounts[1], 2);

    await instance.deleteItem(itemIdFromAddress, {
      from: accounts[1],
    });

    const receivedItem = await instance.itemFromId(itemIdFromAddress);

    assert.notEqual(
      item.ipfsHash,
      receivedItem.ipfsHash,
      "the hash should be different because it's deleted"
    );
    assert.notEqual(
      item.price,
      receivedItem.price,
      "the price should be different because it's deleted"
    );
  });


  // owner
  it("should not allow withdrawal from other than contract owner", async function () {
    const instance = await Marketplace.deployed();

    await expectRevert(
      instance.withdraw(100, {
        from: accounts[1],
      }),
      "Not permitted to withdraw"
    );
  });


  // owner
  it("should allow withdrawal from contract owner", async function () {
    const instance = await Marketplace.deployed();

    const balance = instance.balance({ from: accounts[0] });
    await instance.withdraw(100, { from: accounts[0] });
    const newBalance = instance.balance({ from: accounts[0] });

    assert.notEqual(balance, newBalance);
  });


  // delete
  it("reverts when trying to delete someone else's item", async function () {
    const instance = await Marketplace.deployed();

    const itemId = await instance.itemIdsFromSeller(accounts[0], 0);

    await expectRevert(
      instance.deleteItem(itemId, {
        from: accounts[5],
      }),
      "Only owner can delete their item!"
    );
  });


  // getAllItems
  it("should run getAllItems loop and count correctly", async function () {
    const instance = await Marketplace.deployed();
    const itemIds = Array.from(await instance.getAllItems());

    assert.equal(itemIds.length, 8, "should end with 8 items remaining");
  });

  
  // add item
  it("testing getting receipt data", async function () {
    const instance = await Marketplace.deployed();
    const item = {
      ipfsHash: "some data hash to ipfs",
      price: 1_000_000_000,
    };
    const receipt = await instance.addItem(item.ipfsHash, item.price, { from: accounts[1] });

    const itemCount = receipt.logs[0]["args"]["_itemsForSaleCount"];
    assert.equal(itemCount, 9, "should end with 9 items remaining");
  })
});