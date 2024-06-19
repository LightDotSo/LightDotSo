// Copyright 2023-2024 Light, Inc.
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

"use client";

import { SIMPLEHASH_CHAIN_ID_MAPPING } from "@lightdotso/const";
import { NftImage, TokenImage } from "@lightdotso/elements";
import { useDelayedValue } from "@lightdotso/hooks";
import { useTransferQueryState } from "@lightdotso/nuqs";
import {
  useQueryNfts,
  useQuerySocketBalances,
  useQueryWalletSettings,
} from "@lightdotso/query";
import type {
  SimplehashMainnetChain,
  SimplehashTestnetChain,
  Transfer,
} from "@lightdotso/schemas";
import { transfer } from "@lightdotso/schemas";
import {
  useAuth,
  useFormRef,
  useModals,
  useTransactions,
} from "@lightdotso/stores";
import { ChainLogo } from "@lightdotso/svg";
import { FooterButton, useIsInsideModal } from "@lightdotso/templates";
import {
  toast,
  Button,
  Form,
  FormControl,
  FormField,
  FormMessage,
  Input,
  Label,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@lightdotso/ui";
import { getChainById } from "@lightdotso/utils";
import {
  useAccount,
  // useChainId,
  useModal,
  useReadContract,
  useSendTransaction,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "@lightdotso/wagmi";
import { zodResolver } from "@hookform/resolvers/zod";
import { isEmpty } from "lodash";
import type { FC } from "react";
import { useEffect, useMemo } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import type { Address } from "viem";
import { erc20Abi, erc721Abi, getAddress } from "viem";
import type { z } from "zod";

// -----------------------------------------------------------------------------
// Props
// -----------------------------------------------------------------------------

type DepositDialogProps = {
  address: Address;
  initialTransfer?: Transfer;
};

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

const depositSchema = transfer;

type DepositFormValues = z.infer<typeof transfer>;

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const DepositDialog: FC<DepositDialogProps> = ({
  address: wallet,
  initialTransfer,
}) => {
  // ---------------------------------------------------------------------------
  // Query State Hooks
  // ---------------------------------------------------------------------------

  const [transfer, setTransfer] = useTransferQueryState(initialTransfer);

  // ---------------------------------------------------------------------------
  // Connectkit
  // ---------------------------------------------------------------------------

  const { setOpen } = useModal();

  // ---------------------------------------------------------------------------
  // Wagmi
  // ---------------------------------------------------------------------------

  const { chainId, isConnecting } = useAccount();

  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { address } = useAuth();
  // const globalChainId = useChainId();
  const { switchChainAsync, isPending: isSwitchChainPending } =
    useSwitchChain();
  const {
    setIsFormDisabled,
    setIsFormLoading,
    setFormControl,
    customFormSuccessText,
    setCustomFormSuccessText,
  } = useFormRef();
  const {
    setDepositBackgroundModal,
    setTokenModalProps,
    showTokenModal,
    hideTokenModal,
    setNftModalProps,
    showNftModal,
    hideNftModal,
  } = useModals();
  const { addPendingTransaction } = useTransactions();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { walletSettings } = useQueryWalletSettings({
    address: address as Address,
  });

  const { nftPage } = useQueryNfts({
    address: address as Address,
    is_testnet: walletSettings?.is_enabled_testnet ?? false,
    limit: Number.MAX_SAFE_INTEGER,
    cursor: null,
  });

  const { balances } = useQuerySocketBalances({
    address: address as Address,
  });

  // ---------------------------------------------------------------------------
  // Form
  // ---------------------------------------------------------------------------

  const form = useForm<DepositFormValues>({
    mode: "all",
    reValidateMode: "onBlur",
    resolver: zodResolver(depositSchema),
  });

  const assetChainId = form.getValues("chainId");

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const subscription = form.watch((value, { name: _name }) => {
      if (value === undefined) {
        setTransfer(null);
      } else {
        setTransfer(value);
      }

      return;
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.watch]);

  // ---------------------------------------------------------------------------
  // Wagmi
  // ---------------------------------------------------------------------------

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data } = useReadContract({
    abi: erc20Abi,
    account: form.getValues("asset.address") as Address,
    chainId: form.getValues("chainId"),
  });

  const {
    data: sendTransactionHash,
    sendTransaction,
    isPending: isSendTransactionPending,
  } = useSendTransaction();
  const {
    isSuccess: isWaitForTransactionSuccess,
    isLoading: isWaitForTransactionLoading,
  } = useWaitForTransactionReceipt({
    hash: sendTransactionHash,
    chainId: chainId,
  });
  const {
    data: writeContractHash,
    writeContract,
    error,
    isPending: isWriteContractPending,
  } = useWriteContract();

  // ---------------------------------------------------------------------------
  // Hooks
  // ---------------------------------------------------------------------------

  const delayedIsSuccess = useDelayedValue<boolean>(
    isWaitForTransactionSuccess,
    false,
    3000,
  );

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const formStateText = useMemo(() => {
    if (!address || !chainId) {
      return "Connect Wallet";
    }

    if (!assetChainId) {
      return "Deposit";
    }

    if (isConnecting) {
      return "Connecting...";
    }

    if (isSwitchChainPending) {
      return "Switching Chain...";
    }

    if (chainId !== assetChainId) {
      return "Switch Chain";
    }

    if (isSendTransactionPending) {
      return "Depositing...";
    }

    if (isWaitForTransactionLoading) {
      return "Waiting for confirmation...";
    }

    if (delayedIsSuccess) {
      return "Success";
    }

    return "Deposit";
  }, [
    address,
    chainId,
    assetChainId,
    isConnecting,
    isSwitchChainPending,
    isSendTransactionPending,
    isWaitForTransactionLoading,
    delayedIsSuccess,
  ]);

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (sendTransactionHash && chainId) {
      addPendingTransaction({
        hash: sendTransactionHash,
        chainId: chainId,
      });
    }
  }, [addPendingTransaction, chainId, sendTransactionHash]);

  useEffect(() => {
    if (writeContractHash && chainId) {
      addPendingTransaction({
        hash: writeContractHash,
        chainId: chainId,
      });
    }
  }, [addPendingTransaction, chainId, writeContractHash]);

  useEffect(() => {
    if (!formStateText) {
      return;
    }
    setCustomFormSuccessText(formStateText);
  }, [formStateText, setCustomFormSuccessText]);

  // ---------------------------------------------------------------------------
  // Submit Handler
  // ---------------------------------------------------------------------------

  const onSubmit: SubmitHandler<DepositFormValues> = async () => {
    if (!address) {
      setOpen(true);
      return;
    }

    const assetChainId = form.getValues("chainId");

    if (!assetChainId) {
      console.error("assetChainId is not defined");
      return;
    }

    if (chainId !== assetChainId) {
      console.error("ChainId does not match");
      console.warn("Current chain: ", chainId);
      console.warn("Switching chain to: ", assetChainId);

      await switchChainAsync({ chainId: assetChainId });
    }

    if (!wallet) {
      console.error("Wallet is not defined");
      return;
    }

    const quantity = form.getValues("asset.quantity");

    if (!quantity) {
      console.error("Quantity is 0");
      console.warn("quantity: ", quantity);
      return;
    }

    const decimals = form.getValues("asset.decimals");
    if (!decimals) {
      console.error("Decimals is not defined");
      console.warn("Decimals: ", decimals);
    }

    const assetType = form.getValues("assetType");

    const contractAddress = form.getValues("asset.address") as Address;

    if (assetType === "erc721") {
      const tokenId = form.getValues("asset.tokenId");

      if (!tokenId) {
        console.error("Token ID is not defined");
        return;
      }

      const bigIntTokenId = BigInt(tokenId);

      const res = await writeContract({
        abi: erc721Abi,
        address: contractAddress,
        chainId: chainId,
        functionName: "transferFrom",
        args: [address, wallet, bigIntTokenId],
      });

      console.info(res);

      return;
    }

    if (assetType === "erc1155") {
      const tokenId = form.getValues("asset.tokenId");

      if (!tokenId) {
        console.error("Token ID is not defined");
        return;
      }

      const bigIntTokenId = BigInt(tokenId);
      const bigIntQuantity = BigInt(quantity);

      const res = await writeContract({
        abi: [
          {
            type: "function",
            name: "safeTransferFrom",
            stateMutability: "nonpayable",
            inputs: [
              {
                name: "from",
                type: "address",
              },
              {
                name: "to",
                type: "address",
              },
              {
                name: "id",
                type: "uint256",
              },
              {
                name: "amount",
                type: "uint256",
              },
              {
                name: "data",
                type: "bytes",
              },
            ],
            outputs: [],
          },
        ],
        address: contractAddress,
        chainId: chainId,
        functionName: "safeTransferFrom",
        args: [address, wallet, bigIntTokenId, bigIntQuantity, "0x"],
      });

      console.info(res);

      return;
    }

    if (!decimals) {
      console.error("Decimals is not defined");
      return;
    }

    const bigIntQuantity = BigInt(quantity * Math.pow(10, decimals));

    if (contractAddress === "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee") {
      const res = await sendTransaction({
        chainId: chainId,
        to: wallet,
        value: bigIntQuantity,
      });

      console.info(res);
      return;
    }

    const res = writeContract({
      abi: erc20Abi,
      address: contractAddress,
      chainId: chainId,
      functionName: "transfer",
      args: [wallet, bigIntQuantity],
    });

    console.error(error);

    console.info(res);
    // form.trigger();
    // router.push(href);
  };

  // ---------------------------------------------------------------------------
  // Validation
  // ---------------------------------------------------------------------------

  async function validateTokenQuantity(quantity: number) {
    // If the quantity is empty, return
    if (!quantity) {
      // If the quantity is zero, set an error
      if (quantity === 0) {
        form.setError("asset.quantity", {
          type: "manual",
          message: "Quantity must be more than 0",
        });
      }

      return;
    }

    // Check if the quantity is a number and more than the token balance
    if (quantity) {
      // If the quantity is valid, get the token balance
      const token =
        (balances &&
          chainId &&
          balances?.length > 0 &&
          balances?.find(
            token =>
              token.address === transfer.asset?.address &&
              token.chainId === transfer.chainId,
          )) ||
        undefined;

      // If the token is not found or undefined, set an error
      if (!token) {
        // Show an error on the message
        form.setError("asset.quantity", {
          type: "manual",
          message: "Please select a valid token",
        });
        // Clear the value of key address
        form.setValue("asset.quantity", 0);
      } else if (quantity > token?.amount) {
        // Show an error on the message
        form.setError("asset.quantity", {
          type: "manual",
          message: "Insufficient balance",
        });
        // Clear the value of key address
        // form.setValue(`transfers.${index}.asset.quantity`, 0);
      } else {
        // If the quantity is valid, set the value of key quantity
        form.setValue("asset.quantity", quantity);
        form.clearErrors("asset.quantity");
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const isFormLoading = useMemo(() => {
    return (
      form.formState.isSubmitting ||
      isSendTransactionPending ||
      isWaitForTransactionLoading ||
      isWriteContractPending ||
      isSwitchChainPending ||
      isConnecting
    );
  }, [
    form.formState,
    isSendTransactionPending,
    isWaitForTransactionLoading,
    isWriteContractPending,
    isSwitchChainPending,
    isConnecting,
  ]);

  const isFormValid = useMemo(() => {
    return (
      form.formState.isValid &&
      isEmpty(form.formState.errors) &&
      // Hack to check if the asset address is defined
      typeof form.getValues().asset?.address !== "undefined"
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.formState]);

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  useEffect(() => {
    setIsFormDisabled(!isFormValid || delayedIsSuccess);
  }, [isFormValid, setIsFormDisabled, delayedIsSuccess]);

  useEffect(() => {
    setIsFormLoading(isFormLoading);
  }, [isFormLoading, setIsFormLoading]);

  useEffect(() => {
    setFormControl(form.control);
  }, [form.control, setFormControl]);

  // ---------------------------------------------------------------------------
  // Template Hooks
  // ---------------------------------------------------------------------------

  const isInsideModal = useIsInsideModal();

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="grid gap-6">
      <Tabs defaultValue="token" className="py-3">
        <TabsList className="w-full">
          <TabsTrigger className="w-full" value="token">
            Token
          </TabsTrigger>
          <TabsTrigger className="w-full" value="nft">
            NFTs
          </TabsTrigger>
        </TabsList>
        <TabsContent value="token">
          <div className="pt-3">
            <Form {...form}>
              <form
                // ref={formRef}
                id="deposit-modal-form"
                className="space-y-4"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <FormField
                  control={form.control}
                  name="asset.quantity"
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  render={({ field: _field }) => {
                    // Get the matching token
                    const token =
                      (balances &&
                        chainId &&
                        balances?.length > 0 &&
                        balances?.find(
                          token =>
                            token.address === transfer.asset?.address &&
                            token.chainId === transfer.chainId,
                        )) ||
                      undefined;

                    return (
                      <FormControl>
                        <div className="flex flex-col space-y-3">
                          <div className="w-full space-y-2">
                            <Label htmlFor="weight">Token</Label>
                            <Button
                              size="lg"
                              type="button"
                              variant="outline"
                              className="flex w-full items-center justify-between px-4 text-sm"
                              onClick={() => {
                                if (!address) {
                                  toast.error(
                                    "Please connect your wallet to proceed!",
                                  );
                                  return;
                                }

                                setTokenModalProps({
                                  address: address as Address,
                                  type: "socket",
                                  isTestnet:
                                    walletSettings?.is_enabled_testnet ?? false,
                                  onClose: () => {
                                    hideTokenModal();
                                    setDepositBackgroundModal(false);
                                  },
                                  onTokenSelect: token => {
                                    form.setValue("chainId", token.chain_id);
                                    form.setValue(
                                      "asset.address",
                                      token.address,
                                    );
                                    form.setValue(
                                      "asset.decimals",
                                      token.decimals,
                                    );
                                    form.setValue("assetType", "erc20");

                                    if (!form.getValues("asset.quantity")) {
                                      form.setValue("asset.quantity", 0);
                                    }

                                    form.trigger();

                                    hideTokenModal();
                                    if (isInsideModal) {
                                      setDepositBackgroundModal(false);
                                    }

                                    const quantity =
                                      form.getValues("asset.quantity");
                                    if (quantity) {
                                      validateTokenQuantity(quantity);
                                    }
                                  },
                                });

                                setDepositBackgroundModal(true);
                                showTokenModal();
                              }}
                            >
                              {token ? (
                                <>
                                  <TokenImage
                                    size="xs"
                                    className="mr-2"
                                    token={{
                                      ...token,
                                      balance_usd: 0,
                                      id: "",
                                      chain_id: token.chainId,
                                    }}
                                  />
                                  {token?.symbol}
                                  &nbsp;
                                  <span className="text-text-weak">
                                    on {getChainById(token.chainId)?.name}
                                  </span>
                                  &nbsp;
                                  <ChainLogo chainId={token.chainId} />
                                </>
                              ) : (
                                "Select Token"
                              )}
                              <div className="grow" />
                              {/* <ChevronDown className="size-4 opacity-50" /> */}
                            </Button>
                          </div>
                          <div className="w-full space-y-2">
                            <Label htmlFor="weight">Amount</Label>
                            <FormField
                              control={form.control}
                              name="asset.quantity"
                              render={({ field }) => (
                                <div className="relative flex items-center space-x-3">
                                  <div className="relative inline-block w-full">
                                    <Input
                                      {...field}
                                      className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                      type="text"
                                      placeholder="Your amount"
                                      // onChange={e => {
                                      //   if (!e.target.value) {
                                      //     // Clear the value of key address
                                      //     form.setValue("asset.quantity", 0);
                                      //   }

                                      //   const quantity = parseInt(e.target.value);

                                      //   field.onChange(quantity);
                                      // }}
                                      onBlur={e => {
                                        // Validate the address
                                        if (!e.target.value) {
                                          // Clear the value of key address
                                          form.setValue("asset.quantity", 0);
                                        }

                                        const quantity = parseFloat(
                                          e.target.value,
                                        );

                                        validateTokenQuantity(quantity);
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
                                            parseFloat(e.target.value) || 0,
                                          );
                                        }

                                        // Validate the number
                                        const quantity = parseFloat(
                                          e.target.value,
                                        );

                                        if (!isNaN(quantity)) {
                                          validateTokenQuantity(quantity);
                                        }
                                      }}
                                    />
                                  </div>
                                  <div className="absolute inset-y-0 right-3 flex items-center">
                                    <Button
                                      size="unsized"
                                      disabled={!token}
                                      variant="outline"
                                      type="button"
                                      className="px-1 py-0.5 text-xs"
                                      onClick={() => {
                                        if (token) {
                                          form.setValue(
                                            "asset.quantity",
                                            token?.amount,
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
                              )}
                            />
                            <FormMessage />
                            <div className="flex items-center justify-between text-xs text-text-weak">
                              <div>{/* tokenPrice could come here */}</div>
                              <div>
                                &nbsp;
                                {token
                                  ? `${token.amount} ${token.symbol} available`
                                  : ""}
                              </div>
                            </div>
                          </div>
                        </div>
                      </FormControl>
                    );
                  }}
                />
              </form>
            </Form>
          </div>
        </TabsContent>
        <TabsContent value="nft">
          <div className="pt-3">
            <Form {...form}>
              <form
                // ref={formRef}
                id="deposit-modal-form"
                className="space-y-4"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <FormField
                  control={form.control}
                  name="asset.quantity"
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  render={({ field: _field }) => {
                    // Get the matching nft
                    const nft =
                      nftPage &&
                      transfer &&
                      transfer?.asset &&
                      transfer?.asset?.address &&
                      "tokenId" in
                        // eslint-disable-next-line no-unsafe-optional-chaining, @typescript-eslint/no-non-null-asserted-optional-chain
                        transfer?.asset! &&
                      nftPage.nfts?.find(
                        nft =>
                          nft.contract_address ===
                            (transfer?.asset?.address || "") &&
                          parseInt(nft.token_id!) ===
                            // prettier-ignore
                            // @ts-expect-error
                            transfer?.asset!.tokenId,
                      );

                    return (
                      <FormControl>
                        <div className="flex flex-col space-y-3">
                          <div className="w-full space-y-2">
                            <Label htmlFor="weight">NFT</Label>
                            <Button
                              size="lg"
                              type="button"
                              variant="outline"
                              className="flex w-full items-center justify-between px-4 text-sm"
                              onClick={() => {
                                if (!address) {
                                  toast.error(
                                    "Please connect your wallet to proceed!",
                                  );
                                  return;
                                }

                                setNftModalProps({
                                  address: address as Address,
                                  onClose: () => {
                                    hideNftModal();
                                    if (isInsideModal) {
                                      setDepositBackgroundModal(false);
                                    }
                                  },
                                  onNftSelect: nft => {
                                    if (nft.contract_address) {
                                      form.setValue(
                                        "asset.address",
                                        getAddress(nft.contract_address),
                                      );
                                    }
                                    if (nft.chain) {
                                      form.setValue(
                                        "chainId",
                                        SIMPLEHASH_CHAIN_ID_MAPPING[
                                          nft.chain! as
                                            | SimplehashMainnetChain
                                            | SimplehashTestnetChain
                                        ],
                                      );
                                    }
                                    if (nft.token_id) {
                                      form.setValue(
                                        "asset.tokenId",
                                        parseInt(nft.token_id),
                                      );
                                    }

                                    const assetType =
                                      nft.contract?.type?.toLowerCase();
                                    form.setValue("assetType", assetType);

                                    if (assetType === "erc721") {
                                      form.setValue("asset.decimals", 1);
                                    } else if (
                                      !form.getValues("asset.quantity")
                                    ) {
                                      form.setValue("asset.quantity", 1);
                                    }

                                    form.trigger();

                                    hideNftModal();
                                    if (isInsideModal) {
                                      setDepositBackgroundModal(false);
                                    }
                                  },
                                });
                                setDepositBackgroundModal(true);
                                showNftModal();
                              }}
                            >
                              {nft ? (
                                <>
                                  <div className="mr-2 size-6">
                                    <NftImage
                                      className="rounded-md"
                                      nft={nft}
                                    />
                                  </div>
                                  &nbsp;
                                  {nft.collection?.name}
                                </>
                              ) : (
                                "Select Token"
                              )}
                              <div className="grow" />
                            </Button>
                          </div>
                          <div className="w-full space-y-2">
                            <Label htmlFor="weight">Amount</Label>
                            <FormField
                              control={form.control}
                              name="asset.quantity"
                              render={({ field }) => (
                                <div className="relative flex items-center space-x-3">
                                  <div className="relative inline-block w-full">
                                    <Input
                                      disabled={
                                        nft
                                          ? nft.contract?.type === "erc721"
                                          : false
                                      }
                                      {...field}
                                      className="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                      type="text"
                                      placeholder="Your amount"
                                      // onChange={e => {
                                      //   if (!e.target.value) {
                                      //     // Clear the value of key address
                                      //     form.setValue("asset.quantity", 0);
                                      //   }

                                      //   const quantity = parseInt(e.target.value);

                                      //   field.onChange(quantity);
                                      // }}
                                      onBlur={e => {
                                        // Validate the address
                                        if (!e.target.value) {
                                          // Clear the value of key address
                                          form.setValue("asset.quantity", 0);
                                        }

                                        const quantity = parseFloat(
                                          e.target.value,
                                        );

                                        validateTokenQuantity(quantity);
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
                                            parseFloat(e.target.value) || 0,
                                          );
                                        }

                                        // Validate the number
                                        const quantity = parseFloat(
                                          e.target.value,
                                        );

                                        if (!isNaN(quantity)) {
                                          validateTokenQuantity(quantity);
                                        }
                                      }}
                                    />
                                  </div>
                                  <div className="absolute inset-y-0 right-3 flex items-center">
                                    <Button
                                      disabled={!nft}
                                      size="unsized"
                                      variant="outline"
                                      type="button"
                                      className="px-1 py-0.5 text-xs"
                                      onClick={() => {
                                        if (nft) {
                                          form.setValue("asset.quantity", 1);
                                        }

                                        // Validate the form
                                        form.trigger();
                                      }}
                                    >
                                      Max
                                    </Button>
                                  </div>
                                </div>
                              )}
                            />
                            <FormMessage />
                            {/* Placeholder text for alignment purposes */}
                            <div className="flex items-center justify-between text-xs text-text-weak">
                              &nbsp;
                            </div>
                          </div>
                        </div>
                      </FormControl>
                    );
                  }}
                />
              </form>
            </Form>
          </div>
        </TabsContent>
      </Tabs>
      {!isInsideModal && (
        <FooterButton
          form="deposit-modal-form"
          isModal={false}
          cancelDisabled={true}
          isLoading={isFormLoading}
          disabled={!isFormValid || isFormLoading || delayedIsSuccess}
          customSuccessText={customFormSuccessText}
        />
      )}
    </div>
  );
};
