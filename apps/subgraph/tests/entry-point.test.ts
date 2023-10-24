// Copyright (C) 2023 Light, Inc.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

// import {
// assert,
// describe,
// test,
// clearStore,
// beforeAll,
// afterAll,
// } from "matchstick-as/assembly/index";
// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
// import { Bytes, Address, BigInt } from "@graphprotocol/graph-ts";
// import { AccountDeployed } from "../generated/schema";
// import { AccountDeployed as AccountDeployedEvent } from "../generated/EntryPointv0.6.0/EntryPoint";
// import { handleAccountDeployed } from "../src/entry-point";
// import { createAccountDeployedEvent } from "./entry-point-utils";

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

// export { handleAccountDeployed };

// test(
//   "Should throw an error",
//   () => {
//     throw new Error();
//   },
//   true,
// );

// describe("Describe entity assertions", () => {
//   beforeAll(() => {
//     let userOpHash = Bytes.fromI32(1234567890);
//     let sender = Address.fromString(
//       "0x0000000000000000000000000000000000000001",
//     );
//     let factory = Address.fromString(
//       "0x0000000000000000000000000000000000000001",
//     );
//     let paymaster = Address.fromString(
//       "0x0000000000000000000000000000000000000001",
//     );
//     let newAccountDeployedEvent = createAccountDeployedEvent(
//       userOpHash,
//       sender,
//       factory,
//       paymaster,
//     );
//     handleAccountDeployed(newAccountDeployedEvent);
//   });

// afterAll(() => {
//   clearStore();
// });

// For more test scenarios, see:
// https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

//   test("AccountDeployed created and stored", () => {
//     assert.entityCount("AccountDeployed", 1);

//     // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
//     // assert.fieldEquals(
//     //   "AccountDeployed",
//     //   "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
//     //   "userOpHash",
//     //   "1234567890",
//     // );
//     // assert.fieldEquals(
//     //   "AccountDeployed",
//     //   "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
//     //   "sender",
//     //   "0x0000000000000000000000000000000000000001",
//     // );
//     // assert.fieldEquals(
//     //   "AccountDeployed",
//     //   "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
//     //   "factory",
//     //   "0x0000000000000000000000000000000000000001",
//     // );
//     // assert.fieldEquals(
//     //   "AccountDeployed",
//     //   "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
//     //   "paymaster",
//     //   "0x0000000000000000000000000000000000000001",
//     // );

//     // More assert options:
//     // https://thegraph.com/docs/en/developer/matchstick/#asserts
//   });
// });
