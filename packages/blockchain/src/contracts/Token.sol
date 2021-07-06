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
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );

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

    function _transfer(
        address _from,
        address _to,
        uint256 _value
    ) internal onlyValidAddress(_from) onlyValidAddress(_to) {
        balanceOf[_from] = balanceOf[_from].sub(_value);
        balanceOf[_to] = balanceOf[_to].add(_value);
        emit Transfer(_from, _to, _value);
    }

    function transfer(address _to, uint256 _value)
        public
        onlySufficientBalance(_value)
        returns (bool success)
    {
        _transfer(msg.sender, _to, _value);
        return true;
    }

    function approve(address _spender, uint256 _value)
        public
        onlyValidAddress(_spender)
        returns (bool success)
    {
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    modifier onlySufficientFundsForDelegation(address _from, uint256 _value) {
        require(_value <= balanceOf[_from]);
        require(_value <= allowance[_from][msg.sender]);
        _;
    }

    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    )
        public
        onlySufficientFundsForDelegation(_from, _value)
        returns (bool success)
    {
        allowance[_from][msg.sender] = allowance[_from][msg.sender].sub(_value);
        _transfer(_from, _to, _value);
        return true;
    }
}
