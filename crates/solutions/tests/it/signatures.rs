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

use ethers::types::Address;
use lightdotso_solutions::{
    io::write_wallet_config,
    recover::recover_signature,
    utils::{from_hex_string, parse_hex_to_bytes32},
};

const SIGNATURES: &[&str] = &[
    "0x0001636911b800019fa7b7e8ed25088c413074818ac10ab3bbcddb120bbec85083f3ba254e5547d953fe615a6474fd365326244dedd7afa3911ad39c956ca096d721064d6b29055d1b02",
    // "0x000263691389034a062f86183c9d46e129f0331f2a42f6ba22a3525a46ecd197fa23d177d75f2d040000a0033fce59919d0a4ee44a8066a3b1d0083760d89a06ae89edadf8a58e0e5c5ac5040400007b01016ffeccf6f31e0a469d55dede5651d34a6ecd9fc500017052a0438a13da22242bcd20c219630d839c364cd2b6042add1bee32774c37d72ba2ace8b7a79c95a536d4c0fed3fe05883c6e1188a4191a91623a903e4ec21c1b0203ad5831467806b6edd059ff5ac9809f2bb6e80512ceb5d466a67251ffb842fae1040000c50314b729622595218cdbef06c630daeea028e25e8ca048d97bc170d75feb9066ad0400007f030c8c0bb7e8c5ec8eed444ae25f3a1796597bcfacf5f6b758ae4fadd6fc416f560400005a0001e7618f1b7b012d7fc48f518f498bb6823dc2a8308984287501873cb535b6d5bf526fb91a220297f461ac5a2434d0e8e768c3bf166c329366ddc885bf2e1676271c0201014ef7ec718f66ae3920ea119b9d7ddf39337601f703fdea4c5fb23fb3cc2b2360057abef1ff7e7195acbdc4db555c27cc588a4585a6",
    // "0x0003636916740101a653f5900ef5c538142cd8aef1ce750390b29a3e0101a54e174d851bcffe8c1332c00e23156b4982204d0400002c0101ddfba5791de0b8da80d46b43915ae34c4876c4f80101f50834aa68dec4d9d151b1ff1c509c81431ddc450400008a0101e8e7c96af0d472a8d0e60e86009a97290fbc0f6d010188a175d23b41252823e7fd88297754f5c580c4ff0400005a0101653ca45307922091337376cb305485c0d889a7a10001d9b2a3142267255c50581c8023648916a3e8c3ae7ca50f6752b6874a20e76e496b30c4e1b653691b3ae9fea40a66966f3d1f2a35cedb52fbf07ae09269fb3c8e1b02040001180101a18522682c76e7e4083fcef379839347a533f782010159d7eb9085272adb317893df26e7f39dcfdda1ba0400002c0101c31ee68141cb47d2b260fe5a6e48b37d021d8f190101947ee7254d4de72f7a1b2e70ed3f8e8ae6510d77040000b8000147f646e6d13434b2df65fc1ab9086264bed1030e485e3513ed01686d03d127df510efc468bbeedde677c3af1fda7b0dbffc7186e07203eb09718cc256cf6b5d11b020101ce1977029e9398ec9f45327c81cf7a557f5d30b80400005a01010b6a69349728615d6e1c8d4fd133e49aafd5b91b0001aaac151a6ad4bf7f966db203164551a7c3c3969d15666dd2c75202231623f5ee2059711c84d2f216126bf3dc6cc63223eba079262e73c58da4f97583747c790b1c02",
    // "0x00010000000203f6dc189f16bb65c588ccd5c63aa805bcbeb6e90dd8a049cfba0936050f299087060400020000c3037c989a96925302993812c1ec3924bce3ba2ca0e8f7e3655e30f5b24d965aa18b040000880001a73ce16a9cc7075c18bd2b4fd2649812fecb51460353a55bf62f821bf884443a169e0d0e04113d7ef2c2d15f1ecf46531f291259542065c556f0e721a82b3c581b02000193f1f388009f68763df43632153155960ea6604723bb517e90788822ff21e38722be4387e8f67c0db677b74d9a0c2a804183e6a3eebd2ba53dbfc54432f1a10f1b020101907c144d2490f49838c6499507ee5914f4a22b5b",
    // "0x020001636a2c7d032b4c067647ee1f154214b4ad83bbbe7e57a528ca0df587e34ded382ca7348c100400006703c702696d354063d18d750cc686a1f356e503f85516c54375ef5878250a22758704000042054cd7065b01927d3429db64e0a7ec956fa5506dab23fa37c767eb4375fab7898b032acf6636e813600f741841733e57a7e0cb4131f3c68db7ba7014fb94525f5de20302c10a9634e89b4293346a7408364eeece764491bd465d043f7c826518c2bc9501011a9bd9f98e2c0c81bcf51da26c3a7cfcc18c43b4030c389524f715de03757bcbc7a084f52c5d54def431bb8080a18d0075e26b859c0101379b2a7a384376b420d3d19c5c5717abaad3a969",
    // "0x010002636a33a501012093ec341be249baa0c8afa35fef368a90a483900201cd907cf455a1a00a4ebe37ef5f4bb7abc3770a6900004228230cc5c4ee221c093054fef22c12d534f4d63782bc94a160c2f781cef142e019b84d82070b67cb750ec9ba46ae49e6687591810099f6e58811fbe35ea3db451c0202014bffabff5819087514d8db622543c3d0d89cd64d000042844e002b27098ba6144bc9eb7950cd20a4062d265bdd042bffbb7ec8405caf7f60f1c5bdcd8ea4f4acee17d5ac9eac6bcdb40a20a41796d40a153278ab062b211c020101e8c4a6eb40ece266c7a58670493ee0727be4d20a"
];

