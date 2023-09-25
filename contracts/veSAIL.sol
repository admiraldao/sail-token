// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

contract VeSail is ERC20("Vested SAIL", "veSAIL"){
    using SafeMath for uint256;
    IERC20 public sail;

    constructor(IERC20 _sail) public {
        sail = _sail;
    }

    function deposit(uint256 _amount) public {
        uint256 totalSail = sail.balanceOf(address(this));

        uint256 totalShares = totalSupply();

        if (totalShares == 0 || totalSail == 0) {
            _mint(msg.sender, _amount);
        } 
        else {
            uint256 what = _amount.mul(totalShares).div(totalSail);
            _mint(msg.sender, what);
        }

        sail.transferFrom(msg.sender, address(this), _amount);
    }

    function withdraw(uint256 _share) public {
        uint256 totalShares = totalSupply();
        uint256 what = _share.mul(sail.balanceOf(address(this))).div(totalShares);
        _burn(msg.sender, _share);
        sail.transfer(msg.sender, what);
    }

    function getExchangeRate() public view returns (uint256) {
        return (sail.balanceOf(address(this))) / totalSupply();
    }

    function toSAIL(uint256 veSAILAmount) public view returns (uint256 sailAmount) {
        sailAmount = (veSAILAmount * sail.balanceOf(address(this))) / totalSupply();
    }

    function toVESAIL(uint256 sailAmount) public view returns (uint256 veSailAmount) {
        veSailAmount = (sailAmount * totalSupply()) / sail.balanceOf(address(this));
    }
}