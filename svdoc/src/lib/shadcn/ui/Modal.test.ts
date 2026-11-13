import { createRawSnippet } from "svelte";
import { render } from "svelte/server";
import { expect, test } from "vitest";
import Modal from "./Modal.svelte";

test.each([false, true])("renders the packaged modal on the server with open=%s", async (open) => {
	const children = createRawSnippet(() => ({
		render: () => "<p>Search results</p>",
	}));
	const { body } = await render(Modal, {
		props: { open, title: "Search documentation", children },
	});
	expect(body).toContain("<span");
	expect(body).not.toContain('role="dialog"');
	expect(body).not.toContain("Search results");
});
