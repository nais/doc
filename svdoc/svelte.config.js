import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: adapter({
			fallback: "404.html",
		}),
		paths: {
			base: process.env.BASE_PATH ?? "",
		},
		prerender: {
			handleHttpError: ({ path, referrer, message }) => {
				// Ignore 404s for .md links - these are documentation links that
				// should be handled at runtime (the Link component strips .md)
				if (path.endsWith(".md")) {
					console.warn(`Ignoring broken .md link: ${path} (from ${referrer})`);
					return;
				}

				// Throw for other errors
				throw new Error(message);
			},
			handleMissingId: ({ path, id, referrers }) => {
				// Warn about missing IDs but don't fail the build
				console.warn(`Missing id="${id}" on ${path} (linked from ${referrers.join(", ")})`);
			},
		},
	},
};

export default config;
