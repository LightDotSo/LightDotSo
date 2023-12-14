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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Badge,
} from "@lightdotso/ui";
import { motion, AnimatePresence } from "framer-motion";
import type { FC } from "react";
import { useNewForm } from "@/stores";

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export const RootContext: FC = () => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { address, errors, formValues, isValid, isLoading } = useNewForm();

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-6">
      <AnimatePresence>
        <motion.div className="rounded-md border border-border bg-background-weak">
          <pre className="mt-2 w-full overflow-auto rounded-md p-4">
            <code className="break-all text-text">
              {isLoading ? "IsLoading" : "Loaded"}
              <br />
              {address && <>{address}</>}
              <br />
              {formValues?.name && <>Name: {formValues.name}</>}
            </code>
          </pre>
        </motion.div>
        <motion.div
          key="info"
          className="rounded-md border border-border-info-weaker bg-background-info-weakest p-4"
          initial={{ opacity: 0, y: 300 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 300 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <Badge className="mb-1" variant="info">
            <span className="text-text-weakest">Info</span>
          </Badge>
          <Accordion className="text-text-info-strong" type="multiple">
            <AccordionItem value="item-1" className="border-border-info-weaker">
              <AccordionTrigger>Is it accessible?</AccordionTrigger>
              <AccordionContent className="text-text-info">
                Yes. It adheres to the WAI-ARIA design pattern.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" className="border-border-info-weaker">
              <AccordionTrigger>Is it styled?</AccordionTrigger>
              <AccordionContent className="text-text-info">
                Yes. It comes with default styles that matches the other
                components&apos; aesthetic.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3" className="border-border-info-weaker">
              <AccordionTrigger>Is it animated?</AccordionTrigger>
              <AccordionContent className="text-text-info">
                Yes. It&apos;s animated by default, but you can disable it if
                you prefer.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </motion.div>
        {!isValid && (
          <motion.div
            key="warning"
            className="rounded-md border border-border-warning-weaker bg-background-warning-weakest p-4"
            initial={{ opacity: 0, y: 300 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 300 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <Badge className="mb-1" variant="warning">
              <span className="text-text-weakest">Warning</span>
            </Badge>
            <Accordion className="text-text-warning-strong" type="multiple">
              <AccordionItem
                value="item-1"
                className="border-border-warning-weaker"
              >
                <AccordionTrigger>Is it accessible?</AccordionTrigger>
                <AccordionContent className="text-text-warning">
                  Yes. It adheres to the WAI-ARIA design pattern.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem
                value="item-2"
                className="border-border-warning-weaker"
              >
                <AccordionTrigger>Is it styled?</AccordionTrigger>
                <AccordionContent className="text-text-warning">
                  Yes. It comes with default styles that matches the other
                  components&apos; aesthetic.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem
                value="item-3"
                className="border-border-warning-weaker"
              >
                <AccordionTrigger>Is it animated?</AccordionTrigger>
                <AccordionContent className="text-text-warning">
                  Yes. It&apos;s animated by default, but you can disable it if
                  you prefer.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </motion.div>
        )}
        {!isValid && errors && (
          <motion.div
            key="error"
            className="rounded-md border border-border-error-weaker bg-background-error/15 p-4"
            initial={{ opacity: 0, y: 300 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 300 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <Badge className="mb-1" variant="error">
              <span className="text-text-weakest">Error</span>
            </Badge>
            <Accordion className="text-text-error-strong" type="multiple">
              {errors.issues.map((error, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border-border-error-weaker"
                >
                  <AccordionTrigger>
                    {error.code} {error.path}
                  </AccordionTrigger>
                  <AccordionContent className="text-text-error">
                    {error.message}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
