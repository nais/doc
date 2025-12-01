import type { Element, Text } from "hast";
import {
	createHighlighter,
	type BundledLanguage,
	type Highlighter,
	type ShikiTransformer,
} from "shiki";

/**
 * Variable found in code
 */
export interface CodeVariable {
	index: number;
	name: string;
	isReadOnly: boolean;
	placeholder: string;
}

// Unique prefix for variable placeholders that won't conflict with code
const VARIABLE_PLACEHOLDER_PREFIX = "___SVDOC_VAR_";
const VARIABLE_PLACEHOLDER_SUFFIX = "___";

/**
 * Extract variables from code and replace with placeholders
 * Variables use the format: <VARIABLE_NAME> or <VARIABLE_NAME:readonly>
 */
export function extractVariables(code: string): {
	processedCode: string;
	variables: CodeVariable[];
} {
	const variables: CodeVariable[] = [];
	const variablePattern = /<([A-Z_-]+)(:readonly)?>/g;

	let index = 0;
	const processedCode = code.replace(variablePattern, (match, name, readonlyTag) => {
		const placeholder = `${VARIABLE_PLACEHOLDER_PREFIX}${index}${VARIABLE_PLACEHOLDER_SUFFIX}`;
		variables.push({
			index,
			name,
			isReadOnly: !!readonlyTag,
			placeholder,
		});
		index++;
		return placeholder;
	});

	return { processedCode, variables };
}

let highlighterPromise: Promise<Highlighter> | null = null;

/**
 * Get or create the Shiki highlighter instance
 */
export async function getHighlighter(): Promise<Highlighter> {
	if (!highlighterPromise) {
		highlighterPromise = createHighlighter({
			themes: ["github-dark", "github-light", "github-dark-default", "github-light-default"],
			langs: [
				"javascript",
				"typescript",
				"json",
				"yaml",
				"bash",
				"shell",
				"python",
				"go",
				"rust",
				"java",
				"kotlin",
				"sql",
				"html",
				"css",
				"markdown",
				"dockerfile",
				"toml",
				"xml",
				"http",
				"groovy",
				"diff",
				"plaintext",
			],
		});
	}
	return highlighterPromise;
}

/**
 * Parse hl_lines attribute from code fence info string
 * Supports formats like: hl_lines="4-5 8" or hl_lines="1 2 3"
 * Returns a Set of 1-based line numbers to highlight
 */
export function parseHighlightLines(lang: string): {
	language: string;
	highlightLines: Set<number>;
} {
	const highlightLines = new Set<number>();

	// Match hl_lines="..." pattern
	const hlMatch = lang.match(/hl_lines=["']([^"']+)["']/);
	if (!hlMatch) {
		// Also clean any other attributes from lang
		const cleanLang = lang.split(/\s+/)[0] || "text";
		return { language: cleanLang, highlightLines };
	}

	const hlValue = hlMatch[1];
	const parts = hlValue.split(/\s+/);

	for (const part of parts) {
		if (part.includes("-")) {
			// Range like "4-5"
			const [start, end] = part.split("-").map(Number);
			if (!isNaN(start) && !isNaN(end)) {
				for (let i = start; i <= end; i++) {
					highlightLines.add(i);
				}
			}
		} else {
			// Single line number
			const lineNum = Number(part);
			if (!isNaN(lineNum)) {
				highlightLines.add(lineNum);
			}
		}
	}

	// Extract clean language (first word before any attributes)
	const cleanLang = lang.split(/\s+/)[0] || "text";

	return { language: cleanLang, highlightLines };
}

/**
 * Parse title attribute from code fence info string
 * Supports format: title="filename.ts"
 */
export function parseTitle(lang: string): string | null {
	const titleMatch = lang.match(/title=["']([^"']+)["']/);
	return titleMatch ? titleMatch[1] : null;
}

/**
 * Code annotation found in source code
 */
export interface CodeAnnotation {
	id: string;
	line: number;
	stripComment: boolean;
}

