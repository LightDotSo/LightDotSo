// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.18;

import {UltraVerifier} from "@/circuits/contract/plonk_vk.sol";

contract LightVerifier {
    UltraVerifier public verifier;

    constructor(UltraVerifier _verifier) {
        verifier = _verifier;
    }

    function verifyEqual(bytes calldata proof, bytes32[] calldata y) public view returns (bool) {
        bool proofResult = verifier.verify(proof, y);
        require(proofResult, "Proof is not valid");
        return proofResult;
    }
}
