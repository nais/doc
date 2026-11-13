import { svelte } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
	cacheDir: "node_modules/.vite-ui-pilot",
	plugins: [tailwindcss(), svelte({ configFile: false, compilerOptions: { runes: true } })],
});
