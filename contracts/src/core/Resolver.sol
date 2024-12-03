// Copyright 2023-2024 LightDotSo.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

// From: https://basescan.org/address/0x80227007ea32188620ce93ed8702807dd7e5af61#code
// Thank you to the Rhinestone team for their open source resolver!

import {AttestationRecord, ModuleRecord} from "registry/DataTypes.sol";
import {IExternalResolver} from "@rhinestone/registry/src/external/IExternalResolver.sol";

contract Resolver is IExternalResolver {
    function resolveAttestation(AttestationRecord calldata attestation)
        public
        payable
        returns (bool attestationIsValid)
    {
        return true;
    }

    function resolveAttestation(AttestationRecord[] calldata attestation)
        external
        payable
        returns (bool)
    {
        return true;
    }

    function resolveRevocation(AttestationRecord calldata attestation)
        external
        payable
        returns (bool)
    {
        return true;
    }

    function resolveRevocation(AttestationRecord[] calldata attestation)
        external
        payable
        returns (bool)
    {
        return true;
    }

    function resolveModuleRegistration(
        address sender,
        address moduleAddress,
        ModuleRecord calldata record,
        bytes calldata resolverContext
    )
        external
        payable
        returns (bool)
    {
        return true;
    }

    function supportsInterface(bytes4 interfaceID) external pure override returns (bool) {
        return (interfaceID == type(IExternalResolver).interfaceId);
    }
}
