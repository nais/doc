import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

/**
 * Get environment variable value
 * Works in both Node.js/Bun and SvelteKit contexts
 */
function getEnv(key: string, defaultValue: string = ""): string {
	return process.env[key] || defaultValue;
}

/**
 * Get the tenant name
 */
function tenant(): string {
	return getEnv("TENANT", "tenant");
}

/**
 * Get the tenant URL for a service
 */
function tenantUrl(app: string, path: string = ""): string {
	const tenantName = tenant();
	if (tenantName === "nav" && app === "cdn") {
		return `https://cdn.nav.no/${path}`;
	}
	return `https://${app}.${tenantName}.cloud.nais.io/${path}`;
}

/**
 * Get the naisdevice name based on tenant
 */
function naisdeviceName(): string {
	if (tenant() === "nav") {
		return "naisdevice";
	}
	return "naisdevice-tenant";
}

/**
 * Check if the feature is GCP only and return admonition markdown if applicable
 */
function gcpOnly(feature: string): string {
	if (tenant() === "nav") {
		return `!!! gcp-only "${feature} is only available in GCP"\n    ${feature} is only available in GCP clusters, and will not work in on-prem clusters.`;
	}
	return "";
}

/**
 * Check if the feature is not available in test-nais
 */
function notInTestNais(feature: string): string {
	if (tenant() === "test-nais") {
		return `!!! not-in-test-nais "${feature} is not available in test-nais clusters"\n    ${feature} is not available in test-nais clusters.`;
	}
	return "";
}

interface TemplateContext {
	tenant: string;
	tenantUrl: (app: string, path?: string) => string;
	naisdeviceName: string;
	gcpOnly: (feature: string) => string;
	notInTestNais: (feature: string) => string;
	[key: string]: unknown;
}

/**
 * Create a template context with all available variables and functions
 */
function createTemplateContext(): TemplateContext {
	return {
		tenant: tenant(),
		tenantUrl,
		naisdeviceName: naisdeviceName(),
		gcpOnly,
		notInTestNais,
	};
}

/**
 * Parse function arguments from a string like '"arg1", "arg2"'
 */
function parseFunctionArgs(argsStr: string): string[] {
	const args: string[] = [];
	if (argsStr.trim()) {
		const argMatches = argsStr.match(/["']([^"']*)["']/g);
		if (argMatches) {
			args.push(...argMatches.map((a: string) => a.slice(1, -1)));
		}
	}
	return args;
}

/**
 * Call a template function by name with the given arguments
 */
function callTemplateFunction(funcName: string, args: string[], context: TemplateContext): unknown {
	switch (funcName) {
		case "tenant":
			return context.tenant;
		case "tenant_url":
			return context.tenantUrl(args[0] || "", args[1] || "");
		case "naisdevice_name":
			return context.naisdeviceName;
		case "gcp_only":
			return context.gcpOnly(args[0] || "");
		case "not_in_test_nais":
			return context.notInTestNais(args[0] || "");
		default:
			return undefined;
	}
}

/**
 * Evaluate a simple condition expression
 * Supports: ==, !=, in (tuple), and function calls like tenant()
 */
