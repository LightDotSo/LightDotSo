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
  Label,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@lightdotso/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
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

  const { address } = useAuth();
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
  // Submit Handler
  // ---------------------------------------------------------------------------

  const onSubmit: SubmitHandler<DepositFormValues> = () => {
    form.trigger();

    // router.push(href);
  };

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
          <FooterButton className="pt-0" customSuccessText="Deposit" />
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
                id="send-dialog-form"
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
                                  form.setValue("asset.address", token.address);
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
