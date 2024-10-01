use crate::paymaster::{estimate_request_gas_estimation, estimate_user_operation_gas};
use alloy::primitives::{Address, Bytes, U256};
use eyre::Result;
use lightdotso_contracts::types::{
    EstimateResult, PackedUserOperation, PackedUserOperationRequest, UserOperation,
    UserOperationRequest,
};
use lightdotso_tracing::tracing::{info, warn};

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

/// Construct the user operation w/ rpc.
pub async fn construct_user_operation(
    chain_id: u64,
    user_operation: UserOperationRequest,
    entry_point: Address,
) -> Result<UserOperation> {
    // If the `preVerificationGas`, `verificationGasLimit`, and `callGasLimit` are set,
    // override the gas estimation for the user operatioin
    let estimated_user_operation_gas: EstimateResult = if user_operation
        .pre_verification_gas
        .is_some_and(|pre_verification_gas| pre_verification_gas > U256::ZERO) &&
        user_operation
            .verification_gas_limit
            .is_some_and(|verification_gas_limit| verification_gas_limit > U256::ZERO) &&
        user_operation.call_gas_limit.is_some_and(|call_gas_limit| call_gas_limit > U256::ZERO)
    {
        warn!("Overriding the gas estimation for the user operation");
        EstimateResult {
            pre_verification_gas: user_operation.pre_verification_gas.unwrap(),
            verification_gas_limit: user_operation.verification_gas_limit.unwrap(),
            call_gas_limit: user_operation.call_gas_limit.unwrap(),
        }
    } else {
        // If the `estimate_user_operation_gas` is not set, estimate the gas for the user operation.
        estimate_user_operation_gas(chain_id, entry_point, &user_operation).await?.result
    };
    info!("estimated_user_operation_gas: {:?}", estimated_user_operation_gas);

    // If the `maxFeePerGas` and `maxPriorityFeePerGas` are set, include them in the user operation.
    if user_operation.max_fee_per_gas.is_some_and(|max_fee_per_gas| max_fee_per_gas > U256::ZERO) &&
        user_operation
            .max_priority_fee_per_gas
            .is_some_and(|max_priority_fee_per_gas| max_priority_fee_per_gas > U256::ZERO)
    {
        warn!("Overriding the gas estimation for the user operation w/ the maxFeePerGas and maxPriorityFeePerGas");
        return Ok(UserOperation {
            call_data: user_operation.call_data,
            init_code: user_operation.init_code,
            nonce: user_operation.nonce,
            sender: user_operation.sender,
            call_gas_limit: estimated_user_operation_gas.call_gas_limit,
            verification_gas_limit: estimated_user_operation_gas.verification_gas_limit,
            pre_verification_gas: estimated_user_operation_gas.pre_verification_gas,
            max_fee_per_gas: user_operation.max_fee_per_gas.unwrap(),
            max_priority_fee_per_gas: user_operation.max_priority_fee_per_gas.unwrap(),
            signature: user_operation.signature,
            paymaster_and_data: Bytes::default(),
        });
    }

    // Get the estimated request gas because required gas parameters are not set.
    let estimated_request_gas = estimate_request_gas_estimation(chain_id).await?.result;

    Ok(UserOperation {
        call_data: user_operation.call_data,
        init_code: user_operation.init_code,
        nonce: user_operation.nonce,
        sender: user_operation.sender,
        call_gas_limit: estimated_user_operation_gas.call_gas_limit,
        verification_gas_limit: estimated_user_operation_gas.verification_gas_limit,
        pre_verification_gas: estimated_user_operation_gas.pre_verification_gas,
        max_fee_per_gas: estimated_request_gas.high.max_fee_per_gas,
        max_priority_fee_per_gas: estimated_request_gas.high.max_priority_fee_per_gas,
        signature: user_operation.signature,
        paymaster_and_data: Bytes::default(),
    })
}

/// Construct the packed user operation.
pub fn construct_packed_user_operation(
    _chain_id: u64,
    _user_operation: PackedUserOperationRequest,
    _entry_point: Address,
) -> Result<PackedUserOperation> {
    todo!()
}
