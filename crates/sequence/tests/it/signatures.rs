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

// Copyright 2017-present Horizon Blockchain Games Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

use alloy::primitives::Address;
use eyre::Result;
use lightdotso_common::traits::VecU8ToHex;
use lightdotso_sequence::{
    config::WalletConfig,
    io::write_wallet_config,
    recover::recover_signature,
    types::{ECDSASignatureLeaf, ECDSASignatureType, SignatureLeaf, Signer, SignerNode},
    utils::{from_hex_string, parse_hex_to_bytes32},
};

// Signatures and testcases brought from: https://github.com/0xsequence/go-sequence/blob/659864efe21b1ead7615434a5075c35d4e85abde/core/v2/v2_test.go#L21
// License: Apache-2.0

// Also from: https://github.com/0xsequence/sequence.js/blob/e5659ab1a304ae48b28c843b0d99fb3b3f6bc0b1/packages/core/tests/v2/signature.spec.ts
// License: Apache-2.0
const SIGNATURES: &[&str] = &[
    "0x0001636911b800019fa7b7e8ed25088c413074818ac10ab3bbcddb120bbec85083f3ba254e5547d953fe615a6474fd365326244dedd7afa3911ad39c956ca096d721064d6b29055d1b02",
    "0x000263691389034a062f86183c9d46e129f0331f2a42f6ba22a3525a46ecd197fa23d177d75f2d040000a0033fce59919d0a4ee44a8066a3b1d0083760d89a06ae89edadf8a58e0e5c5ac5040400007b01016ffeccf6f31e0a469d55dede5651d34a6ecd9fc500017052a0438a13da22242bcd20c219630d839c364cd2b6042add1bee32774c37d72ba2ace8b7a79c95a536d4c0fed3fe05883c6e1188a4191a91623a903e4ec21c1b0203ad5831467806b6edd059ff5ac9809f2bb6e80512ceb5d466a67251ffb842fae1040000c50314b729622595218cdbef06c630daeea028e25e8ca048d97bc170d75feb9066ad0400007f030c8c0bb7e8c5ec8eed444ae25f3a1796597bcfacf5f6b758ae4fadd6fc416f560400005a0001e7618f1b7b012d7fc48f518f498bb6823dc2a8308984287501873cb535b6d5bf526fb91a220297f461ac5a2434d0e8e768c3bf166c329366ddc885bf2e1676271c0201014ef7ec718f66ae3920ea119b9d7ddf39337601f703fdea4c5fb23fb3cc2b2360057abef1ff7e7195acbdc4db555c27cc588a4585a6",
    "0x0003636916740101a653f5900ef5c538142cd8aef1ce750390b29a3e0101a54e174d851bcffe8c1332c00e23156b4982204d0400002c0101ddfba5791de0b8da80d46b43915ae34c4876c4f80101f50834aa68dec4d9d151b1ff1c509c81431ddc450400008a0101e8e7c96af0d472a8d0e60e86009a97290fbc0f6d010188a175d23b41252823e7fd88297754f5c580c4ff0400005a0101653ca45307922091337376cb305485c0d889a7a10001d9b2a3142267255c50581c8023648916a3e8c3ae7ca50f6752b6874a20e76e496b30c4e1b653691b3ae9fea40a66966f3d1f2a35cedb52fbf07ae09269fb3c8e1b02040001180101a18522682c76e7e4083fcef379839347a533f782010159d7eb9085272adb317893df26e7f39dcfdda1ba0400002c0101c31ee68141cb47d2b260fe5a6e48b37d021d8f190101947ee7254d4de72f7a1b2e70ed3f8e8ae6510d77040000b8000147f646e6d13434b2df65fc1ab9086264bed1030e485e3513ed01686d03d127df510efc468bbeedde677c3af1fda7b0dbffc7186e07203eb09718cc256cf6b5d11b020101ce1977029e9398ec9f45327c81cf7a557f5d30b80400005a01010b6a69349728615d6e1c8d4fd133e49aafd5b91b0001aaac151a6ad4bf7f966db203164551a7c3c3969d15666dd2c75202231623f5ee2059711c84d2f216126bf3dc6cc63223eba079262e73c58da4f97583747c790b1c02",
    "0x00010000000203f6dc189f16bb65c588ccd5c63aa805bcbeb6e90dd8a049cfba0936050f299087060400020000c3037c989a96925302993812c1ec3924bce3ba2ca0e8f7e3655e30f5b24d965aa18b040000880001a73ce16a9cc7075c18bd2b4fd2649812fecb51460353a55bf62f821bf884443a169e0d0e04113d7ef2c2d15f1ecf46531f291259542065c556f0e721a82b3c581b02000193f1f388009f68763df43632153155960ea6604723bb517e90788822ff21e38722be4387e8f67c0db677b74d9a0c2a804183e6a3eebd2ba53dbfc54432f1a10f1b020101907c144d2490f49838c6499507ee5914f4a22b5b",
    "0x020001636a2c7d032b4c067647ee1f154214b4ad83bbbe7e57a528ca0df587e34ded382ca7348c100400006703c702696d354063d18d750cc686a1f356e503f85516c54375ef5878250a22758704000042054cd7065b01927d3429db64e0a7ec956fa5506dab23fa37c767eb4375fab7898b032acf6636e813600f741841733e57a7e0cb4131f3c68db7ba7014fb94525f5de20302c10a9634e89b4293346a7408364eeece764491bd465d043f7c826518c2bc9501011a9bd9f98e2c0c81bcf51da26c3a7cfcc18c43b4030c389524f715de03757bcbc7a084f52c5d54def431bb8080a18d0075e26b859c0101379b2a7a384376b420d3d19c5c5717abaad3a969",
    "0x010002636a33a501012093ec341be249baa0c8afa35fef368a90a483900201cd907cf455a1a00a4ebe37ef5f4bb7abc3770a6900004228230cc5c4ee221c093054fef22c12d534f4d63782bc94a160c2f781cef142e019b84d82070b67cb750ec9ba46ae49e6687591810099f6e58811fbe35ea3db451c0202014bffabff5819087514d8db622543c3d0d89cd64d000042844e002b27098ba6144bc9eb7950cd20a4062d265bdd042bffbb7ec8405caf7f60f1c5bdcd8ea4f4acee17d5ac9eac6bcdb40a20a41796d40a153278ab062b211c020101e8c4a6eb40ece266c7a58670493ee0727be4d20a"
];

