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

import { AddressFormField, OwnerForm } from "@lightdotso/forms";
import { useRefinement } from "@lightdotso/hooks";
import { addressOrEns } from "@lightdotso/schemas";
import { useAuth, useModals } from "@lightdotso/stores";
import { FooterButton, Modal } from "@lightdotso/templates";
import { Form } from "@lightdotso/ui";
import { publicClient } from "@lightdotso/wagmi";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { isAddress } from "viem";
import { normalize } from "viem/ens";
import { z } from "zod";

// -----------------------------------------------------------------------------
// Schema
// -----------------------------------------------------------------------------

const ownerModalFormSchema = z.object({
  addressOrEns: addressOrEns,
});

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export function OwnerModal() {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const {
    isOwnerModalVisible,
    hideOwnerModal,
    // ownerModalProps: { onOwnerSelect },
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
      ownerModalFormSchema.refine(
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

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (isOwnerModalVisible) {
    return (
      // eslint-disable-next-line react/jsx-no-useless-fragment
      <Form {...methods}>
        <Modal
          isHeightFixed
          open
          size="lg"
          className="h-[36rem] p-2"
          footerContent={
            <FooterButton
              className="pt-0"
              disabled={!methods.formState.isValid}
              customSuccessText="Select Address"
              onClick={() => {}}
            />
          }
          onClose={hideOwnerModal}
        >
          <div className="p-4">
            <OwnerForm />
          </div>
        </Modal>
      </Form>
    );
  }

  return null;
}

// -----------------------------------------------------------------------------
// Export
// -----------------------------------------------------------------------------

export default OwnerModal;
