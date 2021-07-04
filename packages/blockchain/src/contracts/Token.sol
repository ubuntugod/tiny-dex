// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import 'openzeppelin-solidity/contracts/utils/math/SafeMath.sol';

contract Token {
    using SafeMath for uint256;
    string public constant name = 'TinyDEX';
    string public constant symbol = 'TDEX';
    uint8 public constant decimals = 18;
    uint256 public constant totalSupply = 21_000_000e18;
    mapping(address => uint256) public balanceOf;

    constructor() {
        balanceOf[msg.sender] = totalSupply;
    }

    function transfer(address _to, uint256 _value)
        public
        returns (bool success)
    {
        balanceOf[msg.sender] = balanceOf[msg.sender].sub(_value);
        balanceOf[_to] = balanceOf[_to].add(_value);
        return true;
    }
}
