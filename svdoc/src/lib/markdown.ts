import fm from "front-matter";
import { gemoji } from "gemoji";
import { Marked, type Token, type Tokens, type TokensList } from "marked";
import { getGitInfo } from "./helpers/git";
import { getIconSvg, isIconShortcode } from "./helpers/icons";
import { preHighlightCodeTokens } from "./helpers/shiki";
import { processTemplates } from "./helpers/templates";
import type {
	AdmonitionToken,
	Attributes,
	ContentTabsToken,
	ContentTabToken,
	DefinitionListItemToken,
	DefinitionListToken,
	DefinitionToken,
	FootnoteToken,
} from "./types/tokens";

// Build emoji lookup map from gemoji data
const emojiMap = new Map<string, string>(gemoji.flatMap((e) => e.names.map((n) => [n, e.emoji])));

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
			// Emoji and icon extension
			{
				name: "emoji",
				level: "inline",
				start(src) {
					return src.indexOf(":");
				},
				tokenizer(src) {
					const match = /^:([a-zA-Z0-9_+-]+):/.exec(src);
					if (match) {
						const shortcode = match[1];

						// Try emoji first
						const emoji = emojiMap.get(shortcode);
						if (emoji) {
							return {
								type: "text",
								raw: match[0],
								text: emoji,
							};
						}

						// Try icon (material, octicons, simple, fontawesome)
						if (isIconShortcode(shortcode)) {
							const svg = getIconSvg(shortcode);
							if (svg) {
								return {
									type: "html",
									raw: match[0],
									text: svg,
								};
							}
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
			// Definition list extension for Material for MkDocs syntax
			// Syntax:
			// `term`
			// :   Definition text
			{
				name: "def_list",
				level: "block",
				start(src) {
					// Look for a line followed by :   (colon + 3 spaces)
					// Also match with optional leading space (for content inside list items)
					const match = src.match(/^[^\n]+\n\n? ?: {3}/m);
					return match ? match.index : undefined;
				},
				tokenizer(src) {
					// Match definition list items
					// Term is on its own line (can be inline formatted like `code`)
					// Definition starts with :   (colon + 3 spaces)
					// Multiple definitions can follow the same term
					// Continuation lines are indented with 4 spaces

					const items: DefinitionListItemToken[] = [];
					let remaining = src;
					let fullRaw = "";

					// Pattern for a term followed by one or more definitions
					// Term: any non-empty line
					// Definition: starts with :   (colon + 3 spaces)
					// Also handle optional leading space (for content inside list items after dedent)
					const termPattern = /^([^\n]+)\n\n?(?= ?: {3})/;

					let termMatch = termPattern.exec(remaining);
					while (termMatch) {
						const termRaw = termMatch[0];
						const termText = termMatch[1].trim();

						remaining = remaining.slice(termMatch[0].length);
						let itemRaw = termRaw;

						const definitions: DefinitionToken[] = [];

						// Match all definitions for this term
						// Handle optional leading space (from list item dedentation)
						while (remaining.startsWith(":   ") || remaining.startsWith(" :   ")) {
							const hasLeadingSpace = remaining.startsWith(" :   ");
							// Find where this definition ends
							let inCodeBlock = false;
							let codeBlockFence = "";
							const lines = remaining.split("\n");
							let defEndLine = 1;

							for (let i = 1; i < lines.length; i++) {
								const line = lines[i];

								// Check for code block fences (with optional 4-space indent)
								const fenceMatch = /^(?: {4})?(```|~~~)/.exec(line);
								if (fenceMatch) {
									const fence = fenceMatch[1];
									if (!inCodeBlock) {
										inCodeBlock = true;
										codeBlockFence = fence;
									} else if (line.trim().startsWith(codeBlockFence)) {
										inCodeBlock = false;
										codeBlockFence = "";
									}
									defEndLine = i + 1;
									continue;
								}

								// If in code block, keep going
								if (inCodeBlock) {
									defEndLine = i + 1;
									continue;
								}

								// Another definition starts (with or without leading space)
								if (/^ ?: {3}/.test(line)) {
									break;
								}

								// Empty line - might be between paragraphs in definition
								if (/^\s*$/.test(line)) {
									defEndLine = i + 1;
									continue;
								}

								// Indented line (continuation)
								if (line.startsWith("    ")) {
									defEndLine = i + 1;
									continue;
								}

								// Non-indented, non-empty line
								// Check if previous line was empty (new paragraph boundary)
								const prevLineEmpty = i > 0 && /^\s*$/.test(lines[i - 1]);

								if (prevLineEmpty) {
									// After a blank line, a non-indented line ends the definition
									// unless it's followed by a definition marker (new term)
									let j = i + 1;
									while (j < lines.length && /^\s*$/.test(lines[j])) j++;
									if (j < lines.length && /^: {3}/.test(lines[j])) {
										// New term found, stop this definition
										break;
									}
									// End of definition list
									break;
								}

								// No blank line before - this is a continuation of the same paragraph
								defEndLine = i + 1;
								continue;
							}

							const defLines = lines.slice(0, defEndLine);
							const defRaw = defLines.join("\n") + (defEndLine < lines.length ? "\n" : "");

							// Extract content: first line after ":   " (or " :   "), then dedent continuation lines
							// But preserve indentation inside non-indented code blocks
							const skipChars = hasLeadingSpace ? 5 : 4; // Remove " :   " or ":   "
							let defContent = defLines[0].slice(skipChars);
							let inNonIndentedCodeBlock = false;
							let nonIndentedCodeFence = "";

							for (let i = 1; i < defLines.length; i++) {
								const line = defLines[i];

								// Check for code fence at column 0 (non-indented)
								const nonIndentedFence = /^(```|~~~)/.exec(line);
								if (nonIndentedFence && !line.startsWith("    ")) {
									if (!inNonIndentedCodeBlock) {
										inNonIndentedCodeBlock = true;
										nonIndentedCodeFence = nonIndentedFence[1];
									} else if (line.startsWith(nonIndentedCodeFence)) {
										inNonIndentedCodeBlock = false;
										nonIndentedCodeFence = "";
									}
									defContent += "\n" + line;
									continue;
								}

								// Inside a non-indented code block - preserve content as-is
								if (inNonIndentedCodeBlock) {
									defContent += "\n" + line;
									continue;
								}

								// Outside code blocks - dedent 4-space indented lines
								defContent += "\n" + (line.startsWith("    ") ? line.slice(4) : line);
							}
							defContent = defContent.trim();

							const defToken: DefinitionToken = {
								type: "definition",
								raw: defRaw,
								tokens: [],
							};

							// Parse definition content as markdown
							this.lexer.blockTokens(defContent, defToken.tokens);

							definitions.push(defToken);
							itemRaw += defRaw;
							remaining = remaining.slice(defRaw.length);
						}

						if (definitions.length > 0) {
							const itemToken: DefinitionListItemToken = {
								type: "def_list_item",
								raw: itemRaw,
								term: termText,
								termTokens: [],
								definitions,
							};

							// Parse term as inline tokens
							this.lexer.inline(termText, itemToken.termTokens);

							items.push(itemToken);
							fullRaw += itemRaw;
						} else {
							// No definitions found, not a valid definition list item
							break;
						}

						// Skip any blank lines between items
						const blankMatch = /^\n*/.exec(remaining);
						if (blankMatch && blankMatch[0]) {
							fullRaw += blankMatch[0];
							remaining = remaining.slice(blankMatch[0].length);
						}

						// Check for another term
						termMatch = termPattern.exec(remaining);
					}

					if (items.length > 0) {
						return {
							type: "def_list",
							raw: fullRaw,
							items,
						} as DefinitionListToken;
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

			// Also check for bare opening HTML tags (without markdown attribute)
			// that are followed elsewhere by a matching closing tag. We pair them
			// up so they render as a single balanced element, avoiding hydration
			// mismatches from rendering unbalanced HTML fragments via {@html}.
			// Self-closing tags and void elements are skipped.
			const VOID_ELEMENTS = new Set([
				"area",
				"base",
				"br",
				"col",
				"embed",
				"hr",
				"img",
				"input",
				"link",
				"meta",
				"param",
				"source",
				"track",
				"wbr",
			]);
			let bareOpenMatch: RegExpMatchArray | null = null;
			if (!openMatch) {
				const m = token.text.match(/^<(\w+)([^>]*)>\s*$/);
				if (
					m &&
					!VOID_ELEMENTS.has(m[1].toLowerCase()) &&
					!m[2].trim().endsWith("/") &&
					!token.text.trim().startsWith("</")
				) {
					// Verify a matching closing tag exists later in the token stream
					const closing = `</${m[1]}>`.toLowerCase();
					for (let k = i + 1; k < tokens.length; k++) {
						const t = tokens[k];
						if (
							t.type === "html" &&
							"text" in t &&
							typeof t.text === "string" &&
							t.text.trim().toLowerCase() === closing
						) {
							bareOpenMatch = m;
							break;
						}
					}
				}
			}

			if (openMatch || bareOpenMatch) {
				const matched = (openMatch ?? bareOpenMatch)!;
				const tagName = matched[1];
				const attrsBefore = matched[2] || "";
				const attrsAfter = openMatch ? openMatch[3] || "" : "";
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
 * Process code blocks to attach annotation content from following ordered lists.
 * Annotations in code (like `# (1)`) reference items in the list that follows.
 */
function processCodeAnnotations(tokens: Token[] | TokensList): Token[] {
	const result: Token[] = [];
	let i = 0;

	while (i < tokens.length) {
		const token = tokens[i];

		if (token.type === "code") {
			const codeToken = token as Tokens.Code;

			// Look for an ordered list following this code block (skip space tokens)
			let nextIdx = i + 1;
			while (nextIdx < tokens.length && tokens[nextIdx].type === "space") {
				nextIdx++;
			}

			if (nextIdx < tokens.length) {
				const nextToken = tokens[nextIdx] as Tokens.List;
				if (nextToken.type === "list" && nextToken.ordered && nextToken.start === 1) {
					// Store annotations on the code token
					(codeToken as Tokens.Code & { annotations?: Token[][] }).annotations =
						nextToken.items.map((item) => item.tokens);
					// Skip the annotation list
					i = nextIdx;
				}
			}

			result.push(codeToken);
		} else if ("tokens" in token && Array.isArray(token.tokens)) {
			// Recursively process nested tokens
			result.push({
				...token,
				tokens: processCodeAnnotations(token.tokens),
			} as Token);
		} else if (token.type === "content_tabs" && "tabs" in token) {
			// Handle content tabs specially
			const tabsToken = token as ContentTabsToken;
			result.push({
				...token,
				tabs: tabsToken.tabs.map((tab) => ({
					...tab,
					tokens: processCodeAnnotations(tab.tokens),
				})),
			} as Token);
		} else if (token.type === "list" && "items" in token) {
			// Handle list items
			const listToken = token as Tokens.List;
			result.push({
				...token,
				items: listToken.items.map((item) => ({
					...item,
					tokens: processCodeAnnotations(item.tokens),
				})),
			} as Token);
		} else if (token.type === "def_list" && "items" in token) {
			// Handle definition lists
			const defListToken = token as DefinitionListToken;
			result.push({
				...token,
				items: defListToken.items.map((item) => ({
					...item,
					definitions: item.definitions.map((def) => ({
						...def,
						tokens: processCodeAnnotations(def.tokens),
					})),
				})),
			} as Token);
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
 * Read and parse a markdown file into a token tree plus frontmatter
 * attributes.
 */
export async function readMarkdownFile(
	path: string,
): Promise<{ tokens: Token[] | TokensList; attributes: Attributes }> {
	const source = await Bun.file(path).text();
	const { attributes, body } = fm<Attributes>(source);

	// Get git information for the file
	const gitInfo = getGitInfo(path);

	// Process template variables (<<tenant()>>, <<tenant_url("...")>>, etc.)
	// Pass file path for resolving {% include %} statements
	const processedBody = processTemplates(body, path);

	const marked = createMarkedInstance();
	const tokens = marked.lexer(processedBody);

	const htmlProcessed = processHtmlMarkdownBlocks(tokens);
	const footnotesProcessed = processFootnotes(htmlProcessed);
	const processedTokens = processCodeAnnotations(footnotesProcessed);

	// Pre-highlight code blocks at build time to avoid async hydration mismatches
	await preHighlightCodeTokens(processedTokens);

	// Extract title from first heading if not in frontmatter
	const finalAttributes: Attributes = { ...attributes };
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

	// Add git metadata
	if (gitInfo.createdAt || gitInfo.modifiedAt || gitInfo.sourcePath) {
		finalAttributes.git = {
			createdAt: gitInfo.createdAt,
			modifiedAt: gitInfo.modifiedAt,
			sourcePath: gitInfo.sourcePath,
		};
	}

	return { tokens: processedTokens, attributes: finalAttributes };
}