#[tokio::test(flavor = "multi_thread")]
async fn test_integration_signatures() -> Result<()> {
    for (i, signature) in SIGNATURES.iter().enumerate() {
        println!("{}", i);

        let sig = from_hex_string(signature)?.into();
        // Notice that the recovered addresses are hypothetical as we don't have the original
        // user_op_hash that was used for the subdigest.
        let user_op_hash = parse_hex_to_bytes32(
            "0x0000000000000000000000000000000000000000000000000000000000000001",
        )?;

        let config = recover_signature(Address::zero(), 1, user_op_hash, sig).await?;

        // println!("tree: {:?}", config.tree);

        // println!("signers: {:?}", config.tree.get_signers());

        // Check that the recovered config matches the expected config image hash
        // assert_eq!(
        //     config.image_hash,
        //     parse_hex_to_bytes32(
        //         "0xc9185cef7e5a78ba5220f4f1e7854a8e257cc0191aab3a3b8c3f9e2cca6f6bb2"
        //     )
        //     ?
        //     .into()
        // );

        // Encode the config into bytes and print it
        let recovered_signature = config.encode()?;
        println!("{}", recovered_signature.to_hex_string());
        println!("{}", signature);
        // Print if the recovered signature matches the original signature (true or false)
        println!("{}", &recovered_signature.to_hex_string() == signature);
        assert_eq!(&recovered_signature.to_hex_string(), signature);

        // Write WalletConfig back to a different JSON file
        let path_name = format!("tests/samples/wallet_config_{}.json", i);
        write_wallet_config(&config.clone(), path_name)?;
        insta::assert_debug_snapshot!(i.to_string(), config.clone().tree);
    }
    Ok(())
}

