import { describe, expect, test } from "bun:test";
import { makeTabSlugs, slugifyTabLabel } from "./tab-slug";

describe("tab slugs", () => {
	test("creates stable URL slugs", () => {
		expect(slugifyTabLabel("GitOps")).toBe("gitops");
		expect(slugifyTabLabel("CLI")).toBe("cli");
		expect(slugifyTabLabel("API (experimental)")).toBe("api-experimental");
		expect(slugifyTabLabel("Windows (Manual)")).toBe("windows-manual");
	});

	test("normalizes Norwegian characters", () => {
		expect(slugifyTabLabel("Slett på nytt år")).toBe("slett-pa-nytt-ar");
	});

	test("disambiguates duplicate labels within one tab group", () => {
		expect(makeTabSlugs(["CLI", "CLI", "CLI"])).toEqual(["cli", "cli-2", "cli-3"]);
	});
});
