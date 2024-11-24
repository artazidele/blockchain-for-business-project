const DonationToken = artifacts.require("DonationToken");
const CharityPlatform = artifacts.require("CharityPlatform");

module.exports = function(deployer) {
    deployer.deploy(DonationToken).then(function() {
        deployer.deploy(CharityPlatform, DonationToken.address);
    });
};
