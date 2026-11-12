import { afterEach, expect, test, vi } from "vitest";

afterEach(() => {
	vi.doUnmock("$app/paths");
	vi.resetModules();
});

test.each(["", "/docs"])("preserves URL paths with base '%s'", async (base) => {
	vi.doMock("$app/paths", () => ({
		resolve: () => `${base}/`,
	}));
	const { markdownAlternativeUrl, stripBase, withBase } = await import("./urls.ts");

	expect(withBase("/workloads/")).toBe(`${base}/workloads/`);
	expect(stripBase(`${base}/workloads/`)).toBe("/workloads/");
	expect(markdownAlternativeUrl(`${base}/tags/how-to`)).toBe(`${base}/tags/how-to`);
	expect(markdownAlternativeUrl(`${base}/workloads/?tab=cli#example`)).toBe(
		`${base}/workloads.md?tab=cli#example`,
	);
	expect(markdownAlternativeUrl(`${base}/`)).toBe(`${base}/index.md`);
});