function evaluateCondition(expression: string, context: TemplateContext): boolean {
	const trimmed = expression.trim();

	// Handle "not" prefix
	if (trimmed.startsWith("not ")) {
		return !evaluateCondition(trimmed.slice(4), context);
	}

	// Handle "in" operator: tenant() in ("nav", "dev-nais")
	const inMatch = trimmed.match(/^(.+?)\s+in\s+\(([^)]+)\)$/);
	if (inMatch) {
		const leftValue = evaluateValue(inMatch[1].trim(), context);
		const items = inMatch[2].split(",").map((s) => {
			const trimmedItem = s.trim();
			// Remove quotes
			if (
				(trimmedItem.startsWith('"') && trimmedItem.endsWith('"')) ||
				(trimmedItem.startsWith("'") && trimmedItem.endsWith("'"))
			) {
				return trimmedItem.slice(1, -1);
			}
			return trimmedItem;
		});
		return items.includes(String(leftValue));
	}

	// Handle != operator
	const neqMatch = trimmed.match(/^(.+?)\s*!=\s*(.+)$/);
	if (neqMatch) {
		const leftValue = evaluateValue(neqMatch[1].trim(), context);
		const rightValue = evaluateValue(neqMatch[2].trim(), context);
		return leftValue !== rightValue;
	}

	// Handle == operator
	const eqMatch = trimmed.match(/^(.+?)\s*==\s*(.+)$/);
	if (eqMatch) {
		const leftValue = evaluateValue(eqMatch[1].trim(), context);
		const rightValue = evaluateValue(eqMatch[2].trim(), context);
		return leftValue === rightValue;
	}

	// Handle simple truthy check
	const value = evaluateValue(trimmed, context);
	return Boolean(value);
}

/**
 * Evaluate a value expression (variable, function call, or literal)
 */
function evaluateValue(expression: string, context: TemplateContext): unknown {
	const trimmed = expression.trim();

	// Handle quoted strings
	if (
		(trimmed.startsWith('"') && trimmed.endsWith('"')) ||
		(trimmed.startsWith("'") && trimmed.endsWith("'"))
	) {
		return trimmed.slice(1, -1);
	}

	// Handle function calls: func() or func("arg") or func("arg1", "arg2")
	const funcMatch = trimmed.match(/^(\w+)\(([^)]*)\)$/);
	if (funcMatch) {
		const funcName = funcMatch[1];
		const args = parseFunctionArgs(funcMatch[2]);
		return callTemplateFunction(funcName, args, context);
	}

	// Handle variable lookup
	if (context[trimmed] !== undefined) {
		return context[trimmed];
	}

	// Handle snake_case to camelCase conversion for context lookup
	const camelCase = trimmed.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
	if (context[camelCase] !== undefined) {
		return context[camelCase];
	}

	return undefined;
}

/**
 * Process {% set variable = value %} statements
 */
function processSetStatements(content: string, context: TemplateContext): string {
	const setRegex = /\{%-?\s*set\s+(\w+)\s*=\s*(['"][^'"]*['"]|[^%]+?)\s*-?%\}/g;

	return content.replace(setRegex, (_, varName, value) => {
		const trimmedValue = value.trim();
		// Handle quoted strings
		if (
			(trimmedValue.startsWith('"') && trimmedValue.endsWith('"')) ||
			(trimmedValue.startsWith("'") && trimmedValue.endsWith("'"))
		) {
			context[varName] = trimmedValue.slice(1, -1);
		} else {
			context[varName] = evaluateValue(trimmedValue, context);
		}
		return ""; // Remove the set statement from output
	});
}

/**
 * Process {% include 'path' %} statements recursively
 */
function processIncludes(content: string, basePath: string, maxDepth: number = 10): string {
	if (maxDepth <= 0) {
		console.warn("Max include depth reached, possible circular include");
		return content;
	}

	const includeRegex = /\{%-?\s*include\s+['"]([^'"]+)['"]\s*-?%\}/g;

	return content.replace(includeRegex, (_, includePath) => {
		try {
			let fullPath: string;
			let newBasePath: string;

			if (includePath.startsWith("./") || includePath.startsWith("../")) {
				// Relative path - resolve from current file's directory
				fullPath = resolve(basePath, includePath);
				newBasePath = dirname(fullPath);
			} else {
				// Absolute-style path (e.g., 'auth/partials/validate.md') - resolve from docs root
				// The docs root is always ../docs relative to the project
				fullPath = resolve("../docs", includePath);
				newBasePath = dirname(fullPath);
			}

			const includeContent = readFileSync(fullPath, "utf-8");
			// Recursively process includes in the included content
			return processIncludes(includeContent, newBasePath, maxDepth - 1);
		} catch {
			// If include fails, return a comment indicating the error
			console.warn(`Failed to include: ${includePath}`);
			return `<!-- Failed to include: ${includePath} -->`;
		}
	});
}

