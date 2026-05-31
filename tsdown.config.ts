import { defineConfig, type UserConfig } from "tsdown";

export default defineConfig({
  entry: "src/index.ts",
  dts: true,
}) satisfies UserConfig as UserConfig;
