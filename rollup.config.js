import { nodeResolve } from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";

export default {
  input: "build/index.js",
  output: {
    file: "flight-status-tracker-cards.js",
    format: "es",
    sourcemap: true,
  },
  plugins: [nodeResolve(), terser()],
};
