import { defineConfig } from "@trigger.dev/sdk/v3";

export default defineConfig({
  project: "proj_mgkoedwrgnjwbckanbbx",
  dirs: ["src/trigger"],
  // Default for most tasks. ML tasks override per-task (ml-parquet-rebuild: 360s, ml-weekly-pipeline: 1800s).
  maxDuration: 60,
});
