import emojiNameMap from "emoji-name-map";
import fm from "front-matter";
import { Marked, type Token, type Tokens, type TokensList } from "marked";
import { highlightCodeDual, parseHighlightLines, parseTitle } from "./helpers/shiki";
import { processTemplates } from "./helpers/templates";
import type {
	AdmonitionToken,
	Attributes,
	ContentTabsToken,
	ContentTabToken,
	FootnoteToken,
	HighlightedCodeToken,
} from "./types/tokens";

// Re-export Attributes for external use
export type { Attributes } from "./types/tokens";

/**
 * Create a configured Marked instance with all extensions
 */
function createMarkedInstance(): Marked {
	const marked = new Marked({ gfm: true });

	marked.use({
		extensions: [
			// Content tabs extension for Material for MkDocs syntax
			{
				name: "content_tabs",
				level: "block",
				start(src) {
					const match = src.match(/^===\s+"/m);
					return match ? match.index : undefined;
				},
				tokenizer(src) {
					// Match consecutive === "Tab Title" blocks
					// Each tab's content is indented by 4 spaces
					const tabRule = /^===\s+"([^"]+)"\s*\n((?:(?: {4}|\t).*(?:\n|$)|\s*\n)*)/;

					let remaining = src;
					let fullRaw = "";
					const tabs: ContentTabToken[] = [];

					// Keep matching consecutive tabs
					let match = tabRule.exec(remaining);
					while (match) {
						const label = match[1];
						const rawContent = match[2];

						// Remove 4-space or tab indent from content
						const content = rawContent
							.split("\n")
							.map((line) => line.replace(/^(?: {4}|\t)/, ""))
							.join("\n")
							.trim();

						const tabToken: ContentTabToken = {
							type: "content_tab",
							raw: match[0],
							label,
							tokens: [],
						};

						// Parse the content as markdown
						this.lexer.blockTokens(content, tabToken.tokens);

						tabs.push(tabToken);
						fullRaw += match[0];
						remaining = remaining.slice(match[0].length);

						// Check if next content is another tab
						match = tabRule.exec(remaining);
					}

					// Only return if we found at least one tab
					if (tabs.length > 0) {
						return {
							type: "content_tabs",
							raw: fullRaw,
							tabs,
						} as ContentTabsToken;
					}

					return undefined;
				},
			},
			// Admonition extension for Material for MkDocs syntax
			{
				name: "admonition",
				level: "block",
				start(src) {
					const match = src.match(/^[!?]{3}/m);
					return match ? match.index : undefined;
				},
				tokenizer(src) {
					// Match !!! type "title", ??? type "title", or ???+ type "title"
					// Content is indented by 4 spaces
					// Type can include hyphens (e.g., gcp-only)
					const rule =
						/^([!?]{3})(\+)?\s+([\w-]+)(?:\s+"([^"]*)")?\s*\n((?:(?: {4}|\t).*(?:\n|$)|\s*\n)*)/;
					const match = rule.exec(src);

					if (match) {
						const marker = match[1];
						const plusSign = match[2];
						const admonitionType = match[3];
						const title =
							match[4] || admonitionType.charAt(0).toUpperCase() + admonitionType.slice(1);
						const rawContent = match[5];

						// Remove 4-space or tab indent from content
						const content = rawContent
							.split("\n")
							.map((line) => line.replace(/^(?: {4}|\t)/, ""))
							.join("\n")
							.trim();

						const token: AdmonitionToken = {
							type: "admonition",
							raw: match[0],
							admonitionType: admonitionType.toLowerCase(),
							title,
							collapsible: marker === "???",
							open: marker === "!!!" || plusSign === "+",
							tokens: [],
						};

						// Parse the content as markdown
						this.lexer.blockTokens(content, token.tokens);

						return token;
					}

					return undefined;
				},
			},
			// Emoji extension
			{
				name: "emoji",
				level: "inline",
				start(src) {
					return src.indexOf(":");
				},
				tokenizer(src) {
					const match = /^:([a-zA-Z0-9_+-]+):/.exec(src);
					if (match) {
						const emoji = emojiNameMap.get(match[1]);
						if (emoji) {
							return {
								type: "text",
								raw: match[0],
								text: emoji,
							};
						}
					}
					return undefined;
				},
			},
			// Footnote reference [^1]
			{
				name: "footnoteRef",
				level: "inline",
				start(src) {
					return src.indexOf("[^");
				},
				tokenizer(src) {
					const match = /^\[\^([^\]]+)\](?!:)/.exec(src);
					if (match) {
						return {
							type: "footnoteRef",
							raw: match[0],
							id: match[1],
							label: match[1],
						};
					}
					return undefined;
				},
			},
			// Footnote definition [^1]: content
			{
				name: "footnote",
				level: "block",
				start(src) {
					return src.indexOf("[^");
				},
				tokenizer(src) {
					const match = /^\[\^([^\]]+)\]:\s*([\s\S]*?)(?=\n\[\^|\n\n(?!\s)|\n*$)/.exec(src);
					if (match) {
						const id = match[1];
						const content = match[2].trim();
						const token: FootnoteToken = {
							type: "footnote",
							raw: match[0],
							id,
							label: id,
							tokens: [],
						};
						// Parse the content as inline tokens
						this.lexer.inline(content, token.tokens);
						return token;
					}
					return undefined;
				},
			},
		],
	});

	return marked;
}

