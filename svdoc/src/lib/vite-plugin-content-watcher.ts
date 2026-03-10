/**
 * Vite plugin for watching markdown files and triggering HMR
 *
 * This plugin watches the docs directory for changes to markdown files
 * and .pages files, then triggers a full page reload when changes are detected.
 */

import type { Plugin, ViteDevServer } from "vite";
import { resolve } from "node:path";

const DOCS_DIR = resolve(process.cwd(), "../docs");

export function contentWatcherPlugin(): Plugin {
	let server: ViteDevServer | null = null;

	return {
		name: "content-watcher",

		configureServer(viteServer) {
			server = viteServer;

			// Watch the docs directory for changes
			const watcher = server.watcher;

			// Add the docs directory to the watcher
			watcher.add(DOCS_DIR);

			// Handle file changes
			const handleChange = async (filePath: string) => {
				// Only handle markdown and .pages files
				if (!filePath.endsWith(".md") && !filePath.endsWith(".pages")) {
					return;
				}

				// Only handle files in the docs directory
				if (!filePath.startsWith(DOCS_DIR)) {
					return;
				}

				console.log(`[content-watcher] File changed: ${filePath}`);

				// Invalidate the content store
				try {
					const { contentStore } = await import("./content-store");
					await contentStore.invalidateFile(filePath);
				} catch (error) {
					console.error("[content-watcher] Failed to invalidate content store:", error);
				}

				// Send full reload signal to the browser
				server?.ws.send({
					type: "full-reload",
					path: "*",
				});
			};

			watcher.on("change", handleChange);
			watcher.on("add", handleChange);
			watcher.on("unlink", async (filePath) => {
				if (!filePath.endsWith(".md") && !filePath.endsWith(".pages")) {
					return;
				}

				if (!filePath.startsWith(DOCS_DIR)) {
					return;
				}

				console.log(`[content-watcher] File deleted: ${filePath}`);

				// Invalidate the entire store on deletion
				try {
					const { contentStore } = await import("./content-store");
					await contentStore.invalidateAll();
				} catch (error) {
					console.error("[content-watcher] Failed to invalidate content store:", error);
				}

				server?.ws.send({
					type: "full-reload",
					path: "*",
				});
			});
		},
	};
}
