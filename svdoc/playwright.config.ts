import { defineConfig } from "@playwright/test";

const appURL = process.env.DOC_PILOT_URL ?? "http://127.0.0.1:4174";

export default defineConfig({
	testDir: "./tests/browser",
	forbidOnly: Boolean(process.env.CI),
	retries: 0,
	workers: 1,
	reporter: "list",
	use: {
		baseURL: appURL,
		trace: "retain-on-failure",
	},
	webServer: [
		...(process.env.DOC_PILOT_URL
			? []
			: [
					{
						command: "pnpm run dev --host 127.0.0.1 --port 4174 --strictPort",
						port: 4174,
						env: { TENANT: "nav", NOT_TENANT: "not-nav" },
					},
				]),
		{
			command:
				"pnpm exec vite --config tests/browser/vite.config.ts --host 127.0.0.1 --port 4175 --strictPort",
			port: 4175,
		},
	],
});
