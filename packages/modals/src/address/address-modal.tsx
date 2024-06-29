// Copyright 2023-2024 Light
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

import { AddressFormField } from "@lightdotso/forms";
import { useDebouncedValue, useRefinement } from "@lightdotso/hooks";
import { useQueryEnsDomains, useQueryWallets } from "@lightdotso/query";
import { address, addressOrEns } from "@lightdotso/schemas";
import { useAuth, useModals } from "@lightdotso/stores";
import { FooterButton, Modal } from "@lightdotso/templates";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandList,
  CommandItem,
  Form,
} from "@lightdotso/ui";
import { cn } from "@lightdotso/utils";
import { publicClient, useEnsAddress } from "@lightdotso/wagmi";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import type { Address } from "viem";
import { isAddress } from "viem";
import { normalize } from "viem/ens";
import { z } from "zod";

// -----------------------------------------------------------------------------
// Schema
// -----------------------------------------------------------------------------

const addressModalFormSchema = z.object({
  address: address,
  addressOrEns: addressOrEns,
});

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type AddressModalFormValues = z.infer<typeof addressModalFormSchema>;

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function AddressModal() {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { address } = useAuth();
  const {
    isAddressModalVisible,
    hideAddressModal,
    setSendBackgroundModal,
    addressModalProps: { onAddressSelect },
  } = useModals();

  const getEns = async ({ name }: { name: string }) =>
    publicClient.getEnsAddress({ name: normalize(name) }).then(addr => {
      console.info(addr);
      return !!addr;
    });

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const validEns = useRefinement(getEns, {
    debounce: 300,
  });

  // ---------------------------------------------------------------------------
  // Form
  // ---------------------------------------------------------------------------

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const methods = useForm<AddressModalFormValues>({
    mode: "all",
    reValidateMode: "onBlur",
    resolver: zodResolver(
      addressModalFormSchema.refine(
        ({ addressOrEns }) => {
          if (
            (addressOrEns && addressOrEns.length > 0) ||
            isAddress(addressOrEns)
          ) {
            return true;
          }
          return validEns({ name: addressOrEns });
        },
        {
          path: ["addressOrEns"],
          message: "Ens name is not valid",
        },
      ),
    ),
  });

  const watchAddress = methods.watch("address");
  const watchName = methods.watch("addressOrEns");

  // ---------------------------------------------------------------------------
  // Callback Hooks
  // ---------------------------------------------------------------------------

  const onDismiss = useCallback(() => {
    setSendBackgroundModal(false);
    hideAddressModal();
  }, [setSendBackgroundModal, hideAddressModal]);

  // ---------------------------------------------------------------------------
  // Debounced Hooks
  // ---------------------------------------------------------------------------

  const delayedName = useDebouncedValue(watchName, 300);

  // ---------------------------------------------------------------------------
  // Wagmi
  // ---------------------------------------------------------------------------

  const { data: ensAddress } = useEnsAddress({
    name:
      delayedName &&
      delayedName !== "" &&
      delayedName?.length > 3 &&
      !delayedName.endsWith(".")
        ? normalize(delayedName || "")
        : undefined,
    chainId: 1,
  });

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (ensAddress) {
      methods.setValue("addressOrEns", delayedName);
      methods.setValue("address", ensAddress);
      methods.trigger("addressOrEns");
    } else {
      if (isAddress(delayedName)) {
        methods.setValue("address", delayedName);
        methods.setValue("addressOrEns", delayedName);
        methods.trigger("addressOrEns");
      } else {
        methods.setError("addressOrEns", {
          type: "manual",
          message: "Ens name is not valid",
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ensAddress, delayedName]);

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { ensDomains, isEnsDomainsLoading } = useQueryEnsDomains({
    name: delayedName,
    limit: 6,
  });

  const { wallets, isWalletsLoading } = useQueryWallets({
    address: address as Address,
    offset: 0,
    limit: 6,
  });

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (isAddressModalVisible) {
    return (
      // eslint-disable-next-line react/jsx-no-useless-fragment
      <Form {...methods}>
        <Modal
          isHeightFixed
          open
          className="p-2"
          headerContent={
            <AddressFormField
              name="addressOrEns"
              onKeyDown={validEns.invalidate}
            />
          }
          footerContent={
            <FooterButton
              className="pt-0"
              disabled={!methods.formState.isValid}
              customSuccessText="Select Address"
              onClick={() => {
                onAddressSelect({
                  address: watchAddress,
                  addressOrEns: watchName,
                });
              }}
            />
          }
          onClose={onDismiss}
        >
          <Command className="bg-transparent">
            <CommandList className="max-h-full">
              {(methods.getValues("addressOrEns") === "" ||
                methods.getFieldState("addressOrEns").invalid) && (
                <CommandEmpty>No results found.</CommandEmpty>
              )}
              {watchName && watchName.length > 0 && (
                <CommandGroup heading="Current Input">
                  <CommandItem
                    className={cn(
                      methods.formState.isValid
                        ? "text-text-primary"
                        : "cursor-not-allowed text-text-weak",
                    )}
                    disabled={!methods.formState.isValid}
                    onSelect={() => {
                      methods.setValue("addressOrEns", watchName);
                      methods.trigger("addressOrEns");

                      if (methods.formState.isValid) {
                        onAddressSelect({
                          address: watchAddress,
                          addressOrEns: watchName,
                        });
                      }
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      {watchName}
                      <span className="ml-4 text-xs text-text-weak">
                        (Select to enter)
                      </span>
                    </div>
                  </CommandItem>
                </CommandGroup>
              )}
              {ensDomains && ensDomains.length > 0 && (
                <CommandGroup heading="ENS Suggestions">
                  {!isEnsDomainsLoading &&
                    ensDomains &&
                    ensDomains
                      .filter(ensDomain => ensDomain.name !== watchName)
                      .map(ensDomain => (
                        <CommandItem
                          key={ensDomain.id}
                          value={ensDomain.name ?? undefined}
                          onSelect={() => {
                            methods.setValue(
                              "addressOrEns",
                              ensDomain.name ?? "",
                            );
                            methods.trigger("addressOrEns");
                            validEns.invalidate();
                          }}
                        >
                          <div className="flex items-center space-x-3">
                            {ensDomain.name}
                            <span className="ml-4 text-xs text-text-weak">
                              ({ensDomain.id})
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                </CommandGroup>
              )}
              {!isWalletsLoading && wallets && wallets.length > 0 && (
                <CommandGroup heading="Owned Wallets">
                  {wallets &&
                    wallets.map(wallet => (
                      <CommandItem
                        key={wallet.address}
                        value={wallet.address}
                        onSelect={() => {
                          methods.setValue("addressOrEns", wallet.address);
                          methods.trigger("addressOrEns");
                          validEns.invalidate();
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          {wallet.name}
                          <span className="ml-4 text-xs text-text-weak">
                            ({wallet.address})
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </Modal>
      </Form>
    );
  }

  return null;
}

// -----------------------------------------------------------------------------
// Export
// -----------------------------------------------------------------------------

export default AddressModal;