// Common annotation patterns for different comment styles
// Pattern captures: (before comment)(comment start + text before annotation)(annotation id)(optional ! for strip)(rest)
const HASH_COMMENT = /^(.*?)(#[^(]*)\((\d+)\)(!)?(.*)$/;
const DOUBLE_SLASH = /^(.*?)(\/\/[^(]*)\((\d+)\)(!)?(.*)$/;
const BLOCK_COMMENT = /^(.*?)(\/\*[^(]*)\((\d+)\)(!)?[^*]*\*\/(.*)$/;
const HTML_COMMENT = /^(.*?)(<!--[^(]*)\((\d+)\)(!)?[^-]*-->(.*)$/;
const SQL_COMMENT = /^(.*?)(--[^(]*)\((\d+)\)(!)?(.*)$/;

// Language to comment pattern mapping
const LANGUAGE_PATTERNS: Record<string, RegExp[]> = {
	// Hash-style comments
	yaml: [HASH_COMMENT],
	python: [HASH_COMMENT],
	bash: [HASH_COMMENT],
	shell: [HASH_COMMENT],
	sh: [HASH_COMMENT],
	toml: [HASH_COMMENT],
	dockerfile: [HASH_COMMENT],

	// C-style comments (// and /* */)
	javascript: [DOUBLE_SLASH, BLOCK_COMMENT],
	typescript: [DOUBLE_SLASH, BLOCK_COMMENT],
	js: [DOUBLE_SLASH, BLOCK_COMMENT],
	ts: [DOUBLE_SLASH, BLOCK_COMMENT],
	java: [DOUBLE_SLASH, BLOCK_COMMENT],
	kotlin: [DOUBLE_SLASH, BLOCK_COMMENT],
	go: [DOUBLE_SLASH, BLOCK_COMMENT],
	rust: [DOUBLE_SLASH, BLOCK_COMMENT],
	c: [DOUBLE_SLASH, BLOCK_COMMENT],
	cpp: [DOUBLE_SLASH, BLOCK_COMMENT],
	groovy: [DOUBLE_SLASH, BLOCK_COMMENT],

	// HTML/XML comments
	html: [HTML_COMMENT],
	xml: [HTML_COMMENT],

	// CSS block comments
	css: [BLOCK_COMMENT],

	// SQL comments
	sql: [SQL_COMMENT],
};

// Default patterns to try if language not explicitly mapped
const DEFAULT_PATTERNS = [HASH_COMMENT, DOUBLE_SLASH, BLOCK_COMMENT];

/**
 * Parse code annotations from source code
 * Looks for patterns like: # (1), // Replace (2), #(1)!, etc.
 * The (x) marker is always removed from the output.
 * If the annotation ends with !, the entire comment is stripped.
 * Returns the annotations found and the cleaned code.
 */
export function parseCodeAnnotations(
	code: string,
	language: string,
): {
	cleanedCode: string;
	annotations: CodeAnnotation[];
} {
	const annotations: CodeAnnotation[] = [];
	const lines = code.split("\n");
	const cleanedLines: string[] = [];

	const patterns = LANGUAGE_PATTERNS[language.toLowerCase()] || DEFAULT_PATTERNS;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		let matched = false;

		for (const pattern of patterns) {
			const match = pattern.exec(line);
			if (match) {
				const beforeComment = match[1];
				const commentStart = match[2]; // e.g., "# Replace " or "# " or "//"
				const annotationId = match[3];
				const stripComment = match[4] === "!";
				const afterAnnotation = match[5] || "";

				annotations.push({
					id: annotationId,
					line: i + 1, // 1-based line number
					stripComment,
				});

				if (stripComment) {
					// Remove the entire comment, keep only code before it
					cleanedLines.push(beforeComment.trimEnd());
				} else {
					// Keep the comment but remove the (x) part
					const cleanedComment = commentStart.trimEnd();
					if (cleanedComment.match(/^(#|\/\/|--|\/\*)$/)) {
						// Comment is just the marker with no text, remove it entirely
						cleanedLines.push(beforeComment.trimEnd());
					} else {
						// Keep the comment text without (x)
						cleanedLines.push(beforeComment + cleanedComment + afterAnnotation);
					}
				}

				matched = true;
				break;
			}
		}

		if (!matched) {
			cleanedLines.push(line);
		}
	}

	return {
		cleanedCode: cleanedLines.join("\n"),
		annotations,
	};
}

/**
 * Languages supported by our Shiki instance
 */
const SUPPORTED_LANGUAGES = new Set([
	"javascript",
	"js",
	"typescript",
	"ts",
	"json",
	"yaml",
	"yml",
	"bash",
	"sh",
	"shell",
	"python",
	"py",
	"go",
	"rust",
	"rs",
	"java",
	"kotlin",
	"kt",
	"sql",
	"html",
	"css",
	"markdown",
	"md",
	"dockerfile",
	"docker",
	"toml",
	"xml",
	"http",
	"groovy",
	"diff",
	"plaintext",
	"text",
	"txt",
]);

/**
 * Language aliases to canonical names
 */
const LANGUAGE_ALIASES: Record<string, string> = {
	js: "javascript",
	ts: "typescript",
	yml: "yaml",
	sh: "bash",
	shell: "bash",
	py: "python",
	rs: "rust",
	kt: "kotlin",
	md: "markdown",
	docker: "dockerfile",
	txt: "plaintext",
	text: "plaintext",
};

/**
 * Normalize language name to what Shiki expects
 */
export function normalizeLanguage(lang: string): string {
	const normalized = lang.toLowerCase();
	return (
		LANGUAGE_ALIASES[normalized] || (SUPPORTED_LANGUAGES.has(normalized) ? normalized : "plaintext")
	);
}

export interface HighlightResult {
	html: string;
	language: string;
	title: string | null;
	variables: CodeVariable[];
}

/**
 * Process variables in a node's children recursively
 */
function processVariablesInNode(node: Element, placeholderMap: Map<string, CodeVariable>): void {
	if (!node.children || node.children.length === 0) return;

	const newChildren: (Element | Text)[] = [];
	let modified = false;

	for (const child of node.children) {
		if (child.type === "element") {
			// Recursively process child elements
			processVariablesInNode(child, placeholderMap);
			newChildren.push(child);
			continue;
		}

		if (child.type !== "text") {
			// Skip comments and other node types
			continue;
		}

		const text = child.value;
		const segments: (Element | Text)[] = [];
		let currentPos = 0;

		// Find all placeholders in this text and their positions
		const matches: { start: number; end: number; variable: CodeVariable }[] = [];
		for (const [placeholder, variable] of placeholderMap) {
			let searchStart = 0;
			let idx: number;
			while ((idx = text.indexOf(placeholder, searchStart)) !== -1) {
				matches.push({
					start: idx,
					end: idx + placeholder.length,
					variable,
				});
				searchStart = idx + placeholder.length;
			}
		}

		if (matches.length === 0) {
			newChildren.push(child);
			continue;
		}

		modified = true;
		// Sort matches by position
		matches.sort((a, b) => a.start - b.start);

		for (const match of matches) {
			// Add text before this placeholder
			if (match.start > currentPos) {
				segments.push({
					type: "text",
					value: text.slice(currentPos, match.start),
				});
			}

			// Add the marker span for the variable
			segments.push({
				type: "element",
				tagName: "span",
				properties: {
					class: "svdoc-variable-marker",
					"data-variable-name": match.variable.name,
					"data-variable-readonly": match.variable.isReadOnly ? "true" : "false",
				},
				children: [{ type: "text", value: `<${match.variable.name}>` }],
			});

			currentPos = match.end;
		}

		// Add remaining text after the last placeholder
		if (currentPos < text.length) {
			segments.push({
				type: "text",
				value: text.slice(currentPos),
			});
		}

		newChildren.push(...segments);
	}

	if (modified) {
		node.children = newChildren;
	}
}

/**
 * Create a Shiki transformer for line processing
 */
function createLineTransformer(
	highlightLines: Set<number>,
	lineToAnnotation: Map<number, string>,
	includePopups: boolean = false,
	variables: CodeVariable[] = [],
): ShikiTransformer {
	// Build a map from placeholder to variable for quick lookup
	const placeholderMap = new Map<string, CodeVariable>();
	for (const v of variables) {
		placeholderMap.set(v.placeholder, v);
	}

	return {
		line(node, line) {
			// Add highlight class to specific lines
			if (highlightLines.has(line)) {
				this.addClassToHast(node, "highlighted-line");
			}
			// Add line number data attribute
			node.properties["data-line"] = line;

			// Process variable placeholders in this line's text nodes
			if (variables.length > 0) {
				processVariablesInNode(node, placeholderMap);
			}

			// Add annotation marker if this line has an annotation
			const annotationId = lineToAnnotation.get(line);
			if (annotationId) {
				node.properties["data-annotation"] = annotationId;
				this.addClassToHast(node, "has-annotation");

				if (includePopups) {
					// Simple clickable annotation marker
					const annotationMarker: Element = {
						type: "element",
						tagName: "span",
						properties: {
							class: "code-annotation",
							"data-annotation-id": annotationId,
						},
						children: [
							{
								type: "element",
								tagName: "span",
								properties: {
									class: "code-annotation-marker",
									tabindex: "0",
									role: "button",
								},
								children: [{ type: "text", value: annotationId }],
							},
						],
					};

					node.children.push(annotationMarker);
				}
			}
		},
	};
}

/**
 * Highlight code using Shiki (single theme)
 */
export async function highlightCode(
	code: string,
	langInfo: string,
	theme: "light" | "dark" = "dark",
): Promise<HighlightResult> {
	const { language, highlightLines } = parseHighlightLines(langInfo);
	const title = parseTitle(langInfo);
	const normalizedLang = normalizeLanguage(language);

	// Parse code annotations
	const { cleanedCode, annotations } = parseCodeAnnotations(code, language);

	// Extract variables and replace with placeholders
	const { processedCode, variables } = extractVariables(cleanedCode);

	const highlighter = await getHighlighter();

	// Load language dynamically if not already loaded
	const loadedLangs = highlighter.getLoadedLanguages();
	if (!loadedLangs.includes(normalizedLang) && normalizedLang !== "plaintext") {
		try {
			await highlighter.loadLanguage(normalizedLang as BundledLanguage);
		} catch {
			// Fall back to plaintext if language can't be loaded
		}
	}

	const themeId = theme === "dark" ? "github-dark" : "github-light";

	// Build a map of line numbers to annotation IDs
	const lineToAnnotation = new Map<number, string>();
	for (const annotation of annotations) {
		lineToAnnotation.set(annotation.line, annotation.id);
	}

	const html = highlighter.codeToHtml(processedCode, {
		lang: normalizedLang,
		theme: themeId,
		transformers: [createLineTransformer(highlightLines, lineToAnnotation, false, variables)],
	});

	return {
		html,
		language,
		title,
		variables,
	};
}

/**
 * Highlight code with CSS variables for light/dark theme switching
 * Uses Shiki's dual theme support to output CSS variables
 */
export async function highlightCodeDual(
	code: string,
	langInfo: string,
): Promise<{
	html: string;
	language: string;
	title: string | null;
	annotations: CodeAnnotation[];
	variables: CodeVariable[];
}> {
	const { language, highlightLines } = parseHighlightLines(langInfo);
	const title = parseTitle(langInfo);
	const normalizedLang = normalizeLanguage(language);

	// Parse code annotations
	const { cleanedCode, annotations } = parseCodeAnnotations(code, language);

	// Extract variables and replace with placeholders
	const { processedCode, variables } = extractVariables(cleanedCode);

	const highlighter = await getHighlighter();

	// Load language dynamically if not already loaded
	const loadedLangs = highlighter.getLoadedLanguages();
	if (!loadedLangs.includes(normalizedLang) && normalizedLang !== "plaintext") {
		try {
			await highlighter.loadLanguage(normalizedLang as BundledLanguage);
		} catch {
			// Fall back to plaintext if language can't be loaded
		}
	}

	// Build a map of line numbers to annotation IDs for quick lookup
	const lineToAnnotation = new Map<number, string>();
	for (const annotation of annotations) {
		lineToAnnotation.set(annotation.line, annotation.id);
	}

	// Use Shiki's dual theme support with CSS variables
	const html = highlighter.codeToHtml(processedCode, {
		lang: normalizedLang,
		themes: {
			light: "github-light",
			dark: "github-dark",
		},
		defaultColor: false,
		transformers: [createLineTransformer(highlightLines, lineToAnnotation, true, variables)],
	});

	return { html, language, title, annotations, variables };
}
