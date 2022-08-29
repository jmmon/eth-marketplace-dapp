const Marketplace = artifacts.require("Marketplace");



/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("Marketplace", async function ( accounts ) {
  it("should start with no items", async function () {
    const instance = await Marketplace.deployed();
    const itemIdsLength = await instance.getForSaleItemIdsCount.call(accounts[0]);
    assert.equal(itemIdsLength, 0, "should start with no items");
  });

  it("should register an item", async function () {
    const instance = await Marketplace.deployed();
    const success = await instance.registerItemForSale("the data hash", 12345, {from: accounts[0]});
    assert.isTrue(success, "should return true");
  });

});
