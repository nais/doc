import emojiNameMap from "emoji-name-map";
import fm from "front-matter";
import { Marked, type Token, type TokensList } from "marked";

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

export async function readMarkdownFile(
	path: string,
): Promise<{ tokens: Token[] | TokensList; attributes: Attributes }> {
	const source = await Bun.file(path).text();
	const { attributes, body } = fm<Attributes>(source);

	const marked = createMarkedInstance();
	const tokens = marked.lexer(body);

	// Process HTML blocks with markdown attribute
	const htmlProcessed = processHtmlMarkdownBlocks(tokens);

	// Process footnotes - collect and move to end
	const processedTokens = processFootnotes(htmlProcessed);

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
