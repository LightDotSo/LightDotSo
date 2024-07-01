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

import { useTheme } from "next-themes";
// import EmbedCal, { getCalApi } from "@calcom/embed-react";
import { FC, useEffect } from "react";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

declare global {
  interface Window {
    Cal: any;
  }
}

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

// export const CalReact: FC = () => {
//   // ---------------------------------------------------------------------------
//   // Effect Hooks
//   // ---------------------------------------------------------------------------

//   useEffect(() => {
//     (async function () {
//       const cal = await getCalApi({});
//       cal("ui", {
//         styles: { branding: { brandColor: "#000000" } },
//         hideEventTypeDetails: false,
//         layout: "month_view",
//       });
//     })();
//   }, []);

//   // ---------------------------------------------------------------------------
//   // Render
//   // ---------------------------------------------------------------------------

//   return (
//     <EmbedCal
//       calLink="lightdotso/support"
//       style={{ width: "100%", height: "100%", overflow: "scroll" }}
//       config={{ layout: "month_view" }}
//     />
//   );
// };

export const Cal: FC = () => {
  const theme = useTheme();

  // Function to dynamically load the Cal.com script
  const loadCalScript = () => {
    (function (C, A, L) {
      // @ts-ignore
      let p = function (a, ar) {
        a.q.push(ar);
      };
      let d = C.document;
      // @ts-ignore
      C.Cal =
        // @ts-ignore
        C.Cal ||
        function () {
          // @ts-ignore
          let cal = C.Cal;
          let ar = arguments;
          if (!cal.loaded) {
            cal.ns = {};
            cal.q = cal.q || [];
            d.head.appendChild(d.createElement("script")).src = A;
            cal.loaded = true;
          }
          if (ar[0] === L) {
            const api = function () {
              p(api, arguments);
            };
            const namespace = ar[1];
            // @ts-ignore
            api.q = api.q || [];
            if (typeof namespace === "string") {
              cal.ns[namespace] = cal.ns[namespace] || api;
              p(cal.ns[namespace], ar);
              p(cal, ["initNamespace", namespace]);
            } else {
              p(cal, ar);
            }
            return;
          }
          p(cal, ar);
        };
    })(window, "https://app.cal.com/embed/embed.js", "init");
  };

  useEffect(() => {
    // Load the Cal.com script
    loadCalScript();

    window.Cal("init", { origin: "https://cal.com" });

    window.Cal("inline", {
      elementOrSelector: "#my-cal-inline",
      calLink: "lightdotso/support",
      layout: "month_view",
    });

    window.Cal("ui", {
      theme: theme.resolvedTheme === "dark" ? "dark" : "light",
      styles: {
        branding: {
          // brandColor: "#000000",
        },
      },
      hideEventTypeDetails: false,
      layout: "month_view",
    });

    return () => {};
  }, [theme.theme]);

  return (
    <div
      style={{ width: "100%", height: "100%", overflow: "scroll" }}
      id="my-cal-inline"
    />
  );
};
