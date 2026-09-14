import type { Token, Tokens, TokensList } from "marked";
import { markdownAlternativeUrl, withBase } from "./helpers/urls";
import type {
	AdmonitionToken,
	AnnotatedCodeToken,
	Attributes,
	ContentTabToken,
	ContentTabsToken,
	DefinitionListItemToken,
	DefinitionListToken,
	DefinitionToken,
	FootnoteToken,
} from "./types/tokens";

export interface LlmsDocument {
	urlPath: string;
	title: string;
	description?: string;
	summary?: string;
	hide: string[];
	hiddenFromNavigation?: boolean;
	tokens: Token[] | TokensList;
	attributes: Attributes;
}

export interface LlmsSection {
	name: string;
	pages: LlmsDocument[];
}

export const MARKDOWN_RESPONSE_HEADERS = {
	"Cache-Control": "public, max-age=3600",
	"Content-Type": "text/markdown; charset=utf-8",
};

type FootnoteReferenceToken = Tokens.Generic & { label: string; id: string };
type FootnotesToken = Tokens.Generic & { items: FootnoteToken[] };
type HtmlWithMarkdownToken = Tokens.Generic & {
	openTag: string;
	closeTag: string;
	innerTokens: Token[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function isToken(value: unknown): value is Token {
	return isRecord(value) && typeof value.type === "string" && typeof value.raw === "string";
}

function isTokenArray(value: unknown): value is Token[] {
	return Array.isArray(value) && value.every(isToken);
}

function isTokenMatrix(value: unknown): value is Token[][] {
	return Array.isArray(value) && value.every(isTokenArray);
}

function isAdmonitionToken(token: Token): token is AdmonitionToken {
	if (!isRecord(token)) return false;
	return (
		token.type === "admonition" &&
		typeof token.admonitionType === "string" &&
		typeof token.title === "string" &&
		typeof token.collapsible === "boolean" &&
		typeof token.open === "boolean" &&
		isTokenArray(token.tokens)
	);
}

function isContentTabsToken(token: Token): token is ContentTabsToken {
	if (!isRecord(token)) return false;
	return (
		token.type === "content_tabs" && Array.isArray(token.tabs) && token.tabs.every(isContentTab)
	);
}

function isContentTab(value: unknown): value is ContentTabToken {
	if (!isRecord(value)) return false;
	return (
		value.type === "content_tab" && typeof value.label === "string" && isTokenArray(value.tokens)
	);
}

function isContentTabToken(token: Token): token is ContentTabToken {
	return isContentTab(token);
}

function isDefinitionToken(value: unknown): value is DefinitionToken {
	return isRecord(value) && value.type === "definition" && isTokenArray(value.tokens);
}

function isDefinitionListItem(value: unknown): value is DefinitionListItemToken {
	return (
		isRecord(value) &&
		value.type === "def_list_item" &&
		isTokenArray(value.termTokens) &&
		Array.isArray(value.definitions) &&
		value.definitions.every(isDefinitionToken)
	);
}

function isDefinitionListToken(token: Token): token is DefinitionListToken {
	if (!isRecord(token)) return false;
	return (
		token.type === "def_list" &&
		Array.isArray(token.items) &&
		token.items.every(isDefinitionListItem)
	);
}

function isDefinitionListItemToken(token: Token): token is DefinitionListItemToken {
	return isDefinitionListItem(token);
}

function isFootnote(value: unknown): value is FootnoteToken {
	if (!isRecord(value)) return false;
	return (
		value.type === "footnote" &&
		typeof value.id === "string" &&
		typeof value.label === "string" &&
		isTokenArray(value.tokens)
	);
}

function isFootnoteToken(token: Token): token is FootnoteToken {
	return isFootnote(token);
}

function isFootnoteReferenceToken(token: Token): token is FootnoteReferenceToken {
	if (!isRecord(token)) return false;
	return (
		token.type === "footnoteRef" && typeof token.label === "string" && typeof token.id === "string"
	);
}

function isFootnotesToken(token: Token): token is FootnotesToken {
	if (!isRecord(token)) return false;
	return token.type === "footnotes" && Array.isArray(token.items) && token.items.every(isFootnote);
}

function isHtmlWithMarkdownToken(token: Token): token is HtmlWithMarkdownToken {
	if (!isRecord(token)) return false;
	return (
		token.type === "html_with_markdown" &&
		typeof token.openTag === "string" &&
		typeof token.closeTag === "string" &&
		isTokenArray(token.innerTokens)
	);
}

function isBlockquoteToken(token: Token): token is Tokens.Blockquote {
	return isRecord(token) && token.type === "blockquote" && isTokenArray(token.tokens);
}

function isCheckboxToken(token: Token): token is Tokens.Checkbox {
	return isRecord(token) && token.type === "checkbox" && typeof token.checked === "boolean";
}

function isCodeToken(token: Token): token is Tokens.Code {
	return (
		isRecord(token) &&
		token.type === "code" &&
		typeof token.text === "string" &&
		(token.lang === undefined || typeof token.lang === "string")
	);
}

function isCodespanToken(token: Token): token is Tokens.Codespan {
	return isRecord(token) && token.type === "codespan" && typeof token.text === "string";
}

function isDelimitedToken(
	token: Token,
	type: "del" | "em" | "strong",
): token is Tokens.Del | Tokens.Em | Tokens.Strong {
	return isRecord(token) && token.type === type && isTokenArray(token.tokens);
}

function isTextToken(token: Token): token is Tokens.Escape | Tokens.Text {
	return (
		isRecord(token) &&
		(token.type === "escape" || token.type === "text") &&
		typeof token.text === "string"
	);
}

function isHeadingToken(token: Token): token is Tokens.Heading {
	return (
		isRecord(token) &&
		token.type === "heading" &&
		typeof token.depth === "number" &&
		isTokenArray(token.tokens)
	);
}

function isHtmlToken(token: Token): token is Tokens.HTML {
	return (
		isRecord(token) &&
		token.type === "html" &&
		typeof token.text === "string" &&
		typeof token.block === "boolean"
	);
}

function isImageToken(token: Token): token is Tokens.Image {
	return (
		isRecord(token) &&
		token.type === "image" &&
		typeof token.href === "string" &&
		(token.title === null || typeof token.title === "string") &&
		typeof token.text === "string"
	);
}

function isLinkToken(token: Token): token is Tokens.Link {
	return (
		isRecord(token) &&
		token.type === "link" &&
		typeof token.href === "string" &&
		(token.title === undefined || token.title === null || typeof token.title === "string") &&
		isTokenArray(token.tokens)
	);
}

function isListItemToken(token: Token): token is Tokens.ListItem {
	return isRecord(token) && token.type === "list_item" && isTokenArray(token.tokens);
}

function isListToken(token: Token): token is Tokens.List {
	return (
		isRecord(token) &&
		token.type === "list" &&
		typeof token.ordered === "boolean" &&
		(typeof token.start === "number" || token.start === "") &&
		Array.isArray(token.items) &&
		token.items.every(isListItemToken)
	);
}

function isParagraphToken(token: Token): token is Tokens.Paragraph {
	return isRecord(token) && token.type === "paragraph" && isTokenArray(token.tokens);
}

function isTableCell(value: unknown): value is Tokens.TableCell {
	return isRecord(value) && isTokenArray(value.tokens);
}

function isTableToken(token: Token): token is Tokens.Table {
	return (
		isRecord(token) &&
		token.type === "table" &&
		Array.isArray(token.align) &&
		token.align.every(
			(align: unknown) =>
				align === null || align === "left" || align === "right" || align === "center",
		) &&
		Array.isArray(token.header) &&
		token.header.every(isTableCell) &&
		Array.isArray(token.rows) &&
		token.rows.every((row: unknown) => Array.isArray(row) && row.every(isTableCell))
	);
}

function escapeLinkTitle(title: string): string {
	return title.replaceAll('"', '\\"');
}

function isAnnotatedCodeToken(token: Tokens.Code): token is AnnotatedCodeToken {
	return !("annotations" in token) || (isRecord(token) && isTokenMatrix(token.annotations));
}

function serializeInline(tokens: Token[]): string {
	return tokens.map(serializeToken).join("").trim();
}

function indent(text: string, prefix: string): string {
	return text
		.split("\n")
		.map((line) => (line ? `${prefix}${line}` : line))
		.join("\n");
}

function serializeCode(token: Tokens.Code): string {
	const fence = token.text.includes("```") ? "~~~" : "```";
	const language = token.lang?.split(/\s+/, 1)[0] ?? "";
	return `${fence}${language}\n${token.text}\n${fence}\n\n`;
}

function serializeCodeAnnotations(token: AnnotatedCodeToken): string {
	if (!token.annotations || token.annotations.length === 0) return "";
	return (
		token.annotations
			.map((annotation, index) => `${index + 1}. ${serializeTokens(annotation).trim()}`)
			.join("\n") + "\n\n"
	);
}

function serializeList(token: Tokens.List): string {
	return (
		token.items
			.map((item, index) => {
				const marker = token.ordered ? `${Number(token.start || 1) + index}.` : "-";
				const content = serializeTokens(item.tokens).trim();
				return `${marker} ${indent(content, "  ").trimStart()}`;
			})
			.join("\n") + "\n\n"
	);
}

function serializeTable(token: Tokens.Table): string {
	const cell = (value: Tokens.TableCell) =>
		serializeInline(value.tokens).replaceAll("|", "\\|").replaceAll("\n", "<br>");
	const header = token.header.map(cell);
	const alignment = token.align.map((align) => {
		if (align === "left") return ":---";
		if (align === "right") return "---:";
		if (align === "center") return ":---:";
		return "---";
	});
	const rows = token.rows.map((row) => row.map(cell));
	return [
		`| ${header.join(" | ")} |`,
		`| ${alignment.join(" | ")} |`,
		...rows.map((row) => `| ${row.join(" | ")} |`),
		"",
		"",
	].join("\n");
}

function serializeAdmonition(token: AdmonitionToken): string {
	const title = token.title || token.admonitionType;
	const content = serializeTokens(token.tokens).trim();
	return `> **${title}**\n${indent(content, "> ")}\n\n`;
}

function serializeContentTabs(token: ContentTabsToken): string {
	return (
		token.tabs
			.map((tab) => `**${tab.label}**\n\n${serializeTokens(tab.tokens).trim()}`)
			.join("\n\n") + "\n\n"
	);
}

function serializeContentTab(token: ContentTabToken): string {
	return `**${token.label}**\n\n${serializeTokens(token.tokens).trim()}\n\n`;
}

function serializeDefinitionListItem(token: DefinitionListItemToken): string {
	const term = serializeInline(token.termTokens);
	const definitions = token.definitions
		.map((definition) => serializeTokens(definition.tokens).trim())
		.join("\n\n");
	return `- **${term}**: ${indent(definitions, "  ").trimStart()}\n\n`;
}

function serializeDefinitionList(token: DefinitionListToken): string {
	return token.items.map((item) => serializeDefinitionListItem(item).trim()).join("\n") + "\n\n";
}

function serializeTokens(tokens: Token[]): string {
	return tokens.map(serializeToken).join("");
}

function isPresentationWrapper(openTag: string): boolean {
	const tag = openTag.trimStart().toLowerCase();
	return tag.startsWith("<div") || tag.startsWith("<center");
}

function serializeToken(token: Token): string {
	if (isAdmonitionToken(token)) return serializeAdmonition(token);
	if (isContentTabsToken(token)) return serializeContentTabs(token);
	if (isContentTabToken(token)) return serializeContentTab(token);
	if (isDefinitionListToken(token)) return serializeDefinitionList(token);
	if (isDefinitionListItemToken(token)) return serializeDefinitionListItem(token);
	if (isDefinitionToken(token)) return serializeTokens(token.tokens);
	if (isFootnoteToken(token)) {
		return `[^${token.label}]: ${serializeTokens(token.tokens).trim()}\n\n`;
	}
	if (isFootnoteReferenceToken(token)) return `[^${token.label}]`;
	if (isFootnotesToken(token)) {
		return (
			token.items
				.map((item) => `[^${item.label}]: ${serializeTokens(item.tokens).trim()}`)
				.join("\n") + "\n\n"
		);
	}
	if (isHtmlWithMarkdownToken(token)) {
		if (isPresentationWrapper(token.openTag)) {
			return `${serializeTokens(token.innerTokens).trim()}\n\n`;
		}
		return `${token.openTag}\n${serializeTokens(token.innerTokens).trim()}\n${token.closeTag}\n\n`;
	}

	if (isBlockquoteToken(token)) {
		return `${indent(serializeTokens(token.tokens).trim(), "> ")}\n\n`;
	}
	if (token.type === "br") return "  \n";
	if (isCheckboxToken(token)) return token.checked ? "[x] " : "[ ] ";
	if (isCodeToken(token)) {
		return isAnnotatedCodeToken(token)
			? `${serializeCode(token)}${serializeCodeAnnotations(token)}`
			: serializeCode(token);
	}
	if (isCodespanToken(token)) return `\`${token.text}\``;
	if (token.type === "def" || token.type === "space") return "";
	if (isDelimitedToken(token, "del")) return `~~${serializeInline(token.tokens)}~~`;
	if (isDelimitedToken(token, "em")) return `*${serializeInline(token.tokens)}*`;
	if (isTextToken(token)) {
		return "tokens" in token && isTokenArray(token.tokens)
			? serializeTokens(token.tokens)
			: token.text;
	}
	if (isHeadingToken(token))
		return `${"#".repeat(token.depth)} ${serializeInline(token.tokens)}\n\n`;
	if (token.type === "hr") return "---\n\n";
	if (isHtmlToken(token)) return token.block ? `${token.text}\n\n` : token.text;
	if (isImageToken(token)) {
		const title = token.title ? ` "${escapeLinkTitle(token.title)}"` : "";
		return `![${token.text}](${token.href}${title})`;
	}
	if (isLinkToken(token)) {
		const title = token.title ? ` "${escapeLinkTitle(token.title)}"` : "";
		return `[${serializeInline(token.tokens)}](${markdownAlternativeUrl(token.href)}${title})`;
	}
	if (isListToken(token)) return serializeList(token);
	if (isListItemToken(token)) return serializeTokens(token.tokens);
	if (isParagraphToken(token)) return `${serializeInline(token.tokens)}\n\n`;
	if (isDelimitedToken(token, "strong")) return `**${serializeInline(token.tokens)}**`;
	if (isTableToken(token)) return serializeTable(token);

	// A new token must be represented deliberately rather than silently
	// discarded. Marked's generic extension token type carries `raw`.
	return token.raw;
}

/**
 * Serialize processed Marked tokens into portable Markdown. Templates,
 * includes, link normalization, and custom block parsing have already run
 * when the content store supplies these tokens.
 */
export function serializeMarkdown(tokens: Token[] | TokensList): string {
	return `${serializeTokens(tokens)
		.replace(/\n{3,}/g, "\n\n")
		.trim()}\n`;
}

export function markdownPath(urlPath: string): string {
	return markdownAlternativeUrl(withBase(urlPath));
}

function compareCuratedPages(a: LlmsDocument, b: LlmsDocument): number {
	const aOrder = a.attributes.llms?.order ?? Number.POSITIVE_INFINITY;
	const bOrder = b.attributes.llms?.order ?? Number.POSITIVE_INFINITY;
	return aOrder - bOrder || a.urlPath.localeCompare(b.urlPath);
}

/**
 * Group explicitly curated pages by section. A section's position is the
 * lowest global order of any page it contains; ties are deterministic.
 */
export function curateLlmsSections(documents: LlmsDocument[]): LlmsSection[] {
	const pages = documents.filter((document) => {
		const metadata = document.attributes.llms;
		return (
			metadata !== undefined && metadata.section.trim() !== "" && Number.isFinite(metadata.order)
		);
	});
	const sections = new Map<string, LlmsDocument[]>();
	for (const page of pages) {
		const metadata = page.attributes.llms;
		if (!metadata) continue;
		const section = metadata.section;
		sections.set(section, [...(sections.get(section) ?? []), page]);
	}

	return [...sections.entries()]
		.map(([name, sectionPages]) => ({
			name,
			pages: sectionPages.sort(compareCuratedPages),
		}))
		.sort((a, b) => compareCuratedPages(a.pages[0], b.pages[0]) || a.name.localeCompare(b.name));
}

function pageDescription(page: LlmsDocument): string | undefined {
	return (page.description ?? page.summary)?.replace(/\s+/g, " ").trim();
}

export function formatLlmsIndex(documents: LlmsDocument[]): string {
	const sections = curateLlmsSections(documents);
	const lines = [
		"# Nais Developer Documentation",
		"",
		"> Documentation for Nais, the application platform for developing and running services safely.",
		"",
	];

	for (const section of sections) {
		lines.push(`## ${section.name}`, "");
		for (const page of section.pages) {
			const description = pageDescription(page);
			lines.push(
				`- [${page.title}](${markdownPath(page.urlPath)})${description ? `: ${description}` : ""}`,
			);
		}
		lines.push("");
	}

	lines.push(
		"## Complete documentation",
		"",
		`For every visible documentation page, see [the full documentation](${withBase("/llms-full.txt")}).`,
		"",
	);
	return lines.join("\n");
}

export function formatLlmsFull(documents: LlmsDocument[]): string {
	const lines = [
		"# Nais Developer Documentation — Full documentation",
		"",
		"> All navigation-visible Nais documentation for this tenant, in site navigation order.",
		"",
	];

	for (const document of documents) {
		const canonical = withBase(document.urlPath === "/" ? "/" : `${document.urlPath}/`);
		lines.push(
			`## ${document.title}`,
			"",
			`Source: [${markdownPath(document.urlPath)}](${markdownPath(document.urlPath)})`,
			"",
			`Canonical: [${canonical}](${canonical})`,
			"",
			serializeMarkdown(document.tokens).trim(),
			"",
			"---",
			"",
		);
	}

	return lines.join("\n");
}
