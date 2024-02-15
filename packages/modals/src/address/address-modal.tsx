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

import { AddressForm } from "@lightdotso/forms";
import { useDebouncedValue, useRefinement } from "@lightdotso/hooks";
import { useQueryEnsDomains, useQueryWallets } from "@lightdotso/query";
import { addressOrEns } from "@lightdotso/schemas";
import { useAuth, useModals } from "@lightdotso/stores";
import { FooterButton, Modal } from "@lightdotso/templates";
import { Form } from "@lightdotso/ui";
import { publicClient } from "@lightdotso/wagmi";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { Address } from "viem";
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

  const { ensDomains } = useQueryEnsDomains({
    name: delayedName,
    limit: 6,
  });

  const { wallets } = useQueryWallets({
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
      <>
        <Form {...methods}>
          <Modal
            open
            className="p-2"
            headerContent={
              <AddressForm
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
            {ensDomains && ensDomains.length > 0 && (
              <div className="">
                {ensDomains &&
                  ensDomains
                    .filter(ensDomain => ensDomain.name !== watchName)
                    .map(ensDomain => (
                      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
                      <div
                        key={ensDomain.id}
                        className="flex cursor-pointer flex-row items-center space-x-2 rounded-md p-2 text-base font-light hover:bg-background-stronger"
                        onClick={() => {
                          methods.setValue("addressOrEns", ensDomain.name);
                          methods.trigger("addressOrEns");
                          validEns.invalidate();
                        }}
                      >
                        <div>{ensDomain.name}</div>
                      </div>
                    ))}
              </div>
            )}
            {wallets && wallets.length > 0 && (
              <div className="">
                {wallets &&
                  wallets.map(wallet => (
                    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
                    <div
                      key={wallet.address}
                      className="flex cursor-pointer flex-row items-center space-x-2 rounded-md p-2 text-base font-light hover:bg-background-stronger"
                      onClick={() => {
                        methods.setValue("addressOrEns", wallet.address);
                        methods.trigger("addressOrEns");
                        validEns.invalidate();
                      }}
                    >
                      <div>{wallet.address}</div>
                    </div>
                  ))}
              </div>
            )}
          </Modal>
        </Form>
      </>
    );
  }

  return null;
}

// -----------------------------------------------------------------------------
// Export
// -----------------------------------------------------------------------------

export default AddressModal;