const IMAGE_HASHES: &[&str] = &[
    "0xc9185cef7e5a78ba5220f4f1e7854a8e257cc0191aab3a3b8c3f9e2cca6f6bb2",
    // "0x31c3b158a831db1c1b5f6e4f932c78ab34ae031f800b0e3e175c63c4cc8a4d06",
    // "0x31c3b158a831db1c1b5f6e4f932c78ab34ae031f800b0e3e175c63c4cc8a4d06",
    // "0x31c3b158a831db1c1b5f6e4f932c78ab34ae031f800b0e3e175c63c4cc8a4d06",
    // "0x31c3b158a831db1c1b5f6e4f932c78ab34ae031f800b0e3e175c63c4cc8a4d06",
    // "0x31c3b158a831db1c1b5f6e4f932c78ab34ae031f800b0e3e175c63c4cc8a4d06",
];

#[tokio::test(flavor = "multi_thread")]
async fn test_integration_signatures() {
    for (i, signature) in SIGNATURES.iter().enumerate() {
        let sig = from_hex_string(signature).unwrap().into();
        // Notice that the recovered addresses are hypothetical as we don't have the original
        // user_op_hash that was used for the subdigest.
        let user_op_hash = parse_hex_to_bytes32(
            "0x0000000000000000000000000000000000000000000000000000000000000001",
        )
        .unwrap();

        let recovered_config =
            recover_signature(Address::zero(), 1, user_op_hash, sig).await.unwrap();

        // Check that the recovered config matches the expected config
        let expected_config_hash = IMAGE_HASHES[i];
        assert_eq!(
            recovered_config.image_hash,
            parse_hex_to_bytes32(expected_config_hash).unwrap().into()
        );

        let path_name = format!("tests/samples/wallet_config_{}.json", i);

        // Write WalletConfig back to a different JSON file
        write_wallet_config(&recovered_config.clone(), path_name).unwrap();
        insta::assert_debug_snapshot!(i.to_string(), recovered_config.clone().tree);
    }
}
