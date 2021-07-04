// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

contract Token {
    string public constant name = 'TinyDEX';
    string public constant symbol = 'TDEX';
    uint8 public constant decimals = 18;
    uint256 public constant totalSupply = 21_000_000e18;
    mapping(address => uint256) public balanceOf;

    constructor() {
        balanceOf[msg.sender] = totalSupply;
    }
}