type ConditionalTagType = "if" | "elif" | "else" | "endif";

interface ConditionalTag {
	type: ConditionalTagType;
	condition?: string;
	start: number;
	end: number;
	text: string;
}

interface ConditionalBlock {
	openTag: ConditionalTag;
	closeTag: ConditionalTag;
	branchTags: ConditionalTag[];
}

/**
 * If a tag sits alone on a line, expand its range to cover the entire line,
 * including the leading indentation and the trailing newline.
 *
 * This mirrors Jinja's `trim_blocks` + `lstrip_blocks` defaults, and lets
 * templated documents be written at their natural indentation. Tags used
 * inline (e.g. inside an `hl_lines="..."` attribute) are left untouched.
 *
 * Returns the (possibly expanded) range plus whether the tag was standalone.
 */
function expandTagLine(text: string, start: number, end: number): [number, number, boolean] {
	const lineStart = text.lastIndexOf("\n", start - 1) + 1;
	const nlIndex = text.indexOf("\n", end);
	const lineEnd = nlIndex === -1 ? text.length : nlIndex + 1;
	const before = text.slice(lineStart, start);
	const after = text.slice(end, nlIndex === -1 ? text.length : nlIndex);

	if (/^[ \t]*$/.test(before) && /^[ \t]*$/.test(after)) {
		return [lineStart, lineEnd, true];
	}
	return [start, end, false];
}

/**
 * Find conditional tags and pair each opening tag with its matching endif.
 */
function findConditionalBlock(content: string): ConditionalBlock | undefined {
	const tagRegex = /\{%-?\s*(?:(if|elif)\s+(.+?)|(else|endif))\s*-?%\}/g;
	const tags: ConditionalTag[] = [];
	let match: RegExpExecArray | null;

	while ((match = tagRegex.exec(content)) !== null) {
		const keyword = match[1] ?? match[3];
		if (!keyword) {
			continue;
		}

		const type: ConditionalTagType =
			keyword === "if" || keyword === "elif" ? keyword : keyword === "else" ? "else" : "endif";

		tags.push({
			type,
			condition: match[2],
			start: match.index,
			end: match.index + match[0].length,
			text: match[0],
		});
	}

	const openIndex = tags.findIndex((tag) => tag.type === "if");
	if (openIndex === -1) {
		return undefined;
	}

	const openTag = tags[openIndex];
	const branchTags: ConditionalTag[] = [];
	let depth = 1;

	for (let index = openIndex + 1; index < tags.length; index++) {
		const tag = tags[index];
		if (tag.type === "if") {
			depth++;
		} else if (tag.type === "endif") {
			depth--;
			if (depth === 0) {
				return { openTag, closeTag: tag, branchTags };
			}
		} else if (depth === 1) {
			branchTags.push(tag);
		}
	}

	return undefined;
}

/**
 * Select one branch from a conditional block. Nested tags remain in the
 * selected output and are resolved by the next processing iteration.
 */
function selectConditionalBranch(
	content: string,
	block: ConditionalBlock,
	innerStart: number,
	innerEnd: number,
	context: TemplateContext,
): string {
	let condition: string | null = block.openTag.condition ?? "";
	let branchStart = innerStart;

	for (const branchTag of block.branchTags) {
		const [branchEnd] = expandTagLine(content, branchTag.start, branchTag.end);
		if (condition === null || evaluateCondition(condition, context)) {
			return content.slice(branchStart, branchEnd);
		}

		const [, nextBranchStart] = expandTagLine(content, branchTag.start, branchTag.end);
		branchStart = nextBranchStart;
		condition = branchTag.type === "else" ? null : (branchTag.condition ?? "");
	}

	if (condition === null || evaluateCondition(condition, context)) {
		return content.slice(branchStart, innerEnd);
	}

	return "";
}

