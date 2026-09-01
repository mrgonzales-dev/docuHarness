const { defineConfig } = require("vite");
const vue = require("@vitejs/plugin-vue");

module.exports = defineConfig({
  plugins: [vue()],
  root: "src/renderer",
  base: "./",
  server: {
    host: "127.0.0.1",
    port: 3000,
    strictPort: true,
  },
  build: {
    outDir: "../../dist",
    emptyOutDir: true,
  },
  test: {
    root: ".",
    include: ["test/**/*.test.ts"],
    globals: true,
  },
});
