// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract SimpleStorage {
    uint256 public data;

    // Function to set data
    function set(uint256 _data) public {
        data = _data;
    }

    // Function to get data
    function get() public view returns (uint256) {
        return data;
    }
}