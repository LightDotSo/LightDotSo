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

import type { WalletSettingsData } from "@lightdotso/data";
import { TokenImage } from "@lightdotso/elements";
import { useTransferQueryState } from "@lightdotso/nuqs";
import { useQuerySocketBalances } from "@lightdotso/query";
import { queryKeys } from "@lightdotso/query-keys";
import { transfer } from "@lightdotso/schemas";
import { useAuth, useModals } from "@lightdotso/stores";
import { FooterButton, Modal, useIsInsideModal } from "@lightdotso/templates";
import {
  Button,
  DialogDescription,
  DialogTitle,
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
import {
  useAccount,
  useReadContract,
  useSendTransaction,
  useSwitchChain,
  useWriteContract,
} from "@lightdotso/wagmi";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { isEmpty } from "lodash";
import { useEffect, useMemo } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import type { Address } from "viem";
import { erc20Abi } from "viem";
import type { z } from "zod";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

const depositSchema = transfer;

type DepositFormValues = z.infer<typeof transfer>;

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function DepositModal() {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { address, wallet } = useAuth();
  const { chainId, isConnecting } = useAccount();
  const { switchChain, isPending: isSwitchChainPending } = useSwitchChain();

  const {
    isDepositModalVisible,
    hideDepositModal,
    setDepositBackgroundModal,
    setTokenModalProps,
    showTokenModal,
    hideTokenModal,
  } = useModals();

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const queryClient = useQueryClient();

  const walletSettings: WalletSettingsData | undefined =
    queryClient.getQueryData(queryKeys.wallet.settings({ address }).queryKey);

  const { balances } = useQuerySocketBalances({
    address,
  });

  // ---------------------------------------------------------------------------
  // Query State
  // ---------------------------------------------------------------------------

  const [transfer, setTransfer] = useTransferQueryState();

  // ---------------------------------------------------------------------------
  // Form
  // ---------------------------------------------------------------------------

  const form = useForm<DepositFormValues>({
    mode: "all",
    reValidateMode: "onBlur",
    resolver: zodResolver(depositSchema),
  });

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

  const { data } = useReadContract({
    abi: erc20Abi,
    account: form.getValues("asset.address") as Address,
    chainId: form.getValues("chainId"),
  });

  const { sendTransaction, isPending: isSendTransactionPending } =
    useSendTransaction();
  const { writeContract, isPending: isWriteContractPending } =
    useWriteContract();

  // ---------------------------------------------------------------------------
  // Submit Handler
  // ---------------------------------------------------------------------------

  const onSubmit: SubmitHandler<DepositFormValues> = async () => {
    console.info("Deposit form submitted!");

    console.info(data);

    const assetChainId = form.getValues("chainId");

    if (!assetChainId) {
      console.error("assetChainId is not defined");
      return;
    }

    console.info("assetChainId: ", assetChainId);

    if (chainId !== assetChainId) {
      console.error("ChainId does not match");
      console.info("Current chain: ", chainId);
      console.info("Switching chain to: ", assetChainId);

      switchChain({ chainId: assetChainId });
      return;
    }

    if (!wallet) {
      console.error("Wallet is not defined");
      return;
    }

    const quantity = form.getValues("asset.quantity");

    if (!quantity) {
      console.error("Quantity is 0");
      return;
    }

    console.info("Quantity: ", quantity);

    const addr = form.getValues("asset.address") as Address;

    console.info("Address: ", addr);

    if (addr === "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee") {
      console.info("Sending ETH");

      const res = await sendTransaction({
        chainId: chainId,
        to: wallet,
        value: BigInt(quantity),
      });

      console.info(res);
      return;
    }

    const res = await writeContract({
      abi: erc20Abi,
      address: form.getValues("asset.address") as Address,
      chainId: form.getValues("chainId"),
      functionName: "transfer",
      args: [wallet, BigInt(quantity)],
    });

    console.info(res);
    // form.trigger();
    // router.push(href);
  };

  // ---------------------------------------------------------------------------
  // Memoized Hooks
  // ---------------------------------------------------------------------------

  const isFormLoading = useMemo(() => {
    return (
      form.formState.isSubmitting ||
      isSendTransactionPending ||
      isWriteContractPending ||
      isSwitchChainPending ||
      isConnecting
    );
  }, [form.formState]);

  const isFormValid = useMemo(() => {
    return form.formState.isValid && isEmpty(form.formState.errors);
  }, [form.formState]);

  // ---------------------------------------------------------------------------
  // Template Hooks
  // ---------------------------------------------------------------------------

  const isInsideModal = useIsInsideModal();

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (isDepositModalVisible) {
    return (
      <Modal
        open
        bannerContent={
          <>
            <DialogTitle>Deposit</DialogTitle>
            <DialogDescription>
              Please choose assets to deposit to this wallet!
            </DialogDescription>
          </>
        }
        footerContent={
          <FooterButton
            form="deposit-modal-form"
            disabled={!isFormValid}
            isLoading={isFormLoading}
            className="pt-0"
            customSuccessText={
              !address
                ? "Connect Wallet"
                : chainId !== form.getValues("chainId")
                  ? "Change Network"
                  : "Deposit"
            }
          />
        }
        onClose={hideDepositModal}
      >
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
            <Form {...form}>
              <form
                // ref={formRef}
                id="deposit-modal-form"
                className="space-y-4"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <FormField
                  control={form.control}
                  name="asset"
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  render={({ field: _field }) => {
                    const tokenAddress = transfer.asset?.address;
                    const chainId = transfer.chainId;

                    // Get the matching token
                    const token =
                      (balances &&
                        chainId &&
                        balances?.length > 0 &&
                        balances?.find(
                          token =>
                            token.address === tokenAddress &&
                            token.chainId === chainId,
                        )) ||
                      undefined;

                    return (
                      <FormControl>
                        <div>
                          <div className="w-full space-y-2">
                            <Label htmlFor="weight">Token</Label>
                            <Button
                              size="lg"
                              type="button"
                              variant="outline"
                              className="flex w-full items-center justify-between px-4 text-sm"
                              onClick={() => {
                                if (!address) {
                                  return;
                                }

                                setTokenModalProps({
                                  address: address,
                                  type: "socket",
                                  isTestnet:
                                    walletSettings?.is_enabled_testnet ?? false,
                                  onClose: () => {
                                    hideTokenModal();
                                    if (isInsideModal) {
                                      setDepositBackgroundModal(false);
                                    }
                                  },
                                  onTokenSelect: token => {
                                    form.setValue("chainId", token.chain_id);
                                    form.setValue(
                                      "asset.address",
                                      token.address,
                                    );
                                    form.setValue("assetType", "erc20");

                                    form.trigger();

                                    hideTokenModal();
                                    if (isInsideModal) {
                                      setDepositBackgroundModal(false);
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
                                </>
                              ) : (
                                "Select Token"
                              )}
                              <div className="grow" />
                              {/* <ChevronDown className="size-4 opacity-50" /> */}
                            </Button>
                            <FormMessage />
                          </div>
                          <div className="w-full space-y-2">
                            <Label htmlFor="weight">Amount</Label>
                            <FormField
                              control={form.control}
                              name="asset.quantity"
                              render={({ field }) => (
                                <Input
                                  {...field}
                                  type="number"
                                  className="w-full"
                                  onChange={e => {
                                    if (!e.target.value) {
                                      // Clear the value of key address
                                      form.setValue("asset.quantity", 0);
                                    }

                                    const quantity = parseInt(e.target.value);

                                    field.onChange(quantity);
                                  }}
                                />
                              )}
                            />
                          </div>
                        </div>
                      </FormControl>
                    );
                  }}
                />
              </form>
            </Form>
          </TabsContent>
          <TabsContent value="nft">
            <p className="text-sm text-text-primary">
              Change your password here. After saving, you&apos;ll be logged
              out.
            </p>
          </TabsContent>
        </Tabs>
      </Modal>
    );
  }

  return null;
}

// -----------------------------------------------------------------------------
// Export
// -----------------------------------------------------------------------------

export default DepositModal;
