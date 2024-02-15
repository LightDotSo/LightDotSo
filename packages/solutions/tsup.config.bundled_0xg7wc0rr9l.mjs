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

// tsup.config.ts
import { defineConfig } from "tsup";
var isProduction = process.env.NODE_ENV === "production";
var tsup_config_default = defineConfig({
  clean: true,
  dts: true,
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  minify: isProduction,
  sourcemap: true,
});
export { tsup_config_default as default };
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidHN1cC5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9faW5qZWN0ZWRfZmlsZW5hbWVfXyA9IFwiL1VzZXJzL3NodW5rYWtpbm9raS9naHEvZ2l0aHViLmNvbS9MaWdodERvdFNvL0xpZ2h0RG90U28vcGFja2FnZXMvc29sdXRpb25zL3RzdXAuY29uZmlnLnRzXCI7Y29uc3QgX19pbmplY3RlZF9kaXJuYW1lX18gPSBcIi9Vc2Vycy9zaHVua2FraW5va2kvZ2hxL2dpdGh1Yi5jb20vTGlnaHREb3RTby9MaWdodERvdFNvL3BhY2thZ2VzL3NvbHV0aW9uc1wiO2NvbnN0IF9faW5qZWN0ZWRfaW1wb3J0X21ldGFfdXJsX18gPSBcImZpbGU6Ly8vVXNlcnMvc2h1bmtha2lub2tpL2docS9naXRodWIuY29tL0xpZ2h0RG90U28vTGlnaHREb3RTby9wYWNrYWdlcy9zb2x1dGlvbnMvdHN1cC5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidHN1cFwiO1xuXG5jb25zdCBpc1Byb2R1Y3Rpb24gPSBwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gXCJwcm9kdWN0aW9uXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIGNsZWFuOiB0cnVlLFxuICBkdHM6IHRydWUsXG4gIGVudHJ5OiBbXCJzcmMvaW5kZXgudHNcIl0sXG4gIGZvcm1hdDogW1wiY2pzXCIsIFwiZXNtXCJdLFxuICBtaW5pZnk6IGlzUHJvZHVjdGlvbixcbiAgc291cmNlbWFwOiB0cnVlLFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQStXLFNBQVMsb0JBQW9CO0FBRTVZLElBQU0sZUFBZSxRQUFRLElBQUksYUFBYTtBQUU5QyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixPQUFPO0FBQUEsRUFDUCxLQUFLO0FBQUEsRUFDTCxPQUFPLENBQUMsY0FBYztBQUFBLEVBQ3RCLFFBQVEsQ0FBQyxPQUFPLEtBQUs7QUFBQSxFQUNyQixRQUFRO0FBQUEsRUFDUixXQUFXO0FBQ2IsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
