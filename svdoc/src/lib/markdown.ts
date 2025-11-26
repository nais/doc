import emojiNameMap from "emoji-name-map";
import fm from "front-matter";
import { Marked, type Token, type Tokens, type TokensList } from "marked";
import { highlightCodeDual, parseHighlightLines, parseTitle } from "./helpers/shiki";
import { processTemplates } from "./helpers/templates";

/**
 * Admonition token for Material for MkDocs style admonitions
 * Syntax: !!! type "title" or ??? type "title" (collapsible) or ???+ type "title" (collapsible, open)
 */
export interface AdmonitionToken {
	type: "admonition";
	raw: string;
	admonitionType: string;
	title: string;
	collapsible: boolean;
	open: boolean;
	tokens: Token[];
}

/**
 * Content tabs token for Material for MkDocs style tabs
 * Syntax: === "Tab Title"
 */
export interface ContentTabToken {
	type: "content_tab";
	raw: string;
	label: string;
	tokens: Token[];
}

export interface ContentTabsToken {
	type: "content_tabs";
	raw: string;
	tabs: ContentTabToken[];
}

export interface Attributes {
	title?: string;
	description?: string;
	tags?: string[];
	hide?: string[];
}

/**
 * Footnote reference token (inline [^1])
 */
export interface FootnoteRefToken {
	type: "footnoteRef";
	raw: string;
	id: string;
	label: string;
}

/**
 * Footnote definition token ([^1]: content)
 */
export interface FootnoteToken {
	type: "footnote";
	raw: string;
	id: string;
	label: string;
	tokens: Token[];
}

/**
 * Create a configured Marked instance with all extensions
 */
function createMarkedInstance(): Marked {
	const marked = new Marked({ gfm: true });

	// Add emoji extension
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
					const tabRule = /^===\s+"([^"]+)"\s*\n((?:(?:    |\t).*(?:\n|$)|\s*\n)*)/;

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
							.map((line) => line.replace(/^(?:    |\t)/, ""))
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
					const rule =
						/^([!?]{3})(\+)?\s+(\w+)(?:\s+"([^"]*)")?\s*\n((?:(?:    |\t).*(?:\n|$)|\s*\n)*)/;
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
							.map((line) => line.replace(/^(?:    |\t)/, ""))
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
								// Found the matching closing tag
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

	// Separate footnotes from other tokens
	for (const token of tokens) {
		if (token.type === "footnote") {
			footnotes.push(token as FootnoteToken);
		} else {
			result.push(token);
		}
	}

	// If there are footnotes, add them at the end wrapped in a container
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
	const processedTokens = await processCodeBlocks(footnotesProcessed);

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
