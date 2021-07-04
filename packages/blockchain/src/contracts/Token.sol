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

    event Transfer(address indexed _from, address indexed _to, uint256 _value);

    constructor() {
        balanceOf[msg.sender] = totalSupply;
    }

    modifier onlyValidAddress(address _account) {
        require(_account != address(0), 'Invalid address');
        _;
    }

    modifier onlySufficientBalance(uint256 _amount) {
        require(
            balanceOf[msg.sender] >= _amount,
            'Insufficient balance available'
        );
        _;
    }

    function transfer(address _to, uint256 _value)
        public
        onlyValidAddress(_to)
        onlySufficientBalance(_value)
        returns (bool success)
    {
        balanceOf[msg.sender] = balanceOf[msg.sender].sub(_value);
        balanceOf[_to] = balanceOf[_to].add(_value);
        emit Transfer(msg.sender, _to, _value);
        return true;
    }
}
