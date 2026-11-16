import { expect, test } from "@playwright/test";

for (const width of [375, 1280]) {
	test(`homepage navigation renders as cards at ${width}px`, async ({ page }) => {
		await page.setViewportSize({ width, height: 900 });
		await page.goto("/");
		await expect(page.locator(".layout-root")).toHaveAttribute("data-hydrated", "true");
		const grids = page.locator("article .grid.cards > ul");
		await expect(grids).toHaveCount(2);
		for (const grid of await grids.all()) {
			await expect(grid).toHaveCSS("display", "grid");
			await expect(grid).toHaveCSS("list-style-type", "none");
			await expect(grid).toHaveCSS("gap", "16px");
			const columns = await grid.evaluate(
				(element) => getComputedStyle(element).gridTemplateColumns.split(" ").length,
			);
			if (width === 375) {
				expect(columns).toBe(1);
			} else {
				expect(columns).toBeGreaterThan(1);
			}
			const card = grid.locator(":scope > li").first();
			await expect(card).toHaveCSS("padding", "16px");
			await expect(card).toHaveCSS("border-top-width", "1px");
			await expect(card).toHaveCSS("border-radius", "8px");
		}
		expect(
			await page.evaluate(
				() => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
			),
		).toBe(true);
		const link = grids.first().getByRole("link", { name: "What is Nais?", exact: true });
		await link.focus();
		await expect(link).toBeFocused();
		await page.keyboard.press("Enter");
		await expect(page).toHaveURL(/\/explanations\/nais\/$/);
	});
}
