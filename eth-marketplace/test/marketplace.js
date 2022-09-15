const { assert } = require("chai");

const {
  BN,
  constants,
  expectEvent,
  expectRevert,
} = require("@openzeppelin/test-helpers");

const Marketplace = artifacts.require("Marketplace");

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("Marketplace", function (accounts) {
  // it("test get balance", async function () {
  //   let senderBal = await web3.eth.getBalance(accounts[0]);
  //   let receiverBal = await web3.eth.getBalance(accounts[1]);
  //   // assert.equal(senderBal, 100, "checking sender balances hopefully");
  //   // sender balance == 99_999_999_999_995_602_425
  //   // i think that means starts at 100
  //   assert.equal(100, receiverBal, "checking receiver balances hopefully");
  //   // receiverBal == 100_000_000_000_000_000_000
  //   // so 100 eth
  // })

  // first test passing!!! WOOOOOOT!
  // describe('selling', function () {

  // })
  it("should start with no items", async function () {
    const instance = await Marketplace.deployed();
    const itemIdsLength = await instance.getItemIdsLength();

    assert.equal(itemIdsLength, 0, "should start with no items");
  });

  it("reverts when seller tries to buy their own item", async function () {
    const instance = await Marketplace.deployed();
    const item = {
      ipfsHash: "some data hash to ipfs",
      price: 1_000_000_000,
    };
    await instance.addItem(item.ipfsHash, item.price, {
      from: accounts[0],
    });

    const itemIdsFromSeller =
      await instance.getItemIdsFromSeller(accounts[0]);
    await expectRevert(
      instance.sell(itemIdsFromSeller[0], { from: accounts[0] }),
      "Owner cannot buy their own items!"
    );
  });

  it("should register an item", async function () {
    const instance = await Marketplace.deployed();
    const item = {
      ipfsHash: "some data hash to ipfs",
      price: 1_000_000_000,
    };
    await instance.addItem(item.ipfsHash, item.price, {
      from: accounts[0],
    });

    // const itemIdsLength = await instance.getItemIdsLength();
    // assert.equal(itemIdsLength, BN(1), "should now have 1 item");

    const items = await instance.getAllItems();
    assert.equal(
      items[0].ipfsHash,
      item.ipfsHash,
      "should have the same ipfsHash that we added"
    );

    assert.equal(
      items[0].price,
      item.price,
      "should have the same price that we added"
    );

    assert.equal(
      items[0].owner,
      accounts[0],
      "should have account 0 as the owner of the item"
    );

    const itemIdsFromAddress =
      await instance.getItemIdsFromSeller(accounts[0]);
    assert.equal(
      itemIdsFromAddress[0],
      items[0].id,
      "get item id should match"
    );
  });

  // "not enough funds?"

  it("should sell an item", async function () {
    const instance = await Marketplace.deployed();
    const item = {
      ipfsHash: "some data hash to ipfs",
      price: 100,
    };
    await instance.addItem(item.ipfsHash, item.price, { from: accounts[2] });

    const itemIdsFromAddress =
      await instance.getItemIdsFromSeller(accounts[2]);

    await instance.sell(itemIdsFromAddress[0], {
      from: accounts[1],
      value: '1000000000',
    });

    // after sold, that means the seller should no longer hold the item;

    //also getItemFromId should return a "deleted" item, so could check that the properties don't match the item
    const itemIdsFromSeller =
      await instance.getItemIdsFromSeller(accounts[2]);

    const itemIdZero = itemIdsFromSeller[0];
    const itemFromIds = await instance.itemFromId(itemIdZero);
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

  
  // it("should give seller the proceeds and retain 5%", async function () {
  //   const instance = await Marketplace.deployed();
  //   const item = {
  //     ipfsHash: "some data hash to ipfs",
  //     price: 100,
  //   };
  //   await instance.addItem(item.ipfsHash, item.price, { from: accounts[3] });

  //   const itemIdsFromAddress =
  //     await instance.getItemIdsFromSeller(accounts[3]);

  //   await instance.sell(itemIdsFromAddress[0], {
  //     from: accounts[1],
  //     value: '100000000000',
  //   });

  //   // after sold, that means the seller should no longer hold the item;

  //   //also getItemFromId should return a "deleted" item, so could check that the properties don't match the item
  //   const itemIdsFromSeller =
  //     await instance.getItemIdsFromSeller(accounts[3]);

  //   const itemIdZero = itemIdsFromSeller[0];
  //   const itemFromIds = await instance.itemFromId(itemIdZero);
  //   assert.notEqual(
  //     item.ipfsHash,
  //     itemFromIds.ipfsHash,
  //     "the hash should be different because it's deleted"
  //   );
  //   assert.notEqual(
  //     item.price,
  //     itemFromIds.price,
  //     "the price should be different because it's deleted"
  //   );
    
  //   const contractBalance = await web3.eth.getBalance(Marketplace.address);
  //   const expectedBalance = item.price * 5 / 100;
  //   assert.equal(
  //     contractBalance, expectedBalance, "Contract should keep 5% of sales price"
  //   );
  // });

  
  it("should revert sell from not enough funds", async function () {
    const instance = await Marketplace.deployed();
    const item = {
      ipfsHash: "some data hash to ipfs",
      price: 100000000,
    };
    await instance.addItem(item.ipfsHash, item.price, { from: accounts[2] });

    const itemIdsFromAddress =
      await instance.getItemIdsFromSeller(accounts[2]);

    await expectRevert(
      instance.sell(itemIdsFromAddress[0], {
        from: accounts[1],
        value: '100',
      }),
      "Not sent enough money to buy the item"
    );
  });

  it("should delete item if owner", async function () {
    const instance = await Marketplace.deployed();
    const item = {
      ipfsHash: "some data hash to ipfs",
      price: 1_000_000_000,
    };
    await instance.addItem(item.ipfsHash, item.price, { from: accounts[0] });

    const itemIdsFromAddress =
      await instance.getItemIdsFromSeller(accounts[0]);

    await instance.deleteItem(itemIdsFromAddress[0], {
      from: accounts[0],
    });

    const receivedItem = await instance.itemFromId(itemIdsFromAddress[0]);

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

  // it("should pay seller when item sells", async function () {
  //   const instance = await Marketplace.deployed();
  //   // const instance = await Marketplace.at(accounts[9])
  //   const item = {
  //     ipfsHash: "some data hash to ipfs",
  //     price: 1000000,
  //   };
  //   await instance.addItem(item.ipfsHash, item.price, { from: accounts[0] });

  //   const itemIdsFromAddress =
  //     await instance.getItemIdsFromSeller(accounts[0]);

  //   const receipt = await instance.sell(itemIdsFromAddress[0], {
  //     from: accounts[1],
  //     value: '1000000000000000',
  //   });

  //   const contractBalance = web3.eth.getBalance(Marketplace.address);
  //   assert.notEqual(contractBalance, 0, 'should be non-zero contract balance');
  //   // expectEvent(receipt, 'eventSell', {_contractBalance: '', _sellerProceeds: '', _remainingItemsForSale: ''})
  // });
});
