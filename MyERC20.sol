//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import {ERC20} from "openzepplin-contracts/token/ERC20/ERC20.sol";
contract MyERC20 is ERC20{
    mapping(address => uint) public balances;
    constructor(uint _initialSupply) ERC20("Santosh","VSK")
    {
        _mint(msg.sender, _initialSupply * 10 ** decimals());
        balances[msg.sender] = _initialSupply * 10 ** decimals();
    }
    function addAcount(address account, uint amount) public {
        _mint(account, amount);
        balances[account] += amount;
    }

    function decimals() public pure override returns (uint8) {
        return 18;
    }
    function name() public view override returns (string memory) {
        return ERC20.name();
    }
    function symbol() public view override returns (string memory) {
        return ERC20.symbol();
    }
    function totalSupply() public view override returns (uint256) {
        return super.totalSupply();
    }
    function transfer(address to, uint256 amount) public override returns (bool) {
        return super.transfer(to, amount);
    }
    function balanceOf(address account) public view override returns (uint256) {
        return super.balanceOf(account);
    }

}