#[tokio::test(flavor = "multi_thread")]
async fn test_integration_signature_reduce() -> Result<()> {
    let signature = "0x0200050000000a0102aa79283d0206aba8c14a2a30df589648c54490e7020314327739c49f93a04c38623b54a4a75b49e6f646000062020001000000000001fde94c874698620141d895ddd82dc36898bd03b2dd2dd6b970e25fbabc54fd6e65eaf44b207f28dd282e0e8661196d9d4c112c12f4798ac7ac46c8d814df79571b020101b1f69536d293ee3764ce9881894a68029666a851030400005a00034d2c18410daf9379ce00b4ef13330a18b8677c1b95e814c8859ce1159668cf2a5180c7a5b809a746574ed14403dd5f78828c718a8aaac8924a7dfab22a5d85a11b020102cae521702a655832403bf3f751dce0be2fe8af2a0400005c0102b02b38d317751d4b7864097800a82b4f2090b2f70102b53dafe1716b3a7c5ee2072c6881658447fe465a0400002c0102254f1e583509980fe791fb12a0471d7c59c06ad50102ef86b8b2e0cf2ff0660840031f45adc50abd734c0102080aa40b944885f166dedade5f4d5fa4a13cbfad";
    let sig = from_hex_string(signature)?.into();
    // Notice that the recovered addresses are hypothetical as we don't have the original
    // user_op_hash that was used for the subdigest.
    let user_op_hash =
        parse_hex_to_bytes32("0x0000000000000000000000000000000000000000000000000000000000000001")?;

    let mut config = recover_signature(Address::zero(), 1, user_op_hash, sig).await?;

    // Write reducedd WalletConfig back to a different JSON file
    let path_name = "tests/samples/wallet_reduced_config_before.json".to_string();
    write_wallet_config(&config.clone(), path_name)?;

    // Reduce the config
    config.reduce();
    let new_recovered_signature = config.encode()?;

    let reduced_signature = "0x0200050000000a0102aa79283d0206aba8c14a2a30df589648c54490e7020314327739c49f93a04c38623b54a4a75b49e6f646000062020001000000000001fde94c874698620141d895ddd82dc36898bd03b2dd2dd6b970e25fbabc54fd6e65eaf44b207f28dd282e0e8661196d9d4c112c12f4798ac7ac46c8d814df79571b020101b1f69536d293ee3764ce9881894a68029666a851030400005a00034d2c18410daf9379ce00b4ef13330a18b8677c1b95e814c8859ce1159668cf2a5180c7a5b809a746574ed14403dd5f78828c718a8aaac8924a7dfab22a5d85a11b020102cae521702a655832403bf3f751dce0be2fe8af2a03e2496cd84fa4ff4c8516a508536c5a3a13cfccc3887d1bd321ed005989ce42130102080aa40b944885f166dedade5f4d5fa4a13cbfad";
    println!("{}", new_recovered_signature.to_hex_string());
    println!("{}", reduced_signature);
    assert_eq!(new_recovered_signature.to_hex_string(), reduced_signature);

    // Write reducedd WalletConfig back to a different JSON file
    let path_name = "tests/samples/wallet_reduced_config_after.json".to_string();
    write_wallet_config(&config.clone(), path_name)?;

    Ok(())
}

// From: https://polygonscan.com/tx/0x8e95d8beba91c488a97cac3b8345b6d361ff535f674904477a834f4ad73946ab
// And: https://sequence.xyz/blog/sequence-wallet-light-state-sync-full-merkle-wallets

