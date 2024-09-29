# References

## Bundler

- [Rundler](https://github.com/alchemyplatform/rundler)'s bundler utils for axum's user_operation routes in [./crates/axum/src/routes/user_operation.rs](./crates/axum/src/routes/user_operation.rs)

## Contracts

- [0xsequence/wallet-contracts](https://github.com/0xsequence/wallet-contracts) for base `MainModuleUpgradable.sol` for [LightWallet.sol](./contracts/src/LightWallet.sol)
- [0xsequence/wallet-contracts](https://github.com/0xsequence/wallet-contracts) for entirety of rust implementation of signature decoding/encoding from [go-sequence](https://github.com/0xsequence/go-sequence) in rust at [./crates/sequence](./crates/sequence) and typescript at [./packages/sequence](./packages/sequence)
- [Amphor Protocol](https://github.com/amphor-protocol/asynchronous-vault) for the ERC4626 and ERC7540 compatible asynchronous token vault implementation which is used to handle our protocol token vaults in [./contracts/src/LightVault.sol](./contracts/src/LightVault.sol)
- [Coinbase](https://github.com/coinbase/magic-spend) for the flexible payment paymaster implementation which is used to handle the flexible payment paymaster functionality for 4337 compatible wallets in [./contracts/src/LightPaymaster.sol](./contracts/src/LightPaymaster.sol)

## UI

- [shacdn/ui](https://ui.shadcn.com/) for the entirety of the base UI components in [packages/ui](./packages/ui/), [wallet-switcher](./apps/app/src/components/wallet-switcher), and [useTabs](./apps/app/src/hooks/useTabs.tsx)
- [fiveoutofnine/design](https://fiveoutofnine.com/design) for additional UI touches, implementation, and feedback in [badge](./packages/ui/src/components/badge.tsx), [badge-icon](./packages/ui/src/components//badge-icon.tsx), [button](./packages/ui/src/components/button.tsx), [button-icon](./packages/ui/src/components/button-icon.tsx), [handleScroll](https://github.com/LightDotSo/LightDotSo/blob/feat/ini-acknowldegements/apps/app/src/components/web3/wallet-switcher.tsx#L170)
- [hqasmei](https://github.com/hqasmei/youtube-tutorials) for the base nav component at [./apps/app/src/components/nav/main-nav.tsx](./apps/app/src/components/nav/main-nav.tsx) and [./apps/app/src/components/nav/tabs-nav.tsx](./apps/app/src/components/nav/tabs-nav.tsx)
- [useRaisedShadow](https://codesandbox.io/p/sandbox/framer-motion-5-drag-to-reorder-lists-with-drag-handle-j9enw?file=%2Fsrc%2Fuse-raised-shadow.ts%3A23%2C1-24%2C1) for [./apps/app/app/(wallet)/[address]/overview/(hooks)/useRaisedShadow.ts](./apps/app/app/(wallet)/[address]/overview/(hooks)/useRaisedShadow.ts)
- [OTP-Input](https://github.com/ShlokDesai33/React18-OTP-Input) for [OTP](./packages/ui/src/components/otp.tsx)
- [Flowbite's Timeline](https://github.com/themesberg/flowbite-react) for [Timeline](./packages/ui/src/components/timeline.tsx)

## Utils

- [neverthrow utils](/packages/client/src/fetch.ts) from [babylon-alphanet](https://github.com/radixdlt/babylon-alphanet)

## Extra

- [Merkle Hasher](https://github.com/arslanpixpel/dex-bridge) for [./crates/axum](./crates/axum)
- [Frames Tutorial](https://github.com/Zizzamia/a-frame-in-100-line) for [./apps/app/frames](./apps/app/frames)
- [Storybook Gotchas](https://raw.githubusercontent.com/bendigiorgio/kiso) for [./apps/app/storybook](./apps/app/storybook)
