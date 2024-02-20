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

import { AddressFormField } from "@lightdotso/forms";
import { useDebouncedValue, useRefinement } from "@lightdotso/hooks";
import { useQueryEnsDomains, useQueryWallets } from "@lightdotso/query";
import { addressOrEns } from "@lightdotso/schemas";
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
import { publicClient } from "@lightdotso/wagmi";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { isAddress } from "viem";
import { normalize } from "viem/ens";
import { z } from "zod";

// -----------------------------------------------------------------------------
// Schema
// -----------------------------------------------------------------------------

const addressModalFormSchema = z.object({
  addressOrEns: addressOrEns,
});

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
    addressModalProps: { onAddressSelect },
  } = useModals();

  const getEns = async ({ name }: { name: string }) =>
    publicClient.getEnsAddress({ name: normalize(name) }).then(addr => {
      // console.log(addr);
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
  const methods = useForm({
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

  const watchName = methods.watch("addressOrEns");

  // ---------------------------------------------------------------------------
  // Debounced Hooks
  // ---------------------------------------------------------------------------

  const delayedName = useDebouncedValue(watchName, 1000);

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  const { ensDomains, isEnsDomainsLoading } = useQueryEnsDomains({
    name: delayedName,
    limit: 6,
  });

  const { wallets, isWalletsLoading } = useQueryWallets({
    address: address,
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
              customSuccessText="Select"
              onClick={() => {
                onAddressSelect(watchName);
              }}
            />
          }
          onClose={hideAddressModal}
        >
          <Command className="bg-transparent">
            <CommandList>
              {(methods.getValues("addressOrEns") === "" ||
                methods.getFieldState("addressOrEns").invalid) && (
                <CommandEmpty>No results found.</CommandEmpty>
              )}
              {ensDomains && ensDomains.length > 0 && (
                <CommandGroup heading="ENS Suggestions">
                  {isEnsDomainsLoading &&
                    [...Array(3)].map((_, i) => (
                      <CommandItem key={i} disabled>
                        Loading...
                      </CommandItem>
                    ))}
                  {!isEnsDomainsLoading &&
                    ensDomains &&
                    ensDomains
                      .filter(ensDomain => ensDomain.name !== watchName)
                      .map(ensDomain => (
                        <CommandItem
                          key={ensDomain.id}
                          onSelect={() => {
                            methods.setValue("addressOrEns", ensDomain.name);
                            methods.trigger("addressOrEns");
                            validEns.invalidate();
                          }}
                        >
                          {ensDomain.name}
                        </CommandItem>
                      ))}
                </CommandGroup>
              )}
              {isWalletsLoading &&
                [...Array(3)].map((_, i) => (
                  <CommandItem key={i} disabled>
                    Loading...
                  </CommandItem>
                ))}
              {!isWalletsLoading && wallets && wallets.length > 0 && (
                <CommandGroup heading="Owned Wallets">
                  {wallets &&
                    wallets.map(wallet => (
                      <CommandItem
                        key={wallet.address}
                        onSelect={() => {
                          methods.setValue("addressOrEns", wallet.address);
                          methods.trigger("addressOrEns");
                          validEns.invalidate();
                        }}
                      >
                        <div>{wallet.address}</div>
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