#[tokio::test(flavor = "multi_thread")]
async fn test_integration_signature_chained() -> Result<()> {
    // 0x030000ea00000500000004020314327739c49f93a04c38623b54a4a75b49e6f646000062010001000000000001482fa2ca36fb44cf7aadeb0d5edb2058460a0e128ab8b1a25046b238077bc204536eb5fda70161b84a4c9aa90a7ea0ce2972eaebdb2237532d890b1c8d6cae251c020101b1f69536d293ee3764ce9881894a68029666a8510303000000000000000000000003c5b0a31f0bc8826cfa50ca7ff9ef8c9575b455cd04000044000299db45fa81db22da69760a8bd50cd7e05942d3cfbe2a7958964ff82ddee6ab6417694d85fba90531538345149694f75cc2706a682a8c841ea8f103b578f71aa71c020000bb02000500000003010314327739c49f93a04c38623b54a4a75b49e6f6460003542ea3eadd73da47d8d21ef396b16de52a4a06966d38543e27f99451060f65200ff1156ae2e0d65b3e8744d69c605df7d0626c2170ded9106f6086cf83fac5661b02010249347ff9f42abbec20688c29dfd46b89833be98b0002aff316fdbebdecd551e44907d1d31ab8c9b1f90233e9a240e7cc997ec16f503136a31cd75bb25e95478abd15873feb01cb686e2adaa5dd3058fa66f22446fa901b020000dc020005000000000102434cafcb9284bcbf43e7ca0474332da42b1ec511020314327739c49f93a04c38623b54a4a75b49e6f64600006202000100000000000193103acf7b5de30967049e72c072b480bc94998d5db85901ecabaffcc18b8bf900b0a5d176ac0c60f87f3db2f235c4afc977972c4b9273b1111765412bf568131b020101b1f69536d293ee3764ce9881894a68029666a851030003ddbd5d2cfbce11ff281d20cff6e1a3d62e4c2b724c6169674adc5e47143dfcc32ecb3b06c7a79228b219b2824c799117bf24d79664ed19ab9f526778a36403b21c02
    let signature = "0x030000ea000500000004020314327739c49f93a04c38623b54a4a75b49e6f646000062010001000000000001482fa2ca36fb44cf7aadeb0d5edb2058460a0e128ab8b1a25046b238077bc204536eb5fda70161b84a4c9aa90a7ea0ce2972eaebdb2237532d890b1c8d6cae251c020101b1f69536d293ee3764ce9881894a68029666a8510303000000000000000000000003c5b0a31f0bc8826cfa50ca7ff9ef8c9575b455cd04000044000299db45fa81db22da69760a8bd50cd7e05942d3cfbe2a7958964ff82ddee6ab6417694d85fba90531538345149694f75cc2706a682a8c841ea8f103b578f71aa71c020000bb02000500000003010314327739c49f93a04c38623b54a4a75b49e6f6460003542ea3eadd73da47d8d21ef396b16de52a4a06966d38543e27f99451060f65200ff1156ae2e0d65b3e8744d69c605df7d0626c2170ded9106f6086cf83fac5661b02010249347ff9f42abbec20688c29dfd46b89833be98b0002aff316fdbebdecd551e44907d1d31ab8c9b1f90233e9a240e7cc997ec16f503136a31cd75bb25e95478abd15873feb01cb686e2adaa5dd3058fa66f22446fa901b020000dc020005000000000102434cafcb9284bcbf43e7ca0474332da42b1ec511020314327739c49f93a04c38623b54a4a75b49e6f64600006202000100000000000193103acf7b5de30967049e72c072b480bc94998d5db85901ecabaffcc18b8bf900b0a5d176ac0c60f87f3db2f235c4afc977972c4b9273b1111765412bf568131b020101b1f69536d293ee3764ce9881894a68029666a851030003ddbd5d2cfbce11ff281d20cff6e1a3d62e4c2b724c6169674adc5e47143dfcc32ecb3b06c7a79228b219b2824c799117bf24d79664ed19ab9f526778a36403b21c02";
    let sig = from_hex_string(signature)?.into();
    // Notice that the recovered addresses are hypothetical as we don't have the original
    // user_op_hash that was used for the subdigest.

    // user_op_hash that was used for the subdigest.
    let user_op_hash =
        parse_hex_to_bytes32("0x0000000000000000000000000000000000000000000000000000000000000001")?;

    let config = recover_signature(
        "0xb50C80e499b278f0af6A3633f751C72FDe2D9837".parse().unwrap(),
        137,
        user_op_hash,
        sig,
    )
    .await?;

    println!("config: {:?}", config);

    println!("tree: {:?}", config.tree);

    println!("signers: {:?}", config.tree.get_signers());

    // Check that the recovered config matches the expected config image hash
    // assert_eq!(
    //     config.image_hash,
    //     parse_hex_to_bytes32(
    //         "0xc9185cef7e5a78ba5220f4f1e7854a8e257cc0191aab3a3b8c3f9e2cca6f6bb2"
    //     )
    //     ?
    //     .into()
    // );

    // Encode the config into bytes and print it
    let recovered_signature = config.encode_chained_wallet()?;
    println!("{}", recovered_signature.to_hex_string());
    println!("{}", signature);
    // Print if the recovered signature matches the original signature (true or false)
    println!("{}", recovered_signature.to_hex_string() == signature);
    // assert_eq!(&recovered_signature.to_hex_string(), signature);

    // Write WalletConfig back to a different JSON file
    write_wallet_config(&config.clone(), "tests/samples/wallet_config_chained.json")?;

    Ok(())
}

