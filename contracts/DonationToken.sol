// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

// Contract to represent donation NFTs
contract DonationToken is ERC721 {
    uint256 private _tokenIds;
    mapping(uint256 => DonationInfo) public donationInfo;

    struct DonationInfo {
        address donor;
        uint256 amount;
        uint256 projectId;
        uint256 timestamp;
    }

    constructor() ERC721("CharityDonationToken", "CDT") {}

    function mint(address donor, uint256 projectId, uint256 amount) public returns (uint256) {
        _tokenIds++;
        uint256 newTokenId = _tokenIds;
        _mint(donor, newTokenId);
        
        donationInfo[newTokenId] = DonationInfo({
            donor: donor,
            amount: amount,
            projectId: projectId,
            timestamp: block.timestamp
        });

        return newTokenId;
    }
}