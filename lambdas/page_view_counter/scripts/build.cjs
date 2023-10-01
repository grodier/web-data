const path = require("path");
const esbuild = require("esbuild");

let entryPoint = path.join(__dirname, "../src", "index.ts");
esbuild.build({
  entryPoints: [entryPoint],
  bundle: true,
  outdir: path.join(__dirname, "../dist"),
  platform: "node",
  format: "esm",
  outExtension: { ".js": ".mjs" },
  treeShaking: true,
  minify: true,
  external: ["@aws-sdk/client-dynamodb", "@aws-sdk/lib-dynamodb"],
});
