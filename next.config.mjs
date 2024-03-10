/** @type {import('next').NextConfig} */
import path from "path";
import WasmPackPlugin from "@wasm-tool/wasm-pack-plugin";

// https://stackoverflow.com/a/50052194
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
const __dirname = dirname(fileURLToPath(import.meta.url));
const crateDirectory = path.resolve(__dirname, "pslab-wasm");

export default {
  output: "export",
  experimental: {
    webpackBuildWorker: true,
  },
  webpack: (
    config,
    { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }
  ) => ({
    ...config,
    experiments: {
      asyncWebAssembly: true,
      layers: true,
    },
    plugins: [
      ...config.plugins,
      // Check https://rustwasm.github.io/wasm-pack/book/commands/build.html
      // for the available set of arguments.
      new WasmPackPlugin({
        crateDirectory,
        args: "--log-level info --verbose",
      }),
    ],
  }),
};
