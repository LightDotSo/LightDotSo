// Copyright 2023-2024 LightDotSo.
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

import { createFeedback } from "@lightdotso/client";
import type {
  FeedbackCreateBodyParams,
  FeedbackParams,
} from "@lightdotso/params";
import { queryKeys } from "@lightdotso/query-keys";
import { useAuth } from "@lightdotso/stores";
import { toast } from "@lightdotso/ui";
import { useMutation } from "@tanstack/react-query";

// -----------------------------------------------------------------------------
// Query Mutation
// -----------------------------------------------------------------------------

export const useMutationFeedbackCreate = (params: FeedbackParams) => {
  // ---------------------------------------------------------------------------
  // Stores
  // ---------------------------------------------------------------------------

  const { clientType } = useAuth();

  // ---------------------------------------------------------------------------
  // Query Mutation
  // ---------------------------------------------------------------------------

  const {
    mutate: feedbackCreate,
    isSuccess: isFeedbackCreateSuccess,
    isPending: isFeedbackCreatePending,
    failureCount,
  } = useMutation({
    mutationKey: queryKeys.feedback.create._def,
    mutationFn: async (body: FeedbackCreateBodyParams) => {
      if (!params.user_id) {
        return toast.error("Sorry, something went wrong.");
      }

      const loadingToast = toast.loading("Creating feedback...");

      const res = await createFeedback(
        {
          body: {
            feedback: body.feedback,
          },
        },
        clientType,
      );

      toast.dismiss(loadingToast);

      res.match(
        (_) => {
          toast.success("Thanks for your feedback!");
        },
        (err) => {
          if (failureCount % 3 !== 2) {
            throw err;
          }

          if (err instanceof Error) {
            toast.error(err.message);
          } else {
            toast.error("Sorry, something went wrong.");
          }

          throw err;
        },
      );
    },
  });

  return {
    feedbackCreate: feedbackCreate,
    isFeedbackCreateSuccess: isFeedbackCreateSuccess,
    isFeedbackCreatePending: isFeedbackCreatePending,
  };
};
