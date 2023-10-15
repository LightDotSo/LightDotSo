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

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Form,
  TooltipProvider,
} from "@lightdotso/ui";
import { steps } from "../root";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNewFormStore } from "@/stores/useNewForm";
import {
  newFormSchema,
  newFormConfigurationSchema,
  newFormStoreSchema,
} from "@/schemas/newForm";
import { publicClient } from "@/clients/public";
import { isAddress } from "viem";
import { normalize } from "viem/ens";

type NewFormValues = z.infer<typeof newFormStoreSchema>;

export function ConfirmForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setFormValues } = useNewFormStore();

  const nameParam = searchParams.get("name");
  const typeParam = searchParams.get("type");
  const thresholdParam = searchParams.get("threshold");
  const saltParam = searchParams.get("salt");

  // create owners array
  let owners = [];

  let ownerIndex = 0;

  // Loop through the owners in the URL
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const addressParam = searchParams.get(`owners[${ownerIndex}][address]`);
    const weightParam = searchParams.get(`owners[${ownerIndex}][weight]`);

    // if both parameters for this index do not exist, stop parsing
    if ((!addressParam && !weightParam) || isNaN(parseInt(weightParam || ""))) {
      break;
    }

    let owner;

    // Parse and assign address
    if (
      addressParam &&
      weightParam &&
      newFormConfigurationSchema.shape.owners.element.safeParse({
        addressOrEns: addressParam,
        weight: parseInt(weightParam),
      }).success
    ) {
      owner = newFormConfigurationSchema.shape.owners.element.parse({
        addressOrEns: addressParam,
        weight: parseInt(weightParam),
      });
    } else {
      break;
    }

    if (isAddress(addressParam)) {
      // If the address is valid, set the value of key address
      owner.address = addressParam;
    } else if (
      addressParam &&
      addressParam.length > 3 &&
      addressParam.includes(".") &&
      /[a-zA-Z]/.test(addressParam)
    ) {
      // If the address is not valid, try to resolve it as an ENS name
      try {
        publicClient
          .getEnsAddress({
            name: normalize(addressParam),
          })
          .then(ensNameAddress => {
            if (ensNameAddress) {
              // If the ENS name resolves, set the value of key address
              owner.address = ensNameAddress;
            } else {
              // Show an error on the message
              // Since we're not using form, we'll need to handle this differently
              console.error(
                "The ENS name did not resolve. Please enter a valid address or ENS name",
              );
              owner.address = "";
            }
          })
          .catch(() => {
            // Show an error on the message
            console.error("Please enter a valid address or ENS name");
            owner.address = "";
          });
      } catch {
        // Show an error on the message
        console.error("Please enter a valid address or ENS name");
        owner.address = "";
      }
    } else {
      owner.address = "";
    }

    owners.push(owner);
    ownerIndex++;
  }

  const defaultValues: NewFormValues = {
    name: nameParam ?? "",
    type:
      typeParam && newFormSchema.shape.type.safeParse(typeParam).success
        ? newFormSchema.shape.type.parse(typeParam)
        : "multi",
    threshold:
      thresholdParam &&
      newFormConfigurationSchema.shape.threshold.safeParse(
        parseInt(thresholdParam),
      ).success
        ? newFormConfigurationSchema.shape.threshold.parse(
            parseInt(thresholdParam),
          )
        : 1,
    salt:
      saltParam &&
      newFormConfigurationSchema.shape.salt.safeParse(saltParam).success
        ? newFormConfigurationSchema.shape.salt.parse(saltParam)
        : timestampToBytes32(Math.floor(Date.now())),
    // If typeParam is personal, add two owners
    owners: owners,
  };

  const form = useForm<NewFormValues>({
    mode: "onChange",
    resolver: zodResolver(newFormStoreSchema, defaultValues),
  });

  const navigateToStep = useCallback(() => {
    const url = new URL(steps[1].href, window.location.origin);
    url.search = searchParams.toString();
    router.push(url.toString());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, searchParams]);

  // Create a function to submit the form
  const onSubmit = useCallback(
    (_values: NewFormValues) => {
      // Set the form values
      // setFormValues(values);
      // Navigate to the next step
      // navigateToStep();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [navigateToStep, setFormValues],
  );

  // Set the form values on mount
  useEffect(() => {
    form.setValue("name", defaultValues.name);
    form.setValue("type", defaultValues.type);
    form.setValue("threshold", defaultValues.threshold);
    form.setValue("salt", defaultValues.salt);
    form.setValue("owners", owners);

    setFormValues(defaultValues);

    form.trigger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card className="flex flex-col space-y-6 px-2 py-4 lg:px-6 lg:pb-6 lg:pt-8">
      <CardHeader className="gap-3">
        <CardTitle>Confirm</CardTitle>
        <CardDescription>
          Confirm the details of your new wallet.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-10">
        <TooltipProvider delayDuration={300}>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <CardFooter className="justify-end px-0">
                <Button
                  disabled={!form.formState.isValid}
                  variant={form.formState.isValid ? "default" : "outline"}
                  onClick={() => navigateToStep()}
                  type="submit"
                >
                  Continue
                </Button>
              </CardFooter>
              {/* Show all errors for debugging */}
              <pre>{JSON.stringify(defaultValues, null, 2)}</pre>
              <pre>{JSON.stringify(form.formState.errors, null, 2)}</pre>
            </form>
          </Form>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
