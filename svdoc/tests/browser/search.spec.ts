import { expect, test } from "@playwright/test";

for (const width of [375, 800, 801, 1280]) {
	for (const theme of ["light", "dark"]) {
		test(`search preserves layout, focus and host styles: ${theme}, ${width}px`, async ({
			page,
		}) => {
			const errors: string[] = [];
			page.on("pageerror", (error) => errors.push(error.message));
			page.on("console", (message) => {
				if (message.type() === "error" || /hydration_/i.test(message.text())) {
					errors.push(message.text());
				}
			});
			await page.setViewportSize({ width, height: 900 });
			await page.addInitScript((value) => localStorage.setItem("theme", value), theme);
			const response = await page.goto("/");
			expect(response?.status()).toBe(200);
			if (!response) throw new Error("Missing document response");
			const homeURL = page.url();
			const html = await response.text();
			expect(html).toContain("Welcome to the Nais developer documentation");
			expect(html).not.toContain('role="dialog"');
			await expect(page.locator(".layout-root")).toHaveAttribute("data-hydrated", "true");

			const hostStyles = () =>
				page.locator(".site-header").evaluate((element) => {
					const style = getComputedStyle(element);
					return {
						fontFamily: style.fontFamily,
						fontSize: style.fontSize,
						lineHeight: style.lineHeight,
						background: style.backgroundColor,
						color: style.color,
					};
				});
			const before = await hostStyles();
			expect(before.fontFamily).toBe('"Source Sans 3", system-ui, sans-serif');
			expect(before.fontSize).toBe("16px");
			expect(before.lineHeight).toBe("24px");
			expect(
				await page.locator(".sh-theme-root").evaluate((element) => {
					const probe = document.createElement("span");
					probe.style.color = "var(--info-foreground)";
					element.append(probe);
					const color = getComputedStyle(probe).color;
					probe.remove();
					return color;
				}),
			).toBe(theme === "light" ? "rgb(255, 255, 255)" : "rgb(15, 23, 42)");
			const trigger = page.getByRole("button", { name: "Search documentation", exact: true });
			await trigger.focus();
			await page.keyboard.press("Enter");
			const dialog = page.getByRole("dialog", { name: "Search documentation", exact: true });
			const input = dialog.getByRole("searchbox");
			await expect(input).toBeFocused();
			await expect(dialog).toHaveAccessibleDescription(
				"Search by title or content. Use the arrow keys to select a result.",
			);
			await expect(dialog).toHaveCSS(
				"background-color",
				theme === "light" ? "rgb(255, 255, 255)" : "rgb(15, 23, 42)",
			);
			expect(await hostStyles()).toEqual(before);
			const bounds = await dialog.boundingBox();
			expect(bounds).toEqual(
				width <= 800
					? { x: 0, y: 0, width, height: 900 }
					: { x: (width - 800) / 2, y: 45, width: 800, height: 810 },
			);
			await expect(dialog).toHaveCSS("border-radius", width <= 800 ? "0px" : "8px");
			await expect(dialog.locator(".sh-modal__header")).toHaveCSS("height", "73px");
			await expect(dialog.locator(".sh-modal__header")).toHaveCSS("padding", "16px");
			await expect(dialog.locator(".sh-modal__body")).toHaveCSS("padding", "0px");
			await expect(dialog.getByRole("button", { name: "Close", exact: true })).toHaveCSS(
				"width",
				"28px",
			);
			await expect(input).toHaveCSS("height", "40px");
			expect(
				await dialog.evaluate((element) =>
					element.closest(".sh-theme-root")?.getAttribute("data-theme"),
				),
			).toBe(theme);
			await page.keyboard.press("Shift+Tab");
			await expect(dialog.getByRole("button", { name: "Close", exact: true })).toBeFocused();
			await page.keyboard.press("Tab");
			await expect(input).toBeFocused();
			await input.fill("nais");
			await expect(dialog.getByRole("option").first()).toBeVisible();
			await page.keyboard.press("ArrowDown");
			await expect(dialog.getByRole("option").nth(1)).toHaveAttribute("aria-selected", "true");
			await page.keyboard.press("Escape");
			await expect(dialog).toBeHidden();
			await expect(trigger).toBeFocused();
			expect(await hostStyles()).toEqual(before);
			await expect(page.locator('input[type="search"]')).toHaveCount(0);
			await page.keyboard.press("ControlOrMeta+k");
			await expect(input).toBeFocused();
			await expect(input).toHaveValue("nais");
			await dialog.getByRole("button", { name: "Close", exact: true }).click();
			await expect(dialog).toBeHidden();
			await expect(trigger).toBeFocused();
			await trigger.click();
			await expect(input).toBeFocused();
			await page.keyboard.press("Enter");
			await expect(dialog).toBeHidden();
			await expect(page).not.toHaveURL(homeURL);
			expect(errors).toEqual([]);
		});
	}
}