/**
 * Process {% if %}...{% elif %}...{% else %}...{% endif %} blocks
 */
function processConditionals(content: string, context: TemplateContext): string {
	let result = content;
	let iterations = 0;
	const maxIterations = 100; // Prevent infinite loops

	// Keep processing until no more conditionals are found
	while (iterations < maxIterations) {
		const block = findConditionalBlock(result);
		if (!block) {
			break;
		}

		const { openTag, closeTag } = block;

		// Locate the open and close tags, then expand each to swallow its whole
		// line when it stands alone. Everything between them is the branch body.
		const [blockStart, innerStart, openAlone] = expandTagLine(result, openTag.start, openTag.end);
		const [innerEnd, blockEnd, closeAlone] = expandTagLine(result, closeTag.start, closeTag.end);

		let output = selectConditionalBranch(result, block, innerStart, innerEnd, context);

		// Explicit whitespace markers only matter for inline tags. A standalone
		// tag has already had its whole line removed, leaving nothing to strip.
		// These apply to the selected branch, since that is what ends up abutting
		// the tag in the output.
		if (!openAlone && openTag.text.endsWith("-%}")) output = output.replace(/^\s*/, "");
		if (!closeAlone && closeTag.text.startsWith("{%-")) output = output.replace(/\s*$/, "");

		let start = blockStart;
		let end = blockEnd;

		// {%- ... %} also eats whitespace preceding the opening tag
		if (!openAlone && openTag.text.startsWith("{%-")) {
			const before = result.slice(0, start);
			start -= before.length - before.replace(/\s*$/, "").length;
		}

		// ... -%} also eats whitespace following the closing tag
		if (!closeAlone && closeTag.text.endsWith("-%}")) {
			const after = result.slice(end);
			end += after.length - after.replace(/^\s*/, "").length;
		}

		result = result.slice(0, start) + output + result.slice(end);
		iterations++;
	}

	return result;
}

/**
 * Process << >> template variables
 */
function processVariables(content: string, context: TemplateContext): string {
	return content.replace(/<<(.+?)>>/g, (match, expression) => {
		const trimmed = expression.trim();

		// Handle function calls with arguments
		const funcMatch = trimmed.match(/^(\w+)\(([^)]*)\)$/);
		if (funcMatch) {
			const funcName = funcMatch[1];
			const args = parseFunctionArgs(funcMatch[2]);
			const result = callTemplateFunction(funcName, args, context);
			if (result !== undefined) {
				return String(result);
			}
			return match;
		}

		// Handle simple variables
		const value = evaluateValue(trimmed, context);
		if (value !== undefined) {
			return String(value);
		}

		return match; // Return original if not found
	});
}

/**
 * Process all template syntax in content
 * @param content - The content to process
 * @param filePath - Optional file path for resolving includes
 */
export function processTemplates(content: string, filePath?: string): string {
	const context = createTemplateContext();
	const rawBlocks: string[] = [];

	let result = content.replace(
		/\{%-?\s*raw\s*-?%\}([\s\S]*?)\{%-?\s*endraw\s*-?%\}/g,
		(_, body: string) => {
			const index = rawBlocks.push(body) - 1;
			return `@@SVDOCRAW${index}@@`;
		},
	);

	// Process includes first (they may contain other template syntax)
	if (filePath) {
		result = processIncludes(result, dirname(filePath));
	}

	// Process set statements (they define variables for later use)
	result = processSetStatements(result, context);

	// Process conditionals
	result = processConditionals(result, context);

	// Process << >> variables
	result = processVariables(result, context);

	return result.replace(/@@SVDOCRAW(\d+)@@/g, (_, index: string) => rawBlocks[Number(index)] ?? "");
}
