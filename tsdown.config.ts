import { defineConfig, type UserConfig } from "tsdown";

export default defineConfig({
  entry: "src/index.ts",
  dts: true,
  platform: "neutral",
  target: "esnext",
  cjsDefault: false,
}) satisfies UserConfig as UserConfig;
