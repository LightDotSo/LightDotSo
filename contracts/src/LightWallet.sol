// SPDX-License-Identifier: AGPL-3.0-or-later

pragma solidity ^0.8.18;

// LightWallet.sol -- LightWallet initial implementation
// Modified implementation on SimpleAccount.sol from @eth-infinitism/account-abstraction
// Link: https://github.com/eth-infinitism/account-abstraction/blob/develop/contracts/samples/SimpleAccount.sol
// License: AGPL-3.0-or-later

import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {Initializable} from "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";
import {BaseAccount} from "@eth-infinitism/account-abstraction/contracts/core/BaseAccount.sol";
import {IEntryPoint} from "@eth-infinitism/account-abstraction/contracts/interfaces/IEntryPoint.sol";
import {UserOperation} from "@eth-infinitism/account-abstraction/contracts/interfaces/UserOperation.sol";
import {TokenCallbackHandler} from
    "@eth-infinitism/account-abstraction/contracts/samples/callback/TokenCallbackHandler.sol";
import {ILightWallet} from "@/contracts/interfaces/ILightWallet.sol";

/// @title LightWallet
/// @author shunkakinoki
/// @notice LightWallet is a simple account abstraction contract
contract LightWallet is ILightWallet, BaseAccount, TokenCallbackHandler, UUPSUpgradeable, Initializable {
    using ECDSA for bytes32;

    // -------------------------------------------------------------------------
    // Constants
    // -------------------------------------------------------------------------

    /// @notice The ERC1271 compatibility magic value
    /// @dev See https://eips.ethereum.org/EIPS/eip-1271 for more information
    bytes4 private constant ERC1271_SUCCESS = 0x1626ba7e;

    // -------------------------------------------------------------------------
    // Immutable Storage
    // -------------------------------------------------------------------------

    /// @notice The entry point contract for this account
    IEntryPoint private immutable _entryPoint;

    // -------------------------------------------------------------------------
    // Storage
    // -------------------------------------------------------------------------

    /// @notice The owner of this account
    /// @dev The owner is the EOA that is the owner of this account
    address public owner;

    // -------------------------------------------------------------------------
    // Modifiers
    // -------------------------------------------------------------------------

    modifier onlyOwner() {
        _onlyOwner();
        _;
    }

    // -------------------------------------------------------------------------
    // Constructor + Functions
    // -------------------------------------------------------------------------

    /// @inheritdoc BaseAccount
    function entryPoint() public view virtual override(BaseAccount, ILightWallet) returns (IEntryPoint) {
        return _entryPoint;
    }

    // solhint-disable-next-line no-empty-blocks
    receive() external payable {}

    /// @param anEntryPoint The address of the entrypoint contract.
    /// @dev Should be set to the address of the EntryPoint contract
    /// The official EntryPoint contract is at https://etherscan.io/address/0x5ff137d4b0fdcd49dca30c7cf57e578a026d2789
    constructor(IEntryPoint anEntryPoint) {
        _entryPoint = anEntryPoint;
        _disableInitializers();
    }

    /// @notice Check if the caller is the owner
    function _onlyOwner() internal view {
        // Directly from EOA owner, or through the account itself (which gets redirected through execute())
        require(msg.sender == owner || msg.sender == address(this), "only owner");
    }

    /// @param dest The address of the target contract to call.
    /// @param func The calldata to send to the target contract.
    /// @notice Executes a transaction (called directly from owner, or by entryPoint)
    function execute(address dest, uint256 value, bytes calldata func) external {
        _requireFromEntryPointOrOwner();
        _call(dest, value, func);
    }

    /// @param dest The array of address of the target contract to call.
    /// @param func The array of calldata to send to the target contract.
    /// @notice Executes a sequence of transactions (called directly from owner, or by entryPoint)
    function executeBatch(address[] calldata dest, bytes[] calldata func) external {
        _requireFromEntryPointOrOwner();
        require(dest.length == func.length, "wrong array lengths");
        for (uint256 i = 0; i < dest.length; i++) {
            _call(dest[i], 0, func[i]);
        }
    }

    /// @param hash The hash of the user operation
    /// @param signature The signature of the user operation
    /// @notice Check if a signature is valid based on the owner's address
    /// Comaptible with ERC1271
    function isValidSignature(bytes32 hash, bytes calldata signature) external view returns (bytes4 magicValue) {
        address recoveredOwner = ECDSA.recover(hash, signature);
        if (owner == recoveredOwner) {
            return ERC1271_SUCCESS;
        }
        return bytes4(0xffffffff);
    }

    /// @param anOwner The address of the owner of this account
    /// @notice The _entryPoint member is immutable, to reduce gas consumption.  To upgrade EntryPoint,
    /// a new implementation of SimpleAccount must be deployed with the new EntryPoint address, then upgrading
    /// the implementation by calling `upgradeTo()`
    function initialize(address anOwner) public virtual initializer {
        _initialize(anOwner);
    }

    /// @param anOwner The address of the owner of this account
    /// @notice Sets the owner of this account, and emits an event
    function _initialize(address anOwner) internal virtual {
        owner = anOwner;
        emit LightWalletInitialized(_entryPoint, owner);
    }

    /// @notice Require the function call went through EntryPoint or owner
    function _requireFromEntryPointOrOwner() internal view {
        require(msg.sender == address(entryPoint()) || msg.sender == owner, "account: not Owner or EntryPoint");
    }

    /// @inheritdoc BaseAccount
    function _validateSignature(UserOperation calldata userOp, bytes32 userOpHash)
        internal
        virtual
        override
        returns (uint256 validationData)
    {
        bytes32 hash = userOpHash.toEthSignedMessageHash();
        if (owner != hash.recover(userOp.signature)) {
            return SIG_VALIDATION_FAILED;
        }
        return 0;
    }

    /// @notice Executes a call to a target contract with specified value and data.
    /// @param target The address of the target contract to call.
    /// @param value The amount of Wei (ETH) to send along with the call.
    /// @param data The data payload to send along with the call.
    /// @dev This internal function uses the `call` function to make an external call to the target contract
    /// with the specified value and data. It captures the success status and returned data of the call.
    /// If the call is not successful, it reverts the transaction and provides the error message from the target contract.
    function _call(address target, uint256 value, bytes memory data) internal {
        (bool success, bytes memory result) = target.call{value: value}(data);
        if (!success) {
            assembly {
                revert(add(result, 32), mload(result))
            }
        }
    }

    /// @notice check current account deposit in the entryPoint
    function getDeposit() public view returns (uint256) {
        return entryPoint().balanceOf(address(this));
    }

    /// @notice deposit more funds for this account in the entryPoint
    function addDeposit() public payable {
        entryPoint().depositTo{value: msg.value}(address(this));
    }

    /// @notice Withdraws value from the account's deposit
    /// @param withdrawAddress target to send to
    /// @param amount to withdraw
    function withdrawDepositTo(address payable withdrawAddress, uint256 amount) public onlyOwner {
        entryPoint().withdrawTo(withdrawAddress, amount);
    }

    /// @inheritdoc UUPSUpgradeable
    function _authorizeUpgrade(address newImplementation) internal view override {
        (newImplementation);
        _onlyOwner();
    }

    function supportsInterface(bytes4) public pure override(ILightWallet, TokenCallbackHandler) returns (bool) {
        return false;
        // super.supportsInterface(interfaceId);
    }
}
