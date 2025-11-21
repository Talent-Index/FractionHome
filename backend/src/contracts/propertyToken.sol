// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PropertyToken {
    string public name;
    string public symbol;
    uint8  public decimals = 0;

    uint256 public totalSupply;
    address public treasury;

    mapping(address => uint256) public balanceOf;

    constructor(
        string memory _name,
        string memory _symbol,
        uint256 _initialSupply,
        address _treasury
    ) {
        name = _name;
        symbol = _symbol;
        treasury = _treasury;
        totalSupply = _initialSupply;
        balanceOf[_treasury] = _initialSupply;  
    }
}
