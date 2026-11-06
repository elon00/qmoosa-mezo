// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

interface IERC20 {
    function transfer(address to, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract MezoSettlementAnchor {
    IERC20 public immutable musdToken;
    uint256 public constant MEZO_CHAIN_ID = 31611;
    address public owner;

    struct SettlementReceipt {
        bytes32 receiptHash;
        address payer;
        address serviceProvider;
        uint256 amountMUSD;
        bytes32 serviceIdHash;
        uint64 timestamp;
        uint64 blockNumber;
        bool consumed;
    }

    mapping(bytes32 => SettlementReceipt) public receipts;
    mapping(bytes32 => bool) public consumedNonces;

    event SettlementExecuted(bytes32 indexed receiptHash, bytes32 indexed nonce, address indexed payer, address serviceProvider, uint256 amountMUSD, string serviceId);
    event ReceiptConsumed(bytes32 indexed receiptHash, address indexed consumer);

    constructor(address _musdToken) {
        require(_musdToken != address(0), "Zimbabwe/Mezo: Zero address");
        musdToken = IERC20(_musdToken);
        owner = msg.sender;
    }

    function executeSettlement(address serviceProvider, uint256 amountMUSD, bytes32 nonce, string calldata serviceId) external returns (bytes32 receiptHash) {
        require(serviceProvider != address(0), "Invalid recipient");
        require(amountMUSD > 0, "Invalid amount");
        require(!consumedNonces[nonce], "Nonce used");
        consumedNonces[nonce] = true;

        bytes32 sHash = keccak256(bytes(serviceId));
        receiptHash = keccak256(abi.encode(block.chainid, address(this), msg.sender, serviceProvider, amountMUSD, nonce, sHash, block.number));
        receipts[receiptHash] = SettlementReceipt(receiptHash, msg.sender, serviceProvider, amountMUSD, sHash, uint64(block.timestamp), uint64(block.number), false);

        require(musdToken.transferFrom(msg.sender, serviceProvider, amountMUSD), "Transfer failed");
        emit SettlementExecuted(receiptHash, nonce, msg.sender, serviceProvider, amountMUSD, serviceId);
    }

    function verifyReceipt(bytes32 receiptHash) external view returns (bool exists, bool consumed, address payer, address serviceProvider, uint256 amountMUSD) {
        SettlementReceipt memory r = receipts[receiptHash];
        return (r.receiptHash != bytes32(0), r.consumed, r.payer, r.serviceProvider, r.amountMUSD);
    }
}
