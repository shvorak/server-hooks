import dts from "bun-plugin-dts";

const result = await Bun.build({
    entrypoints: ['./source/index.ts'],
    target: "node",
    outdir: './dist',
    plugins: [dts()],
    sourcemap: "external",
    format: "esm",
})
