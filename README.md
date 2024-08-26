# LightDotSo

[![Apache-2.0 License][apache-badge]][apache-url]
[![MIT License][mit-badge]][mit-url]
[![Telegram Chat][tg-badge]][tg-url]

[mit-badge]: https://img.shields.io/badge/license-MIT-blue.svg
[apache-badge]: https://img.shields.io/badge/license-Apache--2.0-blue.svg
[apache-url]: LICENSE.md
[mit-url]: LICENSE-MIT.md
[tg-badge]: https://img.shields.io/endpoint?color=neon&logo=telegram&label=chat&style=flat-square&url=https%3A%2F%2Ftg.sumanjay.workers.dev%2FLightDotSo
[tg-url]: https://t.me/LightDotSo

## EVM chain abstraction protocol unifying all chains as one.

![](https://assets.light.so/social/github.png)

- Same address, one wallet, all chains.
- Use any supported EVM chain under the same wallet configuration without ever worrying about having to bridge or refuel gas.
- Our aim is to reduce fragmentation and abstract away the complexity of interacting with multiple EVM chains for the end user so that it is easy and intuitive as possible.

## Acknowledgements

We would like to acknowledge the projects below whose work has been instrumental in making this product a reality, as none of this would be possible without the work done by these projects.

- [0xsequence](https://github.com/0xsequence/wallet-contracts): The core signature smart contracts, signature implementation as described in [Light State Sync](https://sequence.xyz/blog/sequence-wallet-light-state-sync-full-merkle-wallets) are all based on the work done by 0xsequence.
- [4337](https://github.com/eth-infinitism/account-abstraction): The account abstraction standard set by 4337 has been instrumental in making this project a reality, and all infrastructure providers whose work has been possible for smart contract wallets to thrive.
- [@shadcn/ui](https://github.com/shadcn/ui): The web UI is all based on the work done by @shadcn, and we are grateful for the work that he has done to provide a beautiful and functional UI foundation for us to build upon.

See more in [ACKNOWLEDGEMENTS.md](ACKNOWLEDGEMENTS.md) and [REFERENCES.md](REFERENCES.md) for more details.

## License

We use the [account-abstraction](https://github.com/eth-infinitism/account-abstraction) contracts and [rundler](https://github.com/alchemyplatform/rundler) as a library. These contracts are licensed under [GPLv3](https://github.com/eth-infinitism/account-abstraction/blob/develop/LICENSE) and [LGPL v3](https://github.com/alchemyplatform/rundler/blob/main/COPYING.lesser) respectively.

All other code in this repository is licensed under [Apache 2.0](./LICENSE.md) or [MIT](./LICENSE.md), at your preference.