#[tokio::test(flavor = "multi_thread")]
async fn test_integration_chained_gen() -> Result<()> {
    let chained_config: WalletConfig = WalletConfig {
        signature_type: 1,
        checkpoint: 1,
        weight: 1,
        threshold: 1,
        image_hash: [0; 32].into(),
        internal_root: None,
        internal_recovered_configs: Some(vec![WalletConfig {
            signature_type: 2,
            checkpoint: 0,
            weight: 1,
            threshold: 1,
            image_hash: [0; 32].into(),
            internal_root: None,
            internal_recovered_configs: None,
            tree: SignerNode {
            left: None,
            right: None,
            signer: Some(Signer {
                weight: Some(1),
                leaf: SignatureLeaf::ECDSASignature(ECDSASignatureLeaf {
                    address: "0xdafea492d9c6733ae3d56b7ed1adb60692c98bc5".parse()?,
                    signature_type: ECDSASignatureType::ECDSASignatureTypeEthSign,
                    signature: "0x4b431224357fe2a82405e3ed7610f80ee18d9c1932b2375fb37092260987cd9868e07f931f065c1ea97a3847078e95dc85ad38a8069b6493a36a2820fa35541d1b".into(),
                }),
            }),
        },
        }]),
        tree: SignerNode {
            left: None,
            right: None,
            signer: Some(Signer {
                weight: Some(1),
                leaf: SignatureLeaf::ECDSASignature(ECDSASignatureLeaf {
                    address: "0xdafea492d9c6733ae3d56b7ed1adb60692c98bc5".parse()?,
                    signature_type: ECDSASignatureType::ECDSASignatureTypeEthSign,
                    signature: "0xd3525fcc1e1b58e219d7e3884d2e659dca86bceb4313ec1f9e7d7fca362e1664149b56962a1e382d7e59436c3022d48599a3b693cb3dbced2bdd9740bed894301c".into(),
                }),
            }),
        },
    };
    let recovered_signature = chained_config.encode_chained_wallet()?;
    let recovered_signature_str = recovered_signature.to_hex_string();
    println!("{}", recovered_signature_str);

    let signature =
    "0x0300004b010001000000010001d3525fcc1e1b58e219d7e3884d2e659dca86bceb4313ec1f9e7d7fca362e1664149b56962a1e382d7e59436c3022d48599a3b693cb3dbced2bdd9740bed894301c0200004b0200010000000000014b431224357fe2a82405e3ed7610f80ee18d9c1932b2375fb37092260987cd9868e07f931f065c1ea97a3847078e95dc85ad38a8069b6493a36a2820fa35541d1b02";
    let sig = from_hex_string(signature)?.into();

    // Print if the recovered signature matches the original signature (true or false)
    println!("{}", recovered_signature_str == signature);
    assert_eq!(recovered_signature_str, signature);

    // Notice that the recovered addresses are hypothetical as we don't have the original
    // user_op_hash that was used for the subdigest.

    // user_op_hash that was used for the subdigest.
    let user_op_hash =
        parse_hex_to_bytes32("0xabca39f6acbf52a8b6534ca7b4a2ff0ec1b3feccc6c73360f90bd031712d947a")?;

    let config = recover_signature(
        "0x4f38F54248D4d5aEa446977dD10ef128e5250114".parse().unwrap(),
        137,
        user_op_hash,
        sig,
    )
    .await?;

    println!("config: {:?}", config);

    println!("tree: {:?}", config.tree);

    println!("signers: {:?}", config.tree.get_signers());

    // Check that the recovered config matches the expected config image hash
    // assert_eq!(
    //     config.image_hash,
    //     parse_hex_to_bytes32(
    //         "0xc9185cef7e5a78ba5220f4f1e7854a8e257cc0191aab3a3b8c3f9e2cca6f6bb2"
    //     )
    //     ?
    //     .into()
    // );

    // Encode the config into bytes and print it
    // let recovered_signature = config.encode_chained_wallet()?;
    // println!("{}", recovered_signature.to_hex_string());
    // println!("{}", signature);
    // // Print if the recovered signature matches the original signature (true or false)
    // println!("{}", recovered_signature.to_hex_string() == signature);
    // assert_eq!(&recovered_signature.to_hex_string(), signature);

    // // Write WalletConfig back to a different JSON file
    // write_wallet_config(&config.clone(), "tests/samples/wallet_config_chained.json")?;

    Ok(())
}

