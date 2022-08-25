const Marketplace = artifacts.require("Marketplace");

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("Marketplace", function ( accounts ) {
  it("should start with no items", async function () {
    const marketplaceInstance = await Marketplace.deployed();
    const itemIds = await marketplaceInstance.getForSaleItemIds.call(accounts[0]);
    return assert.equal(itemIds.length, 0, "should start with no items");
  });
});
