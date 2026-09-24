import { describe, expect, test } from "bun:test";
import type { Tokens } from "marked";
import { orderLlmsFullDocuments, type NavItem } from "./content-store";
import {
	curateLlmsSections,
	formatLlmsFull,
	formatLlmsIndex,
	MARKDOWN_RESPONSE_HEADERS,
	markdownPath,
	serializeMarkdown,
	type LlmsDocument,
} from "./llms";
import type { AdmonitionToken, AnnotatedCodeToken, ContentTabsToken } from "./types/tokens";

function text(value: string): Tokens.Text {
	return { type: "text", raw: value, text: value };
}

function page(
	urlPath: string,
	title: string,
	options: {
		description?: string;
		summary?: string;
		hide?: string[];
		hiddenFromNavigation?: boolean;
		section?: string;
		order?: number;
	} = {},
): LlmsDocument {
	return {
		urlPath,
		title,
		description: options.description,
		summary: options.summary,
		hide: options.hide ?? [],
		hiddenFromNavigation: options.hiddenFromNavigation,
		tokens: [],
		attributes:
			options.section === undefined || options.order === undefined
				? {}
				: { llms: { section: options.section, order: options.order } },
	};
}

describe("serializeMarkdown", () => {
	test("uses index.md for the root README", () => {
		expect(markdownPath("/")).toBe("/index.md");
	});

	test("keeps generated tag routes on their HTML URLs", () => {
		expect(markdownPath("/tags/how-to")).toBe("/tags/how-to");
	});

	test("rewrites documentation links while preserving anchors and image assets", () => {
		const link: Tokens.Link = {
			type: "link",
			raw: "[Application](/workloads/application/#ingresses)",
			href: "/workloads/application/#ingresses",
			text: "Application",
			tokens: [text("Application")],
		};
		const image: Tokens.Image = {
			type: "image",
			raw: "![Logo](/assets/logo.svg)",
			href: "/assets/logo.svg",
			title: null,
			text: "Logo",
			tokens: [],
		};
		const asset: Tokens.Link = {
			type: "link",
			raw: "[Download](/assets/guide.pdf)",
			href: "/assets/guide.pdf",
			text: "Download",
			tokens: [text("Download")],
		};

		expect(
			serializeMarkdown([
				{
					type: "paragraph",
					raw: "",
					text: "",
					tokens: [link, text(" "), image, text(" "), asset],
				},
			]),
		).toBe(
			"[Application](/workloads/application.md#ingresses) ![Logo](/assets/logo.svg) [Download](/assets/guide.pdf)\n",
		);
	});

	test("rewrites links nested in block text tokens", () => {
		const link: Tokens.Link = {
			type: "link",
			raw: "[Application](workloads/application.md)",
			href: "/workloads/application/",
			text: "Application",
			tokens: [text("Application")],
		};
		const blockText: Tokens.Text = {
			type: "text",
			raw: "[Application](workloads/application.md)",
			text: "[Application](workloads/application.md)",
			tokens: [link],
		};

		expect(
			serializeMarkdown([
				{
					type: "list",
					raw: "",
					ordered: false,
					start: "",
					loose: false,
					items: [
						{
							type: "list_item",
							raw: "",
							task: false,
							loose: false,
							text: "",
							tokens: [blockText],
						},
					],
				},
			]),
		).toBe("- [Application](/workloads/application.md)\n");
	});

	test("preserves code and converts admonitions and tabs to portable Markdown", () => {
		const code: AnnotatedCodeToken = {
			type: "code",
			raw: "```yaml\nkey: value\n```",
			lang: 'yaml title="app.yaml"',
			text: "key: value",
			annotations: [
				[{ type: "paragraph", raw: "", text: "", tokens: [text("This value matters.")] }],
			],
		};
		const admonition: AdmonitionToken = {
			type: "admonition",
			raw: "",
			admonitionType: "note",
			title: "Important",
			collapsible: true,
			open: true,
			tokens: [{ type: "paragraph", raw: "", text: "", tokens: [text("Read this.")] }],
		};
		const tabs: ContentTabsToken = {
			type: "content_tabs",
			raw: "",
			tabs: [
				{
					type: "content_tab",
					raw: "",
					label: "CLI",
					tokens: [{ type: "paragraph", raw: "", text: "", tokens: [text("Run it.")] }],
				},
				{
					type: "content_tab",
					raw: "",
					label: "Web",
					tokens: [{ type: "paragraph", raw: "", text: "", tokens: [text("Open it.")] }],
				},
			],
		};

		expect(serializeMarkdown([code, admonition, tabs])).toBe(
			"```yaml\nkey: value\n```\n\n1. This value matters.\n\n> **Important**\n> Read this.\n\n**CLI**\n\nRun it.\n\n**Web**\n\nOpen it.\n",
		);
	});

	test("keeps useful HTML blocks and inline HTML", () => {
		const block: Tokens.HTML = {
			type: "html",
			raw: "<details>...",
			pre: false,
			text: "<details><summary>More</summary></details>",
			block: true,
		};
		const inline: Tokens.HTML = {
			type: "html",
			raw: "<small>Note</small>",
			pre: false,
			text: "<small>Note</small>",
			block: false,
		};

		expect(
			serializeMarkdown([
				block,
				{
					type: "paragraph",
					raw: "",
					text: "",
					tokens: [text("A "), inline],
				},
			]),
		).toBe("<details><summary>More</summary></details>\n\nA <small>Note</small>\n");
	});
});

