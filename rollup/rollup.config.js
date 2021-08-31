import vue from "rollup-plugin-vue";
import css from "rollup-plugin-css-only";
import { nodeResolve } from "@rollup/plugin-node-resolve";

export default [
  {
    input: "src/index.js",
    output: {
      file: "dist/app.js",
      sourcemap: "inline",
      name: "PywbVue",
      format: "iife",
    },
    plugins: [
      vue({css: true, compileTemplate: true}),
      css(),
      nodeResolve({browser: true})
    ],
  },
];
