// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Example is ERC20 {
    // constructor() ERC20("Fixed", "FIX") {
    //     _mint(msg.sender, 1000);
    // }
    constructor(uint256 initialSupply) ERC20("MyToken", "MTK") {
        _mint(msg.sender, initialSupply); // Mint initial supply to contract creator
    }

    // Transfer function can be used to send tokens
    function transferTokens(address recipient, uint256 amount) public returns (bool) {
        return transfer(recipient, amount); // Calls the ERC20 transfer method
    }

    function balance(address account) public view returns (uint256) {
        // return a;
        return balanceOf(account);
    }
}