describe("llms.txt curation", () => {
	test("groups sections by first global order and falls back to summaries", () => {
		const pages = [
			page("/logs", "Logs", {
				section: "Observe",
				order: 30,
				summary: "Inspect application logs.",
			}),
			page("/start", "Start", { section: "Core", order: 10, description: "Start here." }),
			page("/metrics", "Metrics", {
				section: "Observe",
				order: 20,
				description: "Measure services.",
			}),
		];

		expect(
			curateLlmsSections(pages).map((section) => [
				section.name,
				section.pages.map((item) => item.title),
			]),
		).toEqual([
			["Core", ["Start"]],
			["Observe", ["Metrics", "Logs"]],
		]);
		expect(formatLlmsIndex(pages)).toContain("- [Logs](/logs.md): Inspect application logs.");
	});

	test("collapses description whitespace to one line", () => {
		const pages = [
			page("/start", "Start", {
				section: "Core",
				order: 10,
				summary: "Start here.\nThen deploy.",
			}),
		];

		expect(formatLlmsIndex(pages)).toContain("- [Start](/start.md): Start here. Then deploy.");
	});
});

describe("llms-full.txt ordering", () => {
	test("follows navigation, excludes hidden pages, and appends unlisted pages deterministically", () => {
		const pages = [
			page("/z-unlisted", "Z"),
			page("/visible", "Visible"),
			page("/hidden", "Hidden", { hide: ["navigation"] }),
			page("/partial", "Partial", { hiddenFromNavigation: true }),
			page("/a-unlisted", "A"),
		];
		const navigation: NavItem[] = [
			{ title: "Visible", href: "/visible", hasContent: true },
			{ title: "Hidden", href: "/hidden", hasContent: true },
		];

		const ordered = orderLlmsFullDocuments(pages, navigation);
		expect(ordered.map((item) => item.title)).toEqual(["Visible", "A", "Z"]);
		expect(formatLlmsFull(ordered)).toContain("Source: [/visible.md](/visible.md)");
	});
});

test("Markdown endpoint responses are prerender-cacheable UTF-8 text", () => {
	expect(MARKDOWN_RESPONSE_HEADERS).toEqual({
		"Cache-Control": "public, max-age=3600",
		"Content-Type": "text/markdown; charset=utf-8",
	});
});