test("backdrop closes the search and returns focus", async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 900 });
	await page.goto("/");
	await expect(page.locator(".layout-root")).toHaveAttribute("data-hydrated", "true");
	const trigger = page.getByRole("button", { name: "Search documentation", exact: true });
	await trigger.click();
	const dialog = page.getByRole("dialog", { name: "Search documentation", exact: true });
	await expect(dialog).toBeVisible();
	await page.mouse.click(10, 450);
	await expect(dialog).toBeHidden();
	await expect(trigger).toBeFocused();
});

test("nested package themes, portals and mounting retain doc behavior", async ({ page }) => {
	await page.goto("http://127.0.0.1:4175/tests/browser/pilot.html");
	await expect(page.locator("main")).toHaveAttribute("data-ready", "true");
	await expect(page.getByTestId("outer-theme")).toHaveCSS("background-color", "rgb(9, 13, 22)");
	await expect(page.getByTestId("inner-theme")).toHaveCSS("background-color", "rgb(248, 250, 252)");
	await expect(page.getByTestId("deep-theme")).toHaveCSS("background-color", "rgb(9, 13, 22)");
	const mounts = page.getByRole("status", { name: "Mount count" });
	await expect(mounts).toHaveText("0");
	const trigger = page.getByRole("button", { name: "Open pilot" });
	await trigger.click();
	const dialog = page.getByRole("dialog", { name: "Pilot dialog", exact: true });
	await expect(dialog.getByRole("searchbox")).toBeFocused();
	await expect(mounts).toHaveText("1");
	expect(
		await dialog.evaluate((element) =>
			element.closest(".sh-theme-root")?.getAttribute("data-testid"),
		),
	).toBe("inner-theme");
	await expect(dialog).toHaveCSS("background-color", "rgb(255, 255, 255)");
	await dialog.getByRole("button", { name: "Toggle dialog theme" }).click();
	await expect(dialog).toHaveCSS("background-color", "rgb(15, 23, 42)");
	await dialog.getByRole("button", { name: "Toggle dialog theme" }).click();
	await expect(dialog).toHaveCSS("background-color", "rgb(255, 255, 255)");
	await dialog.getByRole("textbox", { name: "Uncontrolled draft" }).fill("Discard on close");
	await page.keyboard.press("Escape");
	await expect(trigger).toBeFocused();
	await expect(page.getByRole("textbox", { name: "Uncontrolled draft" })).toHaveCount(0);
	await page.getByRole("button", { name: "Toggle nested theme" }).click();
	await trigger.click();
	await expect(mounts).toHaveText("2");
	await expect(dialog.getByRole("textbox", { name: "Uncontrolled draft" })).toHaveValue("");
	await expect(dialog).toHaveCSS("background-color", "rgb(15, 23, 42)");
	await expect(dialog).toHaveCSS("color-scheme", "dark");
	await dialog.getByRole("button", { name: "Finish" }).click();
	await expect(trigger).toBeFocused();
});

test("global shortcut restores focus to its actual origin", async ({ page }) => {
	await page.goto("/");
	await expect(page.locator(".layout-root")).toHaveAttribute("data-hydrated", "true");
	const origin = page.getByRole("link", { name: "Nais Docs", exact: true });
	await origin.focus();
	await page.keyboard.press("ControlOrMeta+k");
	const input = page.getByRole("dialog").getByRole("searchbox");
	await expect(input).toBeFocused();
	await origin.focus();
	await expect(input).toBeFocused();
	await page.keyboard.press("Escape");
	await expect(origin).toBeFocused();
});

test("local buttons and code controls keep host typography and dimensions", async ({ page }) => {
	await page.goto("/404.html");
	const buttons = page.locator(".sh-button");
	await expect(buttons).toHaveCount(2);
	for (const button of await buttons.all()) {
		await expect(button).toHaveCSS("font-size", "16px");
		await expect(button).toHaveCSS("padding", "8px 16px");
		await expect(button).toHaveCSS("border-radius", "8px");
		await expect(button).toHaveCSS("height", "42px");
	}
	await page.goto("/tutorials/hello-nais/");
	const copy = page.getByRole("button", { name: "Copy to clipboard", exact: true }).first();
	await expect(copy).toHaveCSS("font-family", '"Source Sans 3", system-ui, sans-serif');
	await expect(copy).toHaveCSS("padding", "6px");
	await expect(copy).toHaveCSS("border-radius", "8px");
});
