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
export function tenant(): string {
	return getEnv("TENANT", "tenant");
}

/**
 * Get the endpoint environment variable name
 */
export function endpointEnvVar(): string {
	return getEnv("ENDPOINT_ENV_VAR", "ENDPOINT");
}

/**
 * Get the target name
 */
export function target(): string {
	return getEnv("TARGET", "target");
}

/**
 * Get the target description
 */
export function targetDescription(): string {
	return getEnv("TARGET_DESCRIPTION", "the target system");
}

/**
 * Get the claims reference
 */
export function claimsReference(): string {
	return getEnv("CLAIMS_REFERENCE", "claims");
}

/**
 * Get the token validation reference
 */
export function tokenValidationReference(): string {
	return getEnv("TOKEN_VALIDATION_REFERENCE", "token validation");
}

/**
 * Get the tenant URL for a service
 */
export function tenantUrl(app: string, path: string = ""): string {
	const tenantName = tenant();
	if (tenantName === "nav" && app === "cdn") {
		return `https://cdn.nav.no/${path}`;
	}
	return `https://${app}.${tenantName}.cloud.nais.io/${path}`;
}

/**
 * Get the naisdevice name based on tenant
 */
export function naisdeviceName(): string {
	if (tenant() === "nav") {
		return "naisdevice";
	}
	return "naisdevice-tenant";
}

/**
 * Get the identity provider name
 */
export function identityProvider(): string {
	return getEnv("IDENTITY_PROVIDER", "Entra ID");
}

/**
 * Check if the feature is GCP only and return admonition markdown if applicable
 */
export function gcpOnly(feature: string): string {
	if (tenant() === "nav") {
		return `!!! gcp-only "${feature} is only available in GCP"\n    ${feature} is only available in GCP clusters, and will not work in on-prem clusters.`;
	}
	return "";
}

/**
 * Check if the feature is not available in test-nais
 */
export function notInTestNais(feature: string): string {
	if (tenant() === "test-nais") {
		return `!!! not-in-test-nais "${feature} is not available in test-nais clusters"\n    ${feature} is not available in test-nais clusters.`;
	}
	return "";
}

export interface TemplateContext {
	tenant: string;
	tenantUrl: (app: string, path?: string) => string;
	naisdeviceName: string;
	identityProvider: string;
	endpointEnvVar: string;
	target: string;
	targetDescription: string;
	claimsReference: string;
	tokenValidationReference: string;
	gcpOnly: (feature: string) => string;
	notInTestNais: (feature: string) => string;
	[key: string]: unknown;
}

/**
 * Create a template context with all available variables and functions
 */
export function createTemplateContext(): TemplateContext {
	return {
		tenant: tenant(),
		tenantUrl,
		naisdeviceName: naisdeviceName(),
		identityProvider: identityProvider(),
		endpointEnvVar: endpointEnvVar(),
		target: target(),
		targetDescription: targetDescription(),
		claimsReference: claimsReference(),
		tokenValidationReference: tokenValidationReference(),
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

interface ConditionalBranch {
	condition: string | null;
	content: string;
}

/**
 * Parse the branches (if/elif/else) from inner conditional content
 */
function parseConditionalBranches(ifCondition: string, innerContent: string): ConditionalBranch[] {
	const branches: ConditionalBranch[] = [];
	const branchRegex = /\{%-?\s*(?:elif\s+(.+?)|else)\s*-?%\}/g;

	// Find all branch markers (elif/else)
	const parts: { type: "elif" | "else"; condition?: string; index: number; length: number }[] = [];
	let branchMatch;

	while ((branchMatch = branchRegex.exec(innerContent)) !== null) {
		parts.push({
			type: branchMatch[1] ? "elif" : "else",
			condition: branchMatch[1],
			index: branchMatch.index,
			length: branchMatch[0].length,
		});
	}

	if (parts.length === 0) {
		// No elif or else, just the if content
		branches.push({ condition: ifCondition, content: innerContent });
	} else {
		// First branch: from start to first elif/else
		branches.push({
			condition: ifCondition,
			content: innerContent.slice(0, parts[0].index),
		});

		// Middle and final branches
		for (let i = 0; i < parts.length; i++) {
			const startIndex = parts[i].index + parts[i].length;
			const endIndex = i + 1 < parts.length ? parts[i + 1].index : innerContent.length;
			const branchCondition = parts[i].type === "else" ? null : parts[i].condition!;

			branches.push({
				condition: branchCondition,
				content: innerContent.slice(startIndex, endIndex),
			});
		}
	}

	return branches;
}

/**
 * Process {% if %}...{% elif %}...{% else %}...{% endif %} blocks
 */
function processConditionals(content: string, context: TemplateContext): string {
	let result = content;
	let iterations = 0;
	const maxIterations = 100; // Prevent infinite loops

	// Keep processing until no more conditionals are found
	// Process innermost conditionals first (ones without nested ifs)
	while (iterations < maxIterations) {
		const ifRegex = /\{%-?\s*if\s+(.+?)\s*-?%\}([\s\S]*?)\{%-?\s*endif\s*-?%\}/;
		const match = ifRegex.exec(result);

		if (!match) {
			break;
		}

		const fullMatch = match[0];
		const condition = match[1];
		const innerContent = match[2];

		// Parse branches
		const branches = parseConditionalBranches(condition, innerContent);

		// Evaluate branches and find the first matching one
		let output = "";
		for (const branch of branches) {
			if (branch.condition === null) {
				// else branch - always matches if we get here
				output = branch.content;
				break;
			} else if (evaluateCondition(branch.condition, context)) {
				output = branch.content;
				break;
			}
		}

		// Replace the if block with the output
		result = result.slice(0, match.index) + output + result.slice(match.index + fullMatch.length);
		iterations++;
	}

	return result;
}

/**
 * Process << >> template variables
 */
function processVariables(content: string, context: TemplateContext): string {
	return content.replace(/<<([^>]+)>>/g, (match, expression) => {
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

	let result = content;

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

	return result;
}
