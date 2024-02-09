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

"use client";

import { SIMPLEHASH_CHAIN_ID_MAPPING } from "@lightdotso/const";
import type { WalletSettingsData } from "@lightdotso/data";
import { NftImage, PlaceholderOrb, TokenImage } from "@lightdotso/elements";
import {
  useTransfersQueryState,
  useUserOperationsQueryState,
  userOperationsParser,
} from "@lightdotso/nuqs";
import { useQueryNfts, useQueryTokens } from "@lightdotso/query";
import { queryKeys } from "@lightdotso/query-keys";
import { sendFormConfigurationSchema } from "@lightdotso/schemas";
import type {
  SimplehashMainnetChain,
  SimplehashTestnetChain,
  Transfer,
} from "@lightdotso/schemas";
import { useFormRef, useModals } from "@lightdotso/stores";
import { FooterButton, useIsInsideModal } from "@lightdotso/templates";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Avatar,
  Button,
  ButtonIcon,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TooltipProvider,
} from "@lightdotso/ui";
import { cn, debounce, refineNumberFormat } from "@lightdotso/utils";
import { lightWalletAbi, publicClient } from "@lightdotso/wagmi";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { isEmpty } from "lodash";
import { ChevronDown, Trash2Icon, UserPlus2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import type { FC } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import {
  isAddress,
  encodeFunctionData,
  encodeAbiParameters,
  concat,
  toFunctionSelector,
  toHex,
  fromHex,
} from "viem";
import type { Address, Hex } from "viem";
import { normalize } from "viem/ens";
import * as z from "zod";

// -----------------------------------------------------------------------------
// Dynamic
// -----------------------------------------------------------------------------

const TokenModal = dynamic(
  () => import("@lightdotso/modals/src/token/token-modal"),
  {
    ssr: false,
  },
);

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type NewFormValues = z.infer<typeof sendFormConfigurationSchema>;

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type SendDialogProps = {
  address: Address;
  initialTransfers?: Array<Transfer>;
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const SendDialog: FC<SendDialogProps> = ({
  address,
  initialTransfers,
}) => {
  // ---------------------------------------------------------------------------
  // State Hooks
  // ---------------------------------------------------------------------------

  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);

  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { setIsFormDisabled } = useFormRef();
  const { showSendModal, hideSendModal } = useModals();

  // ---------------------------------------------------------------------------
  // Ref Hooks
  // ---------------------------------------------------------------------------

  const formRef = useRef<HTMLFormElement>(null);

  // ---------------------------------------------------------------------------
  // Template Hooks
  // ---------------------------------------------------------------------------

  const isInsideModal = useIsInsideModal();

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  // useEffect(() => {
  //   setFormRef(formRef);
  // }, [setFormRef]);

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = useQueryClient();

  const walletSettings: WalletSettingsData | undefined =
    queryClient.getQueryData(queryKeys.wallet.settings({ address }).queryKey);

  const { nftPage } = useQueryNfts({
    address,
    is_testnet: walletSettings?.is_enabled_testnet ?? false,
    limit: Number.MAX_SAFE_INTEGER,
    cursor: null,
  });

  const { tokens } = useQueryTokens({
    address,
    is_testnet: walletSettings?.is_enabled_testnet ?? false,
    offset: 0,
    limit: Number.MAX_SAFE_INTEGER,
    group: false,
    chain_ids: null,
  });

  // ---------------------------------------------------------------------------
  // Query State
  // ---------------------------------------------------------------------------

  const [transfers, setTransfers] = useTransfersQueryState(
    initialTransfers ?? [],
  );
  const [, setUserOperations] = useUserOperationsQueryState();

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  // create default transfer object
  const defaultTransfer: Array<Transfer> = useMemo(() => {
    // For each token, create a transfer object
    const transfers: Array<Transfer> =
      tokens && tokens?.length > 0
        ? [
            {
              address: undefined,
              addressOrEns: undefined,
              asset: {
                address: tokens[0].address,
                decimals: tokens[0].decimals,
                quantity: 0,
              },
              assetType: "erc20",
            },
          ]
        : [];

    return transfers;
    // Only set on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The default values for the form
  const defaultValues: Partial<NewFormValues> = useMemo(() => {
    // Check if the type is valid
    return {
      transfers:
        transfers && transfers !== undefined && transfers.length > 0
          ? transfers
          : defaultTransfer,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultTransfer]);

  // ---------------------------------------------------------------------------
  // Form
  // ---------------------------------------------------------------------------

  const form = useForm<NewFormValues>({
    mode: "all",
    reValidateMode: "onBlur",
    resolver: zodResolver(
      sendFormConfigurationSchema.superRefine((value, ctx) => {
        // Check if no two transfers have the same address and asset address + chainId
        const duplicateTransfers = value.transfers.filter(
          (transfer, index, self) =>
            index !==
            self.findIndex(
              t =>
                t.address === transfer.address &&
                t?.asset?.address === transfer?.asset?.address &&
                t?.chainId === transfer?.chainId,
            ),
        );
        if (duplicateTransfers.length > 0) {
          // Note: This is a hacky way to get the last duplicate index
          const transfersAsStrings = value.transfers.map(transfer =>
            JSON.stringify(transfer),
          );
          const duplicateTransferString = JSON.stringify(duplicateTransfers[0]);
          const lastDuplicateIndex = transfersAsStrings.lastIndexOf(
            duplicateTransferString,
          );

          // Show an error on the message
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Duplicate transfer",
            path: ["transfers", lastDuplicateIndex, "addressOrEns"],
          });
        }

        // Create a map to calculate the total quantity by token address
        const totalByTokenAddress = new Map();

        value.transfers.forEach((transfer, index) => {
          // Check if asset and the quantity is not empty
          if (transfer && transfer.asset && "quantity" in transfer.asset) {
            if (!transfer.asset.quantity) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Quantity is required",
                path: ["transfers", index, "asset", "quantity"],
              });
            } else if (transfer.asset.quantity > 0) {
              if (transfer.assetType === "erc20") {
                // If the quantity is valid, get the token balance
                const token =
                  tokens &&
                  transfers &&
                  transfers?.length > 0 &&
                  transfers[index]?.asset?.address &&
                  tokens?.find(
                    token =>
                      token.address ===
                        (transfers?.[index]?.asset?.address || "") &&
                      token.chain_id === transfers?.[index]?.chainId,
                  );

                // If the token is not found or undefined, set an error
                if (!token) {
                  // Show an error on the message
                  ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Please select a valid token",
                    path: ["transfers", index, "asset", "address"],
                  });
                } else {
                  // Add quantity to total by token address
                  const tokenIndex = `${token.chain_id}:${token.address}`;
                  const totalQuantity =
                    totalByTokenAddress.get(tokenIndex) || 0;
                  totalByTokenAddress.set(
                    tokenIndex,
                    totalQuantity + transfer.asset.quantity,
                  );

                  // Check if the sum quantity is greater than the token balance
                  if (
                    totalByTokenAddress.get(tokenIndex) *
                      Math.pow(10, token?.decimals) >
                    token?.amount
                  ) {
                    // Show an error on the message
                    ctx.addIssue({
                      code: z.ZodIssueCode.custom,
                      message: "Insufficient balance",
                      path: ["transfers", index, "asset", "quantity"],
                    });

                    // Show the balance in all fields w/ same token address and chainId
                    value.transfers.forEach((transfer, _index) => {
                      if (
                        transfer?.asset?.address === token?.address &&
                        transfer?.chainId === token?.chain_id
                      ) {
                        ctx.addIssue({
                          code: z.ZodIssueCode.custom,
                          message: "Insufficient balance",
                          path: ["transfers", _index, "asset", "quantity"],
                        });
                      }
                    });
                  }
                }
              }
            }
          }
        });

        // Also expect that all transfers w/ key address are valid addresses and are not empty
        value.transfers.forEach((transfer, index) => {
          // Check if the address is not empty
          if (!transfer.address) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Address is required",
              path: ["transfers", index, "address"],
            });
          }

          if (transfer.address && !isAddress(transfer.address)) {
            ctx.addIssue({
              code: z.ZodIssueCode.invalid_type,
              message: "Invalid address",
              path: ["transfers", index, "address"],
              expected: "string",
              received: "string",
            });
          }
        });
      }),
    ),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    name: "transfers",
    control: form.control,
  });

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const subscription = form.watch((value, { name: _name }) => {
      if (Array.isArray(value.transfers)) {
        if (value.transfers === undefined) {
          setTransfers(null);
        } else {
          // @ts-expect-error
          setTransfers(value.transfers);
        }
      }

      return;
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.watch]);

  // Set the form values from the URL on mount
  useEffect(() => {
    // Recursively iterate the transfers and validate the addresses on mount
    transfers &&
      transfers.forEach((transfer, index) => {
        if (transfer.address) {
          validateAddress(transfer.address, index);
        }
      });

    if (defaultValues.transfers) {
      setTransfers(defaultValues.transfers);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValues]);

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const isFormValid = useMemo(() => {
    return form.formState.isValid && isEmpty(form.formState.errors);
  }, [form.formState]);

  const userOperationsParams = useMemo(() => {
    const encodeTransfer = (transfer: Transfer): [Address, bigint, Hex] => {
      if (
        transfer &&
        transfer.address &&
        transfer.asset &&
        transfer.assetType === "erc20" &&
        "quantity" in transfer.asset
      ) {
        // Get the matching token
        const token =
          tokens &&
          tokens?.length > 0 &&
          transfer &&
          transfer.asset &&
          "address" in transfer.asset &&
          tokens?.find(
            token =>
              // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
              token.address === transfer.asset?.address! &&
              token.chain_id === transfer.chainId,
          );

        if (!token) {
          throw new Error("No matching token found");
        }

        // Encode the native eth `transfer`
        if (
          transfer.asset.address ===
          "0x0000000000000000000000000000000000000000"
        ) {
          return [
            transfer.address as Address,
            BigInt(transfer.asset.quantity! * Math.pow(10, token.decimals!)),
            "0x" as Hex,
          ];
        }

        // Encode the erc20 `transfer`
        return [
          transfer.asset.address as Address,
          0n,
          toHex(
            concat([
              fromHex(toFunctionSelector("transfer(address,uint256)"), "bytes"),
              fromHex(
                encodeAbiParameters(
                  [
                    {
                      name: "recipient",
                      type: "address",
                    },
                    {
                      name: "amount",
                      type: "uint256",
                    },
                  ],
                  [
                    transfer.address as Address,
                    BigInt(
                      // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
                      transfer.asset?.quantity! * Math.pow(10, token.decimals!),
                    ),
                  ],
                ),
                "bytes",
              ),
            ]),
          ),
        ];
      }

      if (
        transfer &&
        transfer.address &&
        transfer.asset &&
        (transfer.assetType === "erc721" ||
          transfer.assetType === "erc1155" ||
          transfer.assetType === "erc1155Batch") &&
        (("quantity" in transfer.asset && "tokenId" in transfer.asset) ||
          ("quantities" in transfer.asset && "tokenIds" in transfer.asset))
      ) {
        // Get the matching nft
        const nft =
          nftPage &&
          nftPage.nfts?.length > 0 &&
          transfer &&
          transfer.asset &&
          "address" in transfer.asset &&
          nftPage.nfts?.find(
            nft =>
              // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
              nft.contract_address === transfer.asset?.address! &&
              SIMPLEHASH_CHAIN_ID_MAPPING[
                nft.chain! as SimplehashMainnetChain | SimplehashTestnetChain
              ] === transfer.chainId,
          );

        if (!nft) {
          throw new Error("No matching token found");
        }

        // Encode the erc1155 `safeTransferFrom`
        if (
          transfer.assetType === "erc1155" &&
          "quantity" in transfer.asset &&
          "tokenId" in transfer.asset
        ) {
          return [
            transfer.asset.address as Address,
            0n,
            toHex(
              concat([
                fromHex(
                  toFunctionSelector(
                    "safeTransferFrom(address,address,uint256,uint256,bytes)",
                  ),
                  "bytes",
                ),
                fromHex(
                  encodeAbiParameters(
                    [
                      {
                        name: "from",
                        type: "address",
                      },
                      {
                        name: "to",
                        type: "address",
                      },
                      {
                        name: "tokenId",
                        type: "uint256",
                      },
                      {
                        name: "value",
                        type: "uint256",
                      },
                      {
                        name: "data",
                        type: "bytes",
                      },
                    ],
                    [
                      address,
                      transfer.address as Address,
                      // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
                      BigInt(transfer.asset?.tokenId!),
                      // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
                      BigInt(transfer.asset.quantity!),
                      "0x",
                    ],
                  ),
                  "bytes",
                ),
              ]),
            ),
          ];
        }

        // Encode the erc1155 `safeBatchTransferFrom`
        if (
          transfer.assetType === "erc1155Batch" &&
          "quantities" in transfer.asset &&
          "tokenIds" in transfer.asset
        ) {
          return [
            transfer.asset.address as Address,
            0n,
            toHex(
              concat([
                fromHex(
                  toFunctionSelector(
                    "safeBatchTransferFrom(address,address,uint256[],uint256[],bytes)",
                  ),
                  "bytes",
                ),
                fromHex(
                  encodeAbiParameters(
                    [
                      {
                        name: "from",
                        type: "address",
                      },
                      {
                        name: "to",
                        type: "address",
                      },
                      {
                        name: "ids",
                        type: "uint256[]",
                      },
                      {
                        name: "values",
                        type: "uint256[]",
                      },
                      {
                        name: "data",
                        type: "bytes",
                      },
                    ],
                    [
                      address,
                      transfer.address as Address,
                      transfer.asset.tokenIds!.map(BigInt),
                      transfer.asset.quantities!.map(BigInt),
                      "0x",
                    ],
                  ),
                  "bytes",
                ),
              ]),
            ),
          ];
        }

        if (transfer.assetType === "erc721" && "tokenId" in transfer.asset) {
          // Encode the erc721 `transfer`
          return [
            transfer.asset.address as Address,
            0n,
            toHex(
              concat([
                fromHex(
                  toFunctionSelector("transferFrom(address,address,uint256)"),
                  "bytes",
                ),
                fromHex(
                  encodeAbiParameters(
                    [
                      {
                        name: "from",
                        type: "address",
                      },
                      {
                        name: "to",
                        type: "address",
                      },
                      {
                        name: "tokenId",
                        type: "uint256",
                      },
                    ],
                    [
                      address,
                      transfer.address as Address,
                      // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
                      BigInt(transfer.asset?.tokenId!),
                    ],
                  ),
                  "bytes",
                ),
              ]),
            ),
          ];
        }
      }

      throw new Error("Invalid transfer");
    };

    // Get the call data of the first transfer
    if (!transfers || transfers?.length === 0 || !form.formState.isValid) {
      return [];
    }

    if (
      transfers?.length === 1 &&
      transfers[0].address &&
      isAddress(transfers[0].address) &&
      transfers[0].asset
    ) {
      return [
        {
          chainId:
            transfers[0].chainId !== undefined
              ? BigInt(transfers[0].chainId)
              : undefined,
          callData: encodeFunctionData({
            abi: lightWalletAbi,
            functionName: "execute",
            args: encodeTransfer(transfers[0]) as [Address, bigint, Hex],
          }),
        },
      ];
    }

    if (transfers?.length > 1) {
      // Create a map w/ transfer grouped by chainId
      const transfersByChainId: Map<number, Transfer[]> = new Map();
      transfers.forEach(transfer => {
        if (!transfer.chainId) {
          return;
        }
        const transfers = transfersByChainId.get(transfer.chainId) || [];
        transfersByChainId.set(transfer.chainId, [...transfers, transfer]);
      });

      // Create the user operations params for each chainId
      const userOperationsParams = [];
      // If the transfer count is one, encode as `execute`
      for (const [chainId, transfers] of transfersByChainId.entries()) {
        if (transfers.length === 1) {
          userOperationsParams.push({
            chainId: BigInt(chainId),
            callData: encodeFunctionData({
              abi: lightWalletAbi,
              functionName: "execute",
              args: encodeTransfer(transfers[0]) as [Address, bigint, Hex],
            }),
          });
        } else {
          let transformedTransfers = transfers;

          // If there is a duplicate `erc1155` transfer, we need to encode as `erc1155Batch` instead of separate `erc1155` transfers
          // Filter for same asset address + chainId w/ assetType `erc1155`
          const erc1155Transfers = transfers.filter(
            transfer =>
              transfer.assetType === "erc1155" &&
              transfer.asset &&
              transfer.asset.address &&
              "quantity" in transfer.asset &&
              "tokenId" in transfer.asset,
          );
          const erc1155TransfersByAssetAddress: Map<string, Transfer[]> =
            new Map();
          erc1155Transfers.forEach(transfer => {
            const transfers =
              erc1155TransfersByAssetAddress.get(
                // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
                `${transfer.asset?.address!}-${transfer.chainId}-${
                  transfer.address
                }`,
              ) || [];
            erc1155TransfersByAssetAddress.set(
              // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
              `${transfer.asset?.address!}-${transfer.chainId}-${
                transfer.address
              }`,
              [...transfers, transfer],
            );
          });
          // For each duplicate `erc1155` transfer, encode as `erc1155Batch`
          for (const [key, transfers] of erc1155TransfersByAssetAddress) {
            // If the transfer count is more than one, there is a duplicate
            if (transfers.length > 1) {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const [address, chainId, _add] = key.split("-");
              for (const transfer of transfers) {
                // Remove the transfer from the array
                transformedTransfers = transformedTransfers.filter(
                  t => t !== transfer,
                );
              }
              // Add the batch transfer to the array
              transformedTransfers.push({
                address: transfers[0].address,
                addressOrEns: transfers[0].addressOrEns,
                asset: {
                  address,
                  quantities: transfers.map(
                    // @ts-expect-error
                    // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
                    transfer => transfer.asset?.quantity!,
                  ),
                  // @ts-expect-error
                  // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
                  tokenIds: transfers.map(transfer => transfer.asset?.tokenId!),
                },
                assetType: "erc1155Batch",
                chainId: parseInt(chainId),
              });
            }
          }

          // Encode the transfers for each item
          const encodedTransfers = transformedTransfers.map(transfer =>
            encodeTransfer(transfer),
          );
          // If the transfer count is more than one, encode as `executeBatch`
          userOperationsParams.push({
            chainId: BigInt(chainId),
            callData: encodeFunctionData({
              abi: lightWalletAbi,
              functionName: "executeBatch",
              args: [
                encodedTransfers.map(transfer => transfer[0]),
                encodedTransfers.map(transfer => transfer[1]),
                encodedTransfers.map(transfer => transfer[2]),
              ] as [Address[], bigint[], Hex[]],
            }),
          });
        }
      }

      // Return the user operations params
      return userOperationsParams;
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transfers, tokens, isFormValid]);

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  useEffect(() => {
    setIsFormDisabled(!isFormValid);
  }, [isFormValid, setIsFormDisabled]);

  useEffect(() => {
    if (isFormValid && userOperationsParams) {
      setUserOperations(userOperationsParams);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFormValid, userOperationsParams]);

  // ---------------------------------------------------------------------------
  // Validation
  // ---------------------------------------------------------------------------

  async function validateAddress(address: string, index: number) {
    // If the address is empty, return
    if (!address || address.length <= 3) return;

    // Try to parse the address
    if (isAddress(address)) {
      // If the address is valid, set the value of key address
      form.setValue(`transfers.${index}.address`, address);
      form.clearErrors(`transfers.${index}.addressOrEns`);
    } else if (
      address &&
      address.length > 3 &&
      address.includes(".") &&
      /[a-zA-Z]/.test(address)
    ) {
      // If the address is not valid, try to resolve it as an ENS name
      try {
        publicClient
          .getEnsAddress({
            name: normalize(address),
          })
          .then(ensNameAddress => {
            if (ensNameAddress) {
              // If the ENS name resolves, set the value of key address
              form.setValue(`transfers.${index}.address`, ensNameAddress);
            } else {
              // Show an error on the message
              form.setError(`transfers.${index}.addressOrEns`, {
                type: "manual",
                message:
                  "The ENS name did not resolve. Please enter a valid address or ENS name",
              });
              // Clear the value of key address
              form.setValue(`transfers.${index}.address`, "");
            }

            // Trigger the form validation
            form.trigger();
          })
          .catch(() => {
            // Show an error on the message
            form.setError(`transfers.${index}.addressOrEns`, {
              type: "manual",
              message: "Please enter a valid address or ENS name",
            });
            // Clear the value of key address
            form.setValue(`transfers.${index}.address`, "");

            // Trigger the form validation
            form.trigger();
          });
      } catch {
        // Show an error on the message
        form.setError(`transfers.${index}.addressOrEns`, {
          type: "manual",
          message: "Please enter a valid address or ENS name",
        });
        // Clear the value of key address
        form.setValue(`transfers.${index}.address`, "");
      } finally {
        // Trigger the form validation
        form.trigger();
      }
    } else {
      // Clear the value of key address
      form.setValue(`transfers.${index}.address`, "");

      // Trigger the form validation
      form.trigger();
    }
  }

  async function validateTokenQuantity(quantity: number, index: number) {
    // If the quantity is empty, return
    if (!quantity) return;

    // Check if the quantity is a number and more than the token balance
    if (quantity && quantity > 0) {
      // If the quantity is valid, get the token balance
      const token =
        tokens &&
        transfers &&
        transfers?.length > 0 &&
        transfers[index]?.asset?.address &&
        tokens?.find(
          token => token.address === (transfers?.[index]?.asset?.address || ""),
        );

      // If the token is not found or undefined, set an error
      if (!token) {
        // Show an error on the message
        form.setError(`transfers.${index}.asset.quantity`, {
          type: "manual",
          message: "Please select a valid token",
        });
        // Clear the value of key address
        form.setValue(`transfers.${index}.asset.quantity`, 0);
      } else if (quantity * Math.pow(10, token?.decimals) > token?.amount) {
        // Show an error on the message
        form.setError(`transfers.${index}.asset.quantity`, {
          type: "manual",
          message: "Insufficient balance",
        });
        // Clear the value of key address
        // form.setValue(`transfers.${index}.asset.quantity`, 0);
      } else {
        // If the quantity is valid, set the value of key quantity
        form.setValue(`transfers.${index}.asset.quantity`, quantity);
        form.clearErrors(`transfers.${index}.asset.quantity`);
      }
    }
  }

  async function validateNftQuantity(quantity: number, index: number) {
    // If the quantity is empty, return
    if (!quantity) return;

    // Check if the quantity is a number and more than the token balance
    if (quantity && quantity > 0) {
      // If the quantity is valid, get the token balance
      const nft =
        tokens &&
        transfers &&
        transfers?.length > 0 &&
        transfers[index]?.asset?.address &&
        nftPage &&
        nftPage?.nfts?.find(
          nft =>
            nft.contract_address === (transfers?.[index]?.asset?.address || ""),
        );

      // If the nft is not found or undefined, set an error
      if (!nft) {
        // Show an error on the message
        form.setError(`transfers.${index}.asset.quantity`, {
          type: "manual",
          message: "Please select a valid NFT",
        });
        // Clear the value of key address
        form.setValue(`transfers.${index}.asset.quantity`, 0);
        // If the token is an erc721 token meaning the quantity must be 1
      } else if (
        nft.contract.type?.toLowerCase() === "erc721" &&
        quantity !== 1
      ) {
        // Show an error on the message
        form.setError(`transfers.${index}.asset.quantity`, {
          type: "manual",
          message: "NFT quantity must be 1",
        });
        // If the token is an erc1155 token meaning the quantity must be less than or equal to the token count
      } else if (
        nft.contract.type?.toLowerCase() === "erc1155" &&
        // Get the owner quantity from the owners array
        (nft.owners?.find(owner => owner.owner_address === address)?.quantity ??
          1) < quantity
      ) {
        // Show an error on the message
        form.setError(`transfers.${index}.asset.quantity`, {
          type: "manual",
          message: "Insufficient ERC1155 balance",
        });
      } else {
        // If the quantity is valid, set the value of key quantity
        form.setValue(`transfers.${index}.asset.quantity`, quantity);
        form.clearErrors(`transfers.${index}.asset.quantity`);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Debounced
  // ---------------------------------------------------------------------------

  const debouncedValidateAddress = debounce(validateAddress, 300);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="grid gap-10">
      <TooltipProvider delayDuration={300}>
        <Form {...form}>
          <form ref={formRef} className="space-y-4">
            <div className="space-y-4">
              {fields.map((field, index) => (
                <Accordion
                  key={index}
                  collapsible
                  defaultValue="value-0"
                  className="rounded-md border border-border bg-background-weak p-4"
                  type="single"
                >
                  <AccordionItem className="border-0" value={`value-${index}`}>
                    <AccordionTrigger className="px-1 py-0 text-xl font-medium md:text-2xl">
                      Transfer #{index}
                    </AccordionTrigger>
                    <AccordionContent className="px-1 pt-4">
                      <FormItem
                        key={field.id}
                        className="grid grid-cols-8 gap-4 space-y-0"
                      >
                        <FormField
                          control={form.control}
                          name={`transfers.${index}.addressOrEns`}
                          render={({ field }) => (
                            <div className="col-span-8 space-y-2">
                              <Label htmlFor="address">
                                Recepient Address or ENS
                              </Label>
                              <div className="flex items-center space-x-3">
                                <div className="relative inline-block w-full">
                                  <Input
                                    className="pl-12"
                                    {...field}
                                    placeholder="Recepient's Address or ENS name"
                                    onBlur={e => {
                                      // Validate the address
                                      if (!e.target.value) {
                                        // Clear the value of key address
                                        form.setValue(
                                          `transfers.${index}.address`,
                                          "",
                                        );
                                      }
                                      const address = e.target.value;

                                      validateAddress(address, index);
                                    }}
                                    onChange={e => {
                                      // Update the field value
                                      field.onChange(e.target.value || "");

                                      // Validate the address
                                      const address = e.target.value;

                                      if (address) {
                                        debouncedValidateAddress(
                                          address,
                                          index,
                                        );
                                      }
                                    }}
                                  />
                                  <div className="absolute inset-y-0 left-3 flex items-center">
                                    <Avatar className="size-6">
                                      {/* If the address is valid, try resolving an ens Avatar */}
                                      <PlaceholderOrb
                                        address={
                                          // If the address is a valid address
                                          field?.value && isAddress(field.value)
                                            ? field?.value
                                            : "0x4fd9D0eE6D6564E80A9Ee00c0163fC952d0A45Ed"
                                        }
                                        className={cn(
                                          // If the field is not valid, add opacity
                                          form.formState.errors.transfers &&
                                            form.formState.errors.transfers[
                                              index
                                            ] &&
                                            form.formState.errors.transfers[
                                              index
                                            ]?.addressOrEns
                                            ? "opacity-50"
                                            : "opacity-100",
                                        )}
                                      />
                                    </Avatar>
                                  </div>
                                </div>
                                <div
                                  className={cn(
                                    "flex h-full flex-col",
                                    // If there is error, justify center, else end
                                    form.formState.errors.transfers &&
                                      form.formState.errors.transfers[index] &&
                                      form.formState.errors.transfers[index]
                                        ?.addressOrEns
                                      ? "justify-center"
                                      : "justify-end",
                                  )}
                                >
                                  <ButtonIcon
                                    disabled={fields.length < 2}
                                    variant="outline"
                                    className="mt-1.5 rounded-full"
                                    onClick={() => {
                                      remove(index);
                                      form.trigger();
                                    }}
                                  >
                                    <Trash2Icon className="size-5" />
                                  </ButtonIcon>
                                </div>
                              </div>
                              <FormMessage />
                            </div>
                          )}
                        />
                        <Tabs
                          className="col-span-8"
                          defaultValue={
                            transfers[index]?.assetType === "erc20"
                              ? "token"
                              : "nft"
                          }
                        >
                          <TabsList>
                            <TabsTrigger value="token">Token</TabsTrigger>
                            <TabsTrigger value="nft">NFT</TabsTrigger>
                          </TabsList>
                          <TabsContent value="token">
                            <div className="grid grid-cols-4 gap-x-3 gap-y-2 md:grid-cols-8">
                              <div className="relative col-span-4 inline-block w-full">
                                <FormField
                                  control={form.control}
                                  name={`transfers.${index}.asset.quantity`}
                                  render={({ field }) => (
                                    <div className="space-y-2">
                                      <Label htmlFor="address">Quantity</Label>
                                      <div className="flex items-center space-x-3">
                                        <div className="relative inline-block w-full">
                                          <Input
                                            id="quantity"
                                            className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                            type="text"
                                            {...field}
                                            placeholder="Quantity of tokens to transfer"
                                            onBlur={e => {
                                              // Validate the address
                                              if (!e.target.value) {
                                                // Clear the value of key address
                                                form.setValue(
                                                  `transfers.${index}.asset.quantity`,
                                                  0,
                                                );
                                              }

                                              const quantity = parseFloat(
                                                e.target.value,
                                              );

                                              validateTokenQuantity(
                                                quantity,
                                                index,
                                              );
                                            }}
                                            onChange={e => {
                                              // If the input ends with ".", or includes "." and ends with "0", set the value as string, as it can be assumed that the user is still typing
                                              if (
                                                e.target.value.endsWith(".") ||
                                                (e.target.value.includes(".") &&
                                                  e.target.value.endsWith("0"))
                                              ) {
                                                field.onChange(e.target.value);
                                              } else {
                                                // Only parse to float if the value doesn't end with "."
                                                field.onChange(
                                                  parseFloat(e.target.value) ||
                                                    0,
                                                );
                                              }

                                              // Validate the number
                                              const quantity = parseFloat(
                                                e.target.value,
                                              );

                                              if (!isNaN(quantity)) {
                                                validateTokenQuantity(
                                                  quantity,
                                                  index,
                                                );
                                              }
                                            }}
                                          />
                                          <div className="absolute inset-y-0 right-3 flex items-center">
                                            <Button
                                              size="unsized"
                                              variant="outline"
                                              type="button"
                                              className="px-1 py-0.5 text-xs"
                                              onClick={() => {
                                                // Set the value of key quantity to the token balance
                                                const token =
                                                  tokens &&
                                                  transfers &&
                                                  transfers?.length > 0 &&
                                                  transfers[index]?.asset
                                                    ?.address &&
                                                  tokens?.find(
                                                    token =>
                                                      token.address ===
                                                        (transfers?.[index]
                                                          ?.asset?.address ||
                                                          "") &&
                                                      token.chain_id ===
                                                        transfers?.[index]
                                                          ?.chainId,
                                                  );
                                                if (token) {
                                                  form.setValue(
                                                    `transfers.${index}.asset.quantity`,
                                                    token?.amount /
                                                      Math.pow(
                                                        10,
                                                        token?.decimals,
                                                      ),
                                                  );
                                                }

                                                // Validate the form
                                                form.trigger();
                                              }}
                                            >
                                              Max
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex items-center justify-between text-xs text-text-weak">
                                        <div>
                                          {/* Get the current balance in USD */}
                                          {tokens &&
                                            tokens?.length > 0 &&
                                            (() => {
                                              const token = tokens.find(
                                                token =>
                                                  token.address ===
                                                    (transfers?.[index]?.asset
                                                      ?.address || "") &&
                                                  token.chain_id ===
                                                    transfers?.[index]?.chainId,
                                              );
                                              return token
                                                ? "~ $" +
                                                    // Get the current selected token balance in USD
                                                    refineNumberFormat(
                                                      (token?.balance_usd /
                                                        (token.amount /
                                                          Math.pow(
                                                            10,
                                                            token?.decimals,
                                                          ))) *
                                                        // Get the form value
                                                        (field.value ?? 0),
                                                    )
                                                : "";
                                            })()}
                                        </div>
                                        <div>
                                          {tokens &&
                                            tokens?.length > 0 &&
                                            (() => {
                                              const token = tokens.find(
                                                token =>
                                                  token.address ===
                                                    (transfers?.[index]?.asset
                                                      ?.address || "") &&
                                                  token.chain_id ===
                                                    transfers?.[index]?.chainId,
                                              );
                                              return token
                                                ? (
                                                    token?.amount /
                                                    Math.pow(
                                                      10,
                                                      token?.decimals,
                                                    )
                                                  ).toString() +
                                                    ` ${token.symbol} available`
                                                : "";
                                            })()}
                                        </div>
                                      </div>
                                      <FormMessage />
                                    </div>
                                  )}
                                />
                              </div>
                              <div className="relative col-span-4 inline-block w-full">
                                <FormField
                                  key={field.id}
                                  control={form.control}
                                  name={`transfers.${index}.asset.address`}
                                  render={({ field: _field }) => {
                                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                    const [tokenAddress, _chainId] =
                                      _field.value?.split("-") || [];

                                    const token =
                                      (tokens &&
                                        tokens?.length > 0 &&
                                        tokens?.find(
                                          token =>
                                            token.address === tokenAddress,
                                        )) ||
                                      undefined;

                                    return (
                                      <FormControl>
                                        <div className="w-full space-y-2">
                                          <Label htmlFor="weight">Token</Label>
                                          <Button
                                            size="lg"
                                            type="button"
                                            onClick={() => {
                                              setIsTokenModalOpen(true);
                                              hideSendModal();
                                            }}
                                            variant="outline"
                                            className="flex w-full items-center justify-between px-4 text-sm"
                                          >
                                            {token && (
                                              <TokenImage
                                                size="xs"
                                                className="mr-2"
                                                token={token}
                                              />
                                            )}
                                            {token?.symbol}
                                            <div className="grow" />
                                            <ChevronDown className="size-4 opacity-50" />
                                          </Button>
                                          <TokenModal
                                            isTokenModalVisible={
                                              isTokenModalOpen
                                            }
                                            address={address}
                                            type="native"
                                            onClose={() => {
                                              setIsTokenModalOpen(false);
                                              if (isInsideModal) {
                                                showSendModal();
                                              }
                                            }}
                                            onTokenSelect={token => {
                                              form.setValue(
                                                `transfers.${index}.asset.address`,
                                                token.address,
                                              );
                                              form.setValue(
                                                `transfers.${index}.chainId`,
                                                token.chain_id,
                                              );
                                              form.setValue(
                                                `transfers.${index}.assetType`,
                                                "erc20",
                                              );

                                              form.trigger();
                                              setIsTokenModalOpen(false);
                                              if (isInsideModal) {
                                                showSendModal();
                                              }
                                            }}
                                          />
                                          <FormMessage />
                                        </div>
                                      </FormControl>
                                    );
                                  }}
                                />
                              </div>
                            </div>
                          </TabsContent>
                          <TabsContent value="nft">
                            <div className="grid grid-cols-4 gap-x-3 gap-y-2 md:grid-cols-8">
                              <div className="relative col-span-4 inline-block w-full">
                                <FormField
                                  control={form.control}
                                  name={`transfers.${index}.asset.quantity`}
                                  render={({ field }) => (
                                    <div className="space-y-2">
                                      <Label htmlFor="address">Quantity</Label>
                                      <div className="flex items-center space-x-3">
                                        <div className="relative inline-block w-full">
                                          <Input
                                            id="quantity"
                                            className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                            type="text"
                                            {...field}
                                            placeholder="Quantity of tokens to transfer"
                                            onBlur={e => {
                                              // Validate the address
                                              if (!e.target.value) {
                                                // Clear the value of key address
                                                form.setValue(
                                                  `transfers.${index}.asset.quantity`,
                                                  0,
                                                );
                                              }

                                              const quantity = parseFloat(
                                                e.target.value,
                                              );

                                              validateNftQuantity(
                                                quantity,
                                                index,
                                              );
                                            }}
                                            onChange={e => {
                                              // Update the field value
                                              field.onChange(
                                                parseFloat(e.target.value) || 0,
                                              );

                                              // Validate the address
                                              const quantity = parseFloat(
                                                e.target.value,
                                              );

                                              if (quantity) {
                                                validateNftQuantity(
                                                  quantity,
                                                  index,
                                                );
                                              }
                                            }}
                                          />
                                          <div className="absolute inset-y-0 right-3 flex items-center">
                                            <Button
                                              size="unsized"
                                              variant="outline"
                                              type="button"
                                              className="px-1 py-0.5 text-xs"
                                              disabled={
                                                transfers &&
                                                transfers?.length > 0 &&
                                                transfers[index]?.asset &&
                                                transfers[index]?.assetType ===
                                                  "erc721"
                                              }
                                              onClick={() => {
                                                // Set the value of key quantity to the token balance
                                                const nft =
                                                  nftPage &&
                                                  transfers &&
                                                  transfers?.length > 0 &&
                                                  transfers[index].asset &&
                                                  transfers[index]?.asset
                                                    ?.address &&
                                                  "tokenId" in
                                                    // eslint-disable-next-line no-unsafe-optional-chaining, @typescript-eslint/no-non-null-asserted-optional-chain
                                                    transfers[index]?.asset! &&
                                                  nftPage.nfts?.find(
                                                    nft =>
                                                      nft.contract_address ===
                                                        (transfers?.[index]
                                                          ?.asset?.address ||
                                                          "") &&
                                                      parseInt(
                                                        nft.token_id!,
                                                      ) ===
                                                        // prettier-ignore
                                                        // @ts-expect-error
                                                        transfers?.[index]?.asset!.tokenId,
                                                  );

                                                if (nft) {
                                                  // Get the token quantity of the owner
                                                  const nftQuantity =
                                                    nft.contract.type?.toLowerCase() ===
                                                    "erc1155"
                                                      ? // Get the quantity from the owner array
                                                        nft.owners?.find(
                                                          owner =>
                                                            owner.owner_address ===
                                                            address,
                                                        )?.quantity ?? 1
                                                      : 1;

                                                  form.setValue(
                                                    `transfers.${index}.asset.quantity`,
                                                    nftQuantity,
                                                  );
                                                }

                                                // Validate the form
                                                form.trigger();
                                              }}
                                            >
                                              Max
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                      <FormMessage />
                                    </div>
                                  )}
                                />
                              </div>
                              <div className="relative col-span-4 inline-block w-full">
                                <FormField
                                  key={field.id}
                                  control={form.control}
                                  name={`transfers.${index}.asset.address`}
                                  render={({ field: _field }) => (
                                    <FormControl>
                                      <div className="w-full space-y-2">
                                        <Label htmlFor="weight">NFT</Label>
                                        <Select
                                          defaultValue={
                                            transfers &&
                                            transfers?.length > 0 &&
                                            transfers[index]?.asset &&
                                            transfers[index]?.asset?.address &&
                                            "tokenId" in
                                              // eslint-disable-next-line no-unsafe-optional-chaining, @typescript-eslint/no-non-null-asserted-optional-chain
                                              transfers[index]?.asset! &&
                                            transfers[index]?.chainId
                                              ? // @ts-expect-error
                                                `${transfers[index]?.asset?.address}-${transfers[index]?.asset?.tokenId}-${transfers[index]?.chainId}`
                                              : undefined
                                          }
                                          onValueChange={value => {
                                            // Get the token of address and chainId
                                            const [address, tokenId, chainId] =
                                              value?.split("-") || [];

                                            // Set the chainId of the token
                                            const nft =
                                              nftPage &&
                                              nftPage.nfts?.length > 0 &&
                                              nftPage.nfts?.find(
                                                nft =>
                                                  nft.contract_address ===
                                                    address &&
                                                  nft.token_id === tokenId,
                                              );

                                            if (nft) {
                                              form.setValue(
                                                `transfers.${index}.asset.address`,
                                                address,
                                              );
                                              form.setValue(
                                                `transfers.${index}.chainId`,
                                                parseInt(chainId),
                                              );
                                              form.setValue(
                                                `transfers.${index}.asset.tokenId`,
                                                parseInt(tokenId),
                                              );
                                              form.setValue(
                                                `transfers.${index}.assetType`,
                                                nft.contract.type?.toLowerCase() ===
                                                  "erc721"
                                                  ? "erc721"
                                                  : "erc1155",
                                              );
                                            }

                                            form.trigger();
                                          }}
                                        >
                                          <FormControl>
                                            <SelectTrigger className="w-full">
                                              <SelectValue placeholder="Select a NFT" />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                            {nftPage &&
                                              nftPage.nfts?.map(nft => (
                                                <SelectItem
                                                  key={`${
                                                    nft.contract_address
                                                  }-${nft.token_id}-${
                                                    SIMPLEHASH_CHAIN_ID_MAPPING[
                                                      nft.chain! as
                                                        | SimplehashMainnetChain
                                                        | SimplehashTestnetChain
                                                    ]
                                                  }`}
                                                  value={`${
                                                    nft.contract_address
                                                  }-${nft.token_id}-${
                                                    SIMPLEHASH_CHAIN_ID_MAPPING[
                                                      nft.chain! as
                                                        | SimplehashMainnetChain
                                                        | SimplehashTestnetChain
                                                    ]
                                                  }`}
                                                >
                                                  <div className="flex items-center">
                                                    <div className="mr-2 size-6">
                                                      <NftImage
                                                        className="rounded-md"
                                                        nft={nft}
                                                      />
                                                    </div>
                                                    {nft.name ?? nft.token_id}
                                                  </div>
                                                </SelectItem>
                                              ))}
                                          </SelectContent>
                                        </Select>
                                        <FormMessage />
                                      </div>
                                    </FormControl>
                                  )}
                                />
                              </div>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </FormItem>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              ))}
            </div>
            <div className="pt-6">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  append({ address: "", addressOrEns: "" });
                  form.trigger();
                }}
              >
                <UserPlus2 className="mr-2 size-5" />
                Add Transfer
              </Button>
            </div>
            {!isInsideModal && (
              <FooterButton
                isModal={false}
                cancelDisabled={true}
                href={`/${address}/op?userOperations=${userOperationsParser.serialize(userOperationsParams!)}`}
                disabled={!isFormValid}
              />
            )}
          </form>
        </Form>
      </TooltipProvider>
    </div>
  );
};
