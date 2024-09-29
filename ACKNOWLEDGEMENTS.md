# Acknowledgements

## 0xSequence

First and firstmost this project wouldn't have been possible without 0xSequence's [wallet-contracts](https://github.com/0xsequence/wallet-contracts) and the invention of the [Light State Sync](https://sequence.xyz/blog/sequence-wallet-light-state-sync-full-merkle-wallets) technology. Our multi-sig 4337 wallet contract implementation is entirely based on it.

Thank you for your hard work and dedication to the Ethereum community!

Our rewrite implementation of [go-sequence](https://github.com/0xsequence/go-sequence) in rust is [here](./crates/sequence/).

## 4337 Team, Rundler & Silius

We would like to thank the [4337 team](https://github.com/eth-infinitism/account-abstraction) for leading the efforts to standardize the account abstraction standard.

Also, thank you to [Rundler](https://github.com/alchemyplatform/rundler) and [Silius](https://github.com/silius-rs/silius) for their hard work and dedication to providing their best-in-class implementation of the 4337 bundler standard.

Some of the code is referenced and annotated from their respective repositories.

## @shadcn/ui

Thank you to [shadcn/ui](https://ui.shadcn.com/) for providing the beautiful UI components that were used for the base implementation of the frontend.

All of our up-to-date UI components are available in the [storybook](https://storybook.light.so) located [here](./packages/ui/).

## Amphor Protocol

Thank you to [Amphor Protocol](https://github.com/amphor-protocol) for providing the ERC4626 and ERC7540 compatible asynchronous token vault implementation which is used to handle our protocol token vaults.

## Coinbase

Thank you to [Coinbase](https://github.com/coinbase/magic-spend) for providing the magic-spend library which is used to handle the flexible payment paymaster functionality for 4337 compatible wallets.

## OpenZeppelin

Thank you to [OpenZeppelin](https://github.com/OpenZeppelin/openzeppelin-contracts) for providing the open-source implementation of Timelock contracts which is used to handle the timelock functionality for our protocol.

### References

All of the references used in this project are located [here](./REFERENCES.md).
