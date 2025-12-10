import tailwindcss from "@tailwindcss/vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import { contentWatcherPlugin } from "./src/lib/vite-plugin-content-watcher";

export default defineConfig({
	plugins: [tailwindcss(), sveltekit(), contentWatcherPlugin()],
});
