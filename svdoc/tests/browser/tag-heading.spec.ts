import { expect, test } from "@playwright/test";

for (const width of [375, 1280]) {
	for (const theme of ["light", "dark"]) {
		test(`doc Tag and Heading retain typography: ${theme}, ${width}px`, async ({ page }) => {
			await page.setViewportSize({ width, height: 900 });
			await page.goto("http://127.0.0.1:4175/tests/browser/pilot.html");
			const scope = page.getByTestId("inner-theme");
			if (theme === "dark") {
				await page.getByRole("button", { name: "Toggle nested theme" }).click();
			}
			const sizes = [32, 28, 24, 20, 16, 16];
			for (const [index, size] of sizes.entries()) {
				const heading = scope.getByRole("heading", {
					level: index + 1,
					name: `Heading ${index + 1}`,
					exact: true,
				});
				await expect(heading).toHaveAttribute("id", `pilot-heading-${index + 1}`);
				await expect(heading).toHaveCSS("font-size", `${size}px`);
				await expect(heading).toHaveCSS("font-weight", "600");
				expect(
					await heading.evaluate((element) => {
						const style = getComputedStyle(element);
						return Number.parseFloat(style.lineHeight) / Number.parseFloat(style.fontSize);
					}),
				).toBeCloseTo(1.3, 4);
				await expect(heading).toHaveCSS("margin-bottom", `${size / 2}px`);
				await expect(heading).toHaveCSS(
					"color",
					theme === "light" ? "rgb(15, 23, 42)" : "rgb(248, 250, 252)",
				);
			}
			const override = scope.getByTestId("override-heading");
			await expect(override).toHaveJSProperty("tagName", "H3");
			await expect(override).toHaveClass(/custom-heading/);
			await expect(override).toHaveCSS("font-size", "28px");
			await expect(override).toHaveCSS("margin-bottom", "0px");

			const tag = scope.getByTestId("pilot-tag");
			await expect(tag).toHaveJSProperty("tagName", "SPAN");
			await expect(tag).toHaveClass(/custom-tag/);
			await expect(tag).toHaveCSS("font-size", "13px");
			await expect(tag).toHaveCSS("font-weight", "500");
			await expect(tag).toHaveCSS("line-height", "19.5px");
			await expect(tag).toHaveCSS("padding", "2px 8px");
			await expect(tag).toHaveCSS("border-radius", "8px");
			await expect(tag).toHaveCSS("font-variant-numeric", "normal");
			await expect(tag).toHaveCSS(
				"color",
				theme === "light" ? "rgb(29, 78, 216)" : "rgb(96, 165, 250)",
			);
			await expect(tag).toHaveCSS(
				"background-color",
				theme === "light" ? "rgba(37, 99, 235, 0.08)" : "rgba(96, 165, 250, 0.12)",
			);
			await expect(tag).toHaveCSS(
				"border-color",
				theme === "light" ? "rgba(37, 99, 235, 0.22)" : "rgba(96, 165, 250, 0.28)",
			);
			const wrappingTag = scope.getByTestId("wrapping-tag");
			await expect(wrappingTag).toHaveCSS("white-space", "normal");
			const bounds = await wrappingTag.boundingBox();
			if (!bounds) throw new Error("Missing wrapping tag bounds");
			expect(bounds.width).toBeLessThanOrEqual(100);
			expect(bounds.height).toBeGreaterThan(25.5);
			const link = scope.getByRole("link", { name: "Pilot tag link" });
			await link.focus();
			await expect(link).toBeFocused();
			await page.keyboard.press("Enter");
			await expect(page).toHaveURL(/#pilot-heading-1$/);
		});
	}
}

test("Markdown headings and tag links survive SSR and hydration", async ({ page, request }) => {
	const errors: string[] = [];
	page.on("pageerror", (error) => errors.push(error.message));
	page.on("console", (message) => {
		if (message.type() === "error" || /hydration_/i.test(message.text())) {
			errors.push(message.text());
		}
	});
	const response = await request.get("/tutorials/hello-nais/");
	expect(response.ok()).toBe(true);
	const html = await response.text();
	expect(html).toMatch(/<h1[^>]*id=/);
	expect(html).toMatch(/class="headerlink(?:\s|")/);
	expect(html).toContain("sh-tag");
	await page.goto("/tutorials/hello-nais/");
	await expect(page.locator(".layout-root")).toHaveAttribute("data-hydrated", "true");
	const heading = page.locator("article h1[id]").first();
	await expect(heading).toHaveCSS("font-size", "32px");
	await expect(heading).toHaveCSS("font-weight", "600");
	await expect(heading).toHaveCSS("line-height", "41.6px");
	const id = await heading.getAttribute("id");
	const permalink = heading.getByTitle("Permanent link");
	await expect(permalink).toHaveAttribute("href", `#${id}`);
	await permalink.focus();
	await page.keyboard.press("Enter");
	expect(new URL(page.url()).hash).toBe(`#${id}`);
	const tagLink = page.locator(".tags .tag-link").first();
	await expect(tagLink.locator(".sh-tag")).toHaveCSS("font-size", "13px");
	await expect(tagLink.locator(".sh-tag")).toHaveCSS("line-height", "19.5px");
	await expect(tagLink.locator(".sh-tag")).toHaveCSS("border-radius", "8px");
	const tagName = (await tagLink.innerText()).trim();
	const destination = await tagLink.getAttribute("href");
	if (!destination) throw new Error("Missing tag destination");
	await tagLink.focus();
	await page.keyboard.press("Enter");
	const expectedURL = new URL(destination, page.url());
	expectedURL.pathname = `${expectedURL.pathname.replace(/\/$/, "")}/`;
	await expect(page).toHaveURL(expectedURL.href);
	await expect(page.locator("h1 .sh-tag")).toHaveText(tagName);
	await page.getByRole("link", { name: "All tags", exact: true }).click();
	await expect(page.locator(".tag-card .sh-tag").first()).toBeVisible();
	expect(errors).toEqual([]);
});