// 0x030000eb02000500000004020314327739c49f93a04c38623b54a4a75b49e6f646000062010001000000000001482fa2ca36fb44cf7aadeb0d5edb2058460a0e128ab8b1a25046b238077bc204536eb5fda70161b84a4c9aa90a7ea0ce2972eaebdb2237532d890b1c8d6cae251c020101b1f69536d293ee3764ce9881894a68029666a8510303000000000000000000000003c5b0a31f0bc8826cfa50ca7ff9ef8c9575b455cd04000044000299db45fa81db22da69760a8bd50cd7e05942d3cfbe2a7958964ff82ddee6ab6417694d85fba90531538345149694f75cc2706a682a8c841ea8f103b578f71aa71c020000bb02000500000003010314327739c49f93a04c38623b54a4a75b49e6f6460003542ea3eadd73da47d8d21ef396b16de52a4a06966d38543e27f99451060f65200ff1156ae2e0d65b3e8744d69c605df7d0626c2170ded9106f6086cf83fac5661b02010249347ff9f42abbec20688c29dfd46b89833be98b0002aff316fdbebdecd551e44907d1d31ab8c9b1f90233e9a240e7cc997ec16f503136a31cd75bb25e95478abd15873feb01cb686e2adaa5dd3058fa66f22446fa901b020000dc020005000000000102434cafcb9284bcbf43e7ca0474332da42b1ec511020314327739c49f93a04c38623b54a4a75b49e6f64600006202000100000000000193103acf7b5de30967049e72c072b480bc94998d5db85901ecabaffcc18b8bf900b0a5d176ac0c60f87f3db2f235c4afc977972c4b9273b1111765412bf568131b020101b1f69536d293ee3764ce9881894a68029666a851030003ddbd5d2cfbce11ff281d20cff6e1a3d62e4c2b724c6169674adc5e47143dfcc32ecb3b06c7a79228b219b2824c799117bf24d79664ed19ab9f526778a36403b21c02
// 0x030000ea000500000004020314327739c49f93a04c38623b54a4a75b49e6f646000062010001000000000001482fa2ca36fb44cf7aadeb0d5edb2058460a0e128ab8b1a25046b238077bc204536eb5fda70161b84a4c9aa90a7ea0ce2972eaebdb2237532d890b1c8d6cae251c020101b1f69536d293ee3764ce9881894a68029666a8510303000000000000000000000003c5b0a31f0bc8826cfa50ca7ff9ef8c9575b455cd04000044000299db45fa81db22da69760a8bd50cd7e05942d3cfbe2a7958964ff82ddee6ab6417694d85fba90531538345149694f75cc2706a682a8c841ea8f103b578f71aa71c020000bb02000500000003010314327739c49f93a04c38623b54a4a75b49e6f6460003542ea3eadd73da47d8d21ef396b16de52a4a06966d38543e27f99451060f65200ff1156ae2e0d65b3e8744d69c605df7d0626c2170ded9106f6086cf83fac5661b02010249347ff9f42abbec20688c29dfd46b89833be98b0002aff316fdbebdecd551e44907d1d31ab8c9b1f90233e9a240e7cc997ec16f503136a31cd75bb25e95478abd15873feb01cb686e2adaa5dd3058fa66f22446fa901b020000dc020005000000000102434cafcb9284bcbf43e7ca0474332da42b1ec511020314327739c49f93a04c38623b54a4a75b49e6f64600006202000100000000000193103acf7b5de30967049e72c072b480bc94998d5db85901ecabaffcc18b8bf900b0a5d176ac0c60f87f3db2f235c4afc977972c4b9273b1111765412bf568131b020101b1f69536d293ee3764ce9881894a68029666a851030003ddbd5d2cfbce11ff281d20cff6e1a3d62e4c2b724c6169674adc5e47143dfcc32ecb3b06c7a79228b219b2824c799117bf24d79664ed19ab9f526778a36403b21c02
