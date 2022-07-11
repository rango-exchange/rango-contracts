// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.13;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


interface IRangoMessageReceiver {
    enum ProcessStatus { SUCCESS, REFUND_IN_SOURCE, REFUND_IN_DESTINATION }

    function handleRangoMessage(
        address _token,
        uint _amount,
        ProcessStatus _status,
        bytes memory _message
    ) external;
}

contract CrosschainPurchaseApp is IRangoMessageReceiver {
    address payable constant NULL_ADDRESS = payable(0x0000000000000000000000000000000000000000);

    struct AppMessage { uint assetId; address buyer; }
    enum PurchaseType { BOUGHT, SOLD_OUT }
    event NFTPurchaseStatus(uint assetId, address buyer, PurchaseType purchaseType);

    address payable rangoContract;

    constructor(address payable _rangoContract) {
        rangoContract = _rangoContract;
    }

    receive() external payable { }


    // Source chain
    function buyNFTCrosschain(bytes calldata rangoData) external payable {
        // 1. Do your own logic here

        // 2. send the money via Rango
        (bool success, bytes memory retData) = rangoContract.call{value: msg.value}(rangoData);
        require(success, _getRevertMsg(retData));
    }

    // Destination chain
    function handleRangoMessage(
        address _token,
        uint _amount,
        ProcessStatus _status,
        bytes memory _message
    ) external {
        AppMessage memory m = abi.decode((_message), (AppMessage));

        if (m.assetId < 10) {
            emit NFTPurchaseStatus(m.assetId, m.buyer, PurchaseType.SOLD_OUT);

            // Give the money back to user
            if (_token == NULL_ADDRESS) {
                (bool sent, ) = m.buyer.call{value: _amount}("");
                require(sent, "failed to send native");
            } else {
                SafeERC20.safeTransfer(IERC20(_token), m.buyer, _amount);
            }
        } else {
            emit NFTPurchaseStatus(m.assetId, m.buyer, PurchaseType.BOUGHT);
            // give the purchased asset to user
        }
    }

    function refund(address _tokenAddress, uint256 _amount) external {
        IERC20 ercToken = IERC20(_tokenAddress);
        uint balance = ercToken.balanceOf(address(this));
        require(balance >= _amount, 'Insufficient balance');

        SafeERC20.safeTransfer(IERC20(_tokenAddress), msg.sender, _amount);
    }

    function refundNative(uint256 _amount) external {
        uint balance = address(this).balance;
        require(balance >= _amount, 'Insufficient balance');

        (bool sent, ) = msg.sender.call{value: _amount}("");
        require(sent, "failed to send native");
    }

    function _getRevertMsg(bytes memory _returnData) internal pure returns (string memory) {
        // If the _res length is less than 68, then the transaction failed silently (without a revert message)
        if (_returnData.length < 68) return 'Transaction reverted silently';

        assembly {
        // Slice the sighash.
            _returnData := add(_returnData, 0x04)
        }
        return abi.decode(_returnData, (string)); // All that remains is the revert string
    }


}