/**
 * Process tokens to handle HTML blocks with markdown attribute.
 * When we encounter an opening tag with markdown attribute, we need to:
 * 1. Find the matching closing tag
 * 2. Keep the inner tokens (already parsed)
 * 3. Combine into a single html_with_markdown token
 */
function processHtmlMarkdownBlocks(tokens: Token[] | TokensList): Token[] | TokensList {
	const result: Token[] = [];
	let i = 0;

	while (i < tokens.length) {
		const token = tokens[i];

		if (token.type === "html" && "text" in token && typeof token.text === "string") {
			// Check if this is an opening tag with markdown attribute
			const openMatch = token.text.match(/^<(\w+)([^>]*)\s+markdown(?:="[^"]*")?([^>]*)>/i);

			if (openMatch) {
				const tagName = openMatch[1];
				const attrsBefore = openMatch[2] || "";
				const attrsAfter = openMatch[3] || "";
				const closingTag = `</${tagName}>`;

				// Clean the opening tag (remove markdown attribute)
				const cleanedOpenTag = `<${tagName}${attrsBefore}${attrsAfter}>`.replace(
					/\s+markdown(?:="[^"]*")?/gi,
					"",
				);

				// Find the matching closing tag
				let depth = 1;
				let j = i + 1;
				const innerTokens: Token[] = [];

				while (j < tokens.length && depth > 0) {
					const innerToken = tokens[j];

					if (
						innerToken.type === "html" &&
						"text" in innerToken &&
						typeof innerToken.text === "string"
					) {
						// Check for opening tags of same type
						const innerOpenMatch = new RegExp(`<${tagName}[^>]*>`, "i").exec(innerToken.text);
						if (innerOpenMatch) {
							depth++;
						}

						// Check for closing tag
						if (innerToken.text.trim().toLowerCase() === closingTag.toLowerCase()) {
							depth--;
							if (depth === 0) {
								break;
							}
						}
					}

					if (depth > 0) {
						innerTokens.push(innerToken);
					}
					j++;
				}

				// Create a combined token with parsed inner content
				result.push({
					type: "html_with_markdown",
					raw: token.raw,
					text: token.text,
					openTag: cleanedOpenTag,
					closeTag: closingTag,
					innerTokens: processHtmlMarkdownBlocks(innerTokens),
				} as Token);

				// Skip to after the closing tag
				i = j + 1;
				continue;
			}
		}

		// For non-matching tokens, just add them (but strip markdown attr from any HTML)
		if (token.type === "html" && "text" in token && typeof token.text === "string") {
			result.push({
				...token,
				text: token.text.replace(/\s+markdown(?:="[^"]*")?/gi, ""),
			});
		} else {
			result.push(token);
		}
		i++;
	}

	return result;
}

/**
 * Collect footnote definitions and move them to the end, wrapped in a footnotes container
 */
function processFootnotes(tokens: Token[] | TokensList): Token[] | TokensList {
	const footnotes: FootnoteToken[] = [];
	const result: Token[] = [];

	for (const token of tokens) {
		if (token.type === "footnote") {
			footnotes.push(token as FootnoteToken);
		} else {
			result.push(token);
		}
	}

	if (footnotes.length > 0) {
		result.push({
			type: "footnotes",
			raw: "",
			items: footnotes,
		} as Token);
	}

	return result;
}

/**
 * Check if a list token is an annotation list (ordered list starting with 1)
 * and extract annotation content by ID
 */
function extractAnnotationList(token: Token): Map<string, Token[]> | null {
	if (token.type !== "list") return null;

	const listToken = token as Tokens.List;
	if (!listToken.ordered || listToken.start !== 1) return null;

	const annotations = new Map<string, Token[]>();

	for (let i = 0; i < listToken.items.length; i++) {
		const item = listToken.items[i];
		const annotationId = String(i + 1);
		annotations.set(annotationId, item.tokens);
	}

	return annotations;
}

/**
 * Process code blocks to add syntax highlighting with Shiki
 * Also handles code annotations by looking for following ordered lists
 */
async function processCodeBlocks(tokens: Token[] | TokensList): Promise<Token[]> {
	const result: Token[] = [];
	let i = 0;

	while (i < tokens.length) {
		const token = tokens[i];

		if (token.type === "code") {
			const codeToken = token as Tokens.Code;
			const langInfo = codeToken.lang || "text";
			const { language } = parseHighlightLines(langInfo);
			const title = parseTitle(langInfo);

			// Skip mermaid blocks - they're handled client-side
			if (language === "mermaid") {
				result.push(token);
				i++;
				continue;
			}

			try {
				const highlighted = await highlightCodeDual(codeToken.text, langInfo);

				// Check if the next token is an annotation list
				let annotationTokens: Map<string, Token[]> | null = null;
				if (highlighted.annotations.length > 0 && i + 1 < tokens.length) {
					// Skip any space tokens
					let nextIdx = i + 1;
					while (nextIdx < tokens.length && tokens[nextIdx].type === "space") {
						nextIdx++;
					}

					if (nextIdx < tokens.length) {
						annotationTokens = extractAnnotationList(tokens[nextIdx]);
						if (annotationTokens) {
							// Skip the annotation list token
							i = nextIdx;
						}
					}
				}

				// Build annotations array with content
				const annotationsWithContent: Array<{
					id: string;
					line: number;
					tokens: Token[];
				}> = [];

				for (const annotation of highlighted.annotations) {
					const content = annotationTokens?.get(annotation.id);
					if (content) {
						annotationsWithContent.push({
							id: annotation.id,
							line: annotation.line,
							tokens: content,
						});
					}
				}

				result.push({
					type: "highlighted_code",
					raw: codeToken.raw,
					text: codeToken.text,
					lang: language,
					lightHtml: highlighted.light,
					darkHtml: highlighted.dark,
					title: title,
					annotations: annotationsWithContent,
				} as Token);
			} catch (err) {
				// Fall back to original token if highlighting fails
				console.warn("Shiki highlighting failed:", err);
				result.push(token);
			}
		} else if ("tokens" in token && Array.isArray(token.tokens)) {
			// Recursively process nested tokens
			const processedNested = await processCodeBlocks(token.tokens);
			result.push({
				...token,
				tokens: processedNested,
			} as Token);
		} else if (token.type === "content_tabs" && "tabs" in token) {
			// Handle content tabs specially
			const tabsToken = token as ContentTabsToken;
			const processedTabs = await Promise.all(
				tabsToken.tabs.map(async (tab) => ({
					...tab,
					tokens: await processCodeBlocks(tab.tokens),
				})),
			);
			result.push({
				...token,
				tabs: processedTabs,
			} as Token);
		} else if (token.type === "list" && "items" in token) {
			// Handle list items
			const listToken = token as Tokens.List;
			const processedItems = await Promise.all(
				listToken.items.map(async (item) => ({
					...item,
					tokens: await processCodeBlocks(item.tokens),
				})),
			);
			result.push({
				...token,
				items: processedItems,
			} as Token);
		} else {
			result.push(token);
		}

		i++;
	}

	return result;
}

/**
 * Transform markdown-style hrefs to clean, absolute URLs
 * - Resolve relative paths based on the current file's directory
 * - Remove .md extension
 * - Remove /README or README suffix (directory index)
 * - Preserve anchors
 *
 * @param href - The href to transform
 * @param basePath - The URL path of the current page (e.g., "/workloads" or "/auth/entra-id")
 * @param isReadme - Whether the source file is a README.md (affects how basePath is treated)
 */
function transformHref(href: string, basePath: string, isReadme: boolean): string {
	// Don't transform external links, protocol links, or anchors-only links
	if (
		href.startsWith("http://") ||
		href.startsWith("https://") ||
		href.startsWith("#") ||
		href.startsWith("mailto:")
	) {
		return href;
	}

	// Split href and anchor
	const [path, anchor] = href.split("#");

	let transformed = path
		// Remove .md extension
		.replace(/\.md$/, "")
		// Remove /README suffix (directory index)
		.replace(/\/README$/i, "")
		// Remove standalone README
		.replace(/^README$/i, "");

	// Resolve relative paths
	if (transformed && !transformed.startsWith("/")) {
		// It's a relative path - resolve it against basePath
		// For README.md files: basePath IS the directory (e.g., "/workloads"), use it directly
		// For other .md files: basePath includes the file (e.g., "/workloads/how-to/access"),
		//   so we need to get the parent directory
		const baseDir = isReadme ? basePath : basePath.replace(/\/[^/]*$/, "") || "/";
		const segments = [...baseDir.split("/").filter(Boolean), ...transformed.split("/")];

		// Resolve . and ..
		const resolved: string[] = [];
		for (const segment of segments) {
			if (segment === "..") {
				resolved.pop();
			} else if (segment !== ".") {
				resolved.push(segment);
			}
		}

		transformed = "/" + resolved.join("/");
	} else if (transformed === "") {
		// Empty path (was just README.md) - use current page path
		transformed = basePath || "/";
	}

	// Re-add anchor if present
	if (anchor) {
		transformed += "#" + anchor;
	}

	return transformed;
}

/**
 * Process all link tokens to transform hrefs
 * Recursively processes nested tokens
 *
 * @param tokens - The tokens to process
 * @param basePath - The URL path of the current page for resolving relative links
 */
function processLinks(
	tokens: Token[] | TokensList,
	basePath: string,
	isReadme: boolean,
): Token[] | TokensList {
	return tokens.map((token) => {
		// Transform link hrefs
		if (token.type === "link") {
			const linkToken = token as Tokens.Link;
			return {
				...linkToken,
				href: transformHref(linkToken.href, basePath, isReadme),
				tokens: linkToken.tokens
					? (processLinks(linkToken.tokens, basePath, isReadme) as Token[])
					: undefined,
			};
		}

		// Transform image hrefs (for local images)
		if (token.type === "image") {
			const imageToken = token as Tokens.Image;
			return {
				...imageToken,
				href: transformHref(imageToken.href, basePath, isReadme),
			};
		}

		// Handle html_with_markdown tokens
		if (token.type === "html_with_markdown" && "innerTokens" in token) {
			return {
				...token,
				innerTokens: processLinks(token.innerTokens as Token[], basePath, isReadme),
			};
		}

		// Handle content_tabs tokens
		if (token.type === "content_tabs" && "tabs" in token) {
			const tabsToken = token as ContentTabsToken;
			return {
				...tabsToken,
				tabs: tabsToken.tabs.map((tab) => ({
					...tab,
					tokens: processLinks(tab.tokens, basePath, isReadme) as Token[],
				})),
			};
		}

		// Handle admonition tokens
		if (token.type === "admonition" && "tokens" in token) {
			return {
				...token,
				tokens: processLinks(token.tokens as Token[], basePath, isReadme),
			};
		}

		// Handle highlighted_code tokens with annotations
		if (token.type === "highlighted_code" && "annotations" in token) {
			const highlightedToken = token as HighlightedCodeToken;
			return {
				...highlightedToken,
				annotations: highlightedToken.annotations.map((annotation) => ({
					...annotation,
					tokens: processLinks(annotation.tokens, basePath, isReadme) as Token[],
				})),
			};
		}

		// Recursively process nested tokens
		if ("tokens" in token && Array.isArray(token.tokens)) {
			return {
				...token,
				tokens: processLinks(token.tokens, basePath, isReadme),
			};
		}

		// Handle list items
		if (token.type === "list" && "items" in token) {
			const listToken = token as Tokens.List;
			return {
				...listToken,
				items: listToken.items.map((item) => ({
					...item,
					tokens: processLinks(item.tokens, basePath, isReadme) as Token[],
				})),
			};
		}

		// Handle table cells
		if (token.type === "table" && "header" in token && "rows" in token) {
			const tableToken = token as Tokens.Table;
			return {
				...tableToken,
				header: tableToken.header.map((cell) => ({
					...cell,
					tokens: processLinks(cell.tokens, basePath, isReadme) as Token[],
				})),
				rows: tableToken.rows.map((row) =>
					row.map((cell) => ({
						...cell,
						tokens: processLinks(cell.tokens, basePath, isReadme) as Token[],
					})),
				),
			};
		}

		return token;
	});
}

/**
 * Convert a file path to a URL path and determine if it's a README
 * e.g., "../docs/workloads/README.md" -> { urlPath: "/workloads", isReadme: true }
 * e.g., "../docs/workloads/how-to/access.md" -> { urlPath: "/workloads/how-to/access", isReadme: false }
 */
function filePathToUrlPath(filePath: string): { urlPath: string; isReadme: boolean } {
	const isReadme = /\/README\.md$/i.test(filePath) || filePath.toLowerCase() === "readme.md";
	const urlPath =
		filePath
			// Remove ../docs prefix
			.replace(/^\.\.\/docs\/?/, "/")
			// Remove .md extension
			.replace(/\.md$/, "")
			// Remove /README suffix
			.replace(/\/README$/i, "")
			// Ensure leading slash
			.replace(/^([^/])/, "/$1") || "/";

	return { urlPath, isReadme };
}

export async function readMarkdownFile(
	path: string,
): Promise<{ tokens: Token[] | TokensList; attributes: Attributes }> {
	const source = await Bun.file(path).text();
	const { attributes, body } = fm<Attributes>(source);

	// Process template variables (<<tenant()>>, <<tenant_url("...")>>, etc.)
	// Pass file path for resolving {% include %} statements
	const processedBody = processTemplates(body, path);

	const marked = createMarkedInstance();
	const tokens = marked.lexer(processedBody);

	// Process HTML blocks with markdown attribute
	const htmlProcessed = processHtmlMarkdownBlocks(tokens);

	// Process footnotes - collect and move to end
	const footnotesProcessed = processFootnotes(htmlProcessed);

	// Process code blocks for syntax highlighting
	const codeProcessed = await processCodeBlocks(footnotesProcessed);

	// Process links to transform .md hrefs to clean, absolute URLs
	const { urlPath, isReadme } = filePathToUrlPath(path);
	const processedTokens = processLinks(codeProcessed, urlPath, isReadme);

	// Extract title from first heading if not in frontmatter
	const finalAttributes = { ...attributes };
	if (!finalAttributes.title) {
		const firstHeading = processedTokens.find(
			(t) => t.type === "heading" && (t as { depth: number }).depth === 1,
		);
		if (firstHeading && "text" in firstHeading) {
			// Strip emoji shortcodes and clean up
			finalAttributes.title = (firstHeading.text as string)
				.replace(/:[a-zA-Z0-9_+-]+:/g, "")
				.trim();
		}
	}

	return { tokens: processedTokens, attributes: finalAttributes };
}
