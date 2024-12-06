const Example = artifacts.require("Example");

module.exports = function(deployer) {
    const initialSupply = web3.utils.toWei("1000000", "ether");
  deployer.deploy(Example, initialSupply);
};
