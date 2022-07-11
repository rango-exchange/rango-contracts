// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.13;

import "../../libs/BaseContract.sol";
import "../../../interfaces/IThorchainRouter.sol";
import "../../rango/bridges/thorchain/IRangoThorchain.sol";

contract RangoThorchain is IRangoThorchain, BaseContract {
    event ThorchainTxInitiated(address vault, address token, uint amount, string memo, uint expiration);

    receive() external payable { }

    function swapInToThorchain(
        address token,
        uint amount,
        address tcRouter,
        address tcVault,
        string calldata thorchainMemo,
        uint expiration
    ) external payable whenNotPaused nonReentrant {
        BaseContractStorage storage baseStorage = getBaseContractStorage();
        require(baseStorage.whitelistContracts[tcRouter], "given thorchain router not whitelisted");
        require(amount > 0, "Requested amount should be positive");
        if (token == NULL_ADDRESS) {
            require(msg.value >= amount, "zero input while fromToken is native");
        } else {
            SafeERC20.safeTransferFrom(IERC20(token), msg.sender, address(this), amount);
            approve(token, tcRouter, amount);
        }

        IThorchainRouter(tcRouter).depositWithExpiry{value : msg.value}(
            payable(tcVault), // address payable vault,
            token, // address asset,
            amount, // uint amount,
            thorchainMemo, // string calldata memo,
            expiration  // uint expiration) external payable;
        );
        emit ThorchainTxInitiated(tcVault, token, amount, thorchainMemo, expiration);
    }

}