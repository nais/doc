import { Marked, type Tokens } from "marked";
import { render } from "svelte/server";
import { describe, expect, test } from "vitest";
import Admonition from "./Admonition.svelte";
import List from "./List.svelte";
import Table from "./Table.svelte";
import Heading from "./Heading.svelte";
import { extractHeadingsFromTokens } from "../helpers/markdown-utils.ts";

const marked = new Marked();

describe("native Markdown elements", () => {
	test.each([
		[
			"Implements `readiness` and `liveness` endpoints",
			"implements-readiness-and-liveness-endpoints",
		],
		["Validate token in `Authorization` header", "validate-token-in-authorization-header"],
		["Setting `app.version`", "setting-appversion"],
	])("includes inline code in heading anchors: %s", async (text, id) => {
		const tokens = marked.lexer(`## ${text}`);
		const token = tokens[0] as Tokens.Heading;
		const { body } = await render(Heading, { props: { token } });
		expect(body).toContain(`id="${id}"`);
		expect(extractHeadingsFromTokens(tokens)).toEqual([
			{ text: text.replaceAll("`", ""), id, level: 2 },
		]);
	});

	test.each([0, 3])("preserves lists starting at %i and nested lists", async (start) => {
		const token = marked.lexer(
			`${start}. First\n   - Nested\n${start + 1}. Second`,
		)[0] as Tokens.List;
		const { body } = await render(List, { props: { token } });
		expect(body).toMatch(new RegExp(`<ol[^>]*start="${start}"`));
		expect(body).toMatch(/<ul[\s>]/);
		expect(body.match(/<li[\s>]/g)).toHaveLength(3);
		expect(body).toContain("Nested");
	});

	test("renders table header semantics and column alignment", async () => {
		const token = marked.lexer("| Left | Right |\n| :--- | ---: |\n| A | B |")[0] as Tokens.Table;
		const { body } = await render(Table, { props: { token } });
		expect(body).toContain("<thead");
		expect(body).toMatch(/<th[^>]*scope="col"/);
		expect(body).toMatch(/<td[^>]*text-align:\s*right/);
		expect(body).toContain("B");
	});

	test("keeps collapsible warning content available without JavaScript", async () => {
		const { body } = await render(Admonition, {
			props: {
				token: {
					admonitionType: "warning",
					title: "Warning",
					collapsible: true,
					open: false,
					tokens: marked.lexer("Keep this content visible on the server."),
				},
			},
		});
		expect(body).toMatch(/<details[^>]*tone-warning[^>]*open/);
		expect(body).toContain("<summary");
		expect(body).toContain("Keep this content visible on the server.");
	});
});
