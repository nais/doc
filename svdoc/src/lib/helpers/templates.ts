import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import {
	telemetryCollectors,
	telemetryCollectorUrl,
	telemetryCspSources,
	telemetryEnvironment,
	docEnvironments,
	hasDocEnvironments,
	defaultLogDestination,
	type DocEnvironment,
} from "./tenant-docs.ts";
import { getTenantData } from "./tenant-data.ts";

/**
 * Get environment variable value
 * Works in both Node.js and SvelteKit contexts
 */
function getEnv(key: string, defaultValue: string = ""): string {
	return process.env[key] || defaultValue;
}

/**
 * Get the tenant name
 */
function tenant(): string {
	return getEnv("TENANT", "nav");
}

/**
 * Get the tenant URL for a service
 */
function tenantUrl(app: string, path: string = ""): string {
	if (app.startsWith("telemetry.external.")) {
		throw new Error("Use telemetry_collector_url() or telemetry_csp_sources() for collector URLs.");
	}
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

/**
 * Outbound (Cloud NAT) IPs for an environment, as a markdown bullet list.
 * The env name is the Terraform env name (e.g. "dev", "prod", "non-prod").
 */
function externalIps(env: string): string {
	const ips = getTenantData().environments[env]?.externalIps ?? [];
	if (ips.length === 0) {
		return `_No external IP data available for the ${env} environment._`;
	}
	return ips.map((ip) => `- ${ip}`).join("\n");
}

/**
 * Kafka pools for the current tenant, as a markdown table.
 */
function kafkaPools(): string {
	const pools = Object.values(getTenantData().environments)
		.filter((env) => env.kafkaPool)
		.sort((a, b) => (a.kafkaPool ?? "").localeCompare(b.kafkaPool ?? ""));
	if (pools.length === 0) {
		return "No Kafka pools available for your tenant.";
	}
	const rows = pools.map((env) => `| \`${env.kafkaPool}\` | \`${env.env}\` |`);
	return ["| Pool | Available from |", "|:-----|:---------------|", ...rows].join("\n");
}

/**
 * Management GCP project id, used in deploy workflow examples.
 */
function managementProjectId(): string {
	return getTenantData().managementProjectId ?? "";
}

/**
 * Full resource name of the tenant's GitHub OIDC workload identity provider.
 */
function identityProvider(): string {
	return getTenantData().identityProvider ?? "";
}

/**
 * Whether the tenant publishes deploy data (github-deploy-data bucket). When
 * false, the deploy action cannot resolve project id / identity provider
 * itself, so docs show them explicitly. Unknown data defaults to true.
 */
function publishesDeployData(): boolean {
	return getTenantData().deployDataPublished ?? true;
}

/**
 * A representative ingress domain for examples, "external" or "internal".
 * Uses the prod environment when available, otherwise the first environment.
 */
function exampleDomain(kind: string): string {
	const data = getTenantData();
	const envNames = Object.keys(data.environments).sort();
	const env =
		data.environments["prod"] ?? (envNames[0] ? data.environments[envNames[0]] : undefined);
	const envName = env?.env ?? "prod";
	const fallback =
		kind === "internal"
			? `${envName}.${data.tenant}.cloud.nais.io`
			: `external.${envName}.${data.tenant}.cloud.nais.io`;
	if (!env?.domains) {
		return fallback;
	}
	if (kind === "internal") {
		const internal = env.domains.internal ?? [];
		return (
			internal.find((d) => d.startsWith("intern.")) ??
			internal.find((d) => d === `${envName}.${data.tenant}.cloud.nais.io`) ??
			internal[0] ??
			fallback
		);
	}
	const external = env.domains.external ?? [];
	return (
		external.find((d) => d.default)?.name ??
		external.find((d) => d.name.startsWith("external."))?.name ??
		external[0]?.name ??
		fallback
	);
}

/**
 * Available log destinations for the tenant, as a markdown list.
 * Destinations without a dedicated how-to page render as plain code.
 */
function logDestinations(): string {
	const byId = new Map<string, { id: string; default: boolean }>();
	for (const env of Object.values(getTenantData().environments)) {
		for (const destination of env.logDestinations ?? []) {
			if (!byId.has(destination.id)) {
				byId.set(destination.id, destination);
			}
		}
	}
	if (byId.size === 0) {
		return "_No log destination data available for your tenant._";
	}
	const links: Record<string, string> = {
		loki: "[`loki`](../how-to/loki.md#default-logging-with-grafana-loki)",
		team_logs: "[`team_logs`](../how-to/team-logs.md#how-to-configure-team-logs)",
	};
	return [...byId.values()]
		.sort((a, b) => a.id.localeCompare(b.id))
		.map((destination) => `- ${links[destination.id] ?? `\`${destination.id}\``}`)
		.join("\n");
}

interface TemplateContext {
	tenant: string;
	tenantUrl: (app: string, path?: string) => string;
	naisdeviceName: string;
	gcpOnly: (feature: string) => string;
	notInTestNais: (feature: string) => string;
	externalIps: (env: string) => string;
	kafkaPools: () => string;
	managementProjectId: () => string;
	identityProvider: () => string;
	publishesDeployData: () => boolean;
	exampleDomain: (kind: string) => string;
	logDestinations: () => string;
	environments: () => DocEnvironment[];
	hasEnvironments: () => boolean;
	defaultLogDestination: () => string;
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
		externalIps,
		kafkaPools,
		managementProjectId,
		identityProvider,
		publishesDeployData,
		exampleDomain,
		logDestinations,
		environments: docEnvironments,
		hasEnvironments: hasDocEnvironments,
		defaultLogDestination,
	};
}

/**
 * Resolve function arguments from a string like '"arg1", arg2.path'.
 * Quoted arguments are literals; anything else is evaluated as an expression,
 * so macros can take loop variables: external_ips(env.name).
 */
function resolveFunctionArgs(argsStr: string, context: TemplateContext): unknown[] {
	const args: unknown[] = [];
	let current = "";
	let quote = "";
	for (const char of argsStr) {
		if (quote) {
			current += char;
			if (char === quote) {
				quote = "";
			}
		} else if (char === '"' || char === "'") {
			quote = char;
			current += char;
		} else if (char === ",") {
			if (current.trim()) {
				args.push(resolveArg(current.trim(), context));
			}
			current = "";
		} else {
			current += char;
		}
	}
	if (current.trim()) {
		args.push(resolveArg(current.trim(), context));
	}
	return args;
}

function resolveArg(arg: string, context: TemplateContext): unknown {
	if ((arg.startsWith('"') && arg.endsWith('"')) || (arg.startsWith("'") && arg.endsWith("'"))) {
		return arg.slice(1, -1);
	}
	return evaluateValue(arg, context);
}

function str(value: unknown): string {
	if (value === null || value === undefined) {
		return "";
	}
	return String(value);
}

/**
 * Call a template function by name with the given arguments
 */
function callTemplateFunction(
	funcName: string,
	args: unknown[],
	context: TemplateContext,
): unknown {
	switch (funcName) {
		case "tenant":
			return context.tenant;
		case "tenant_url":
			return context.tenantUrl(str(args[0]), str(args[1]));
		case "telemetry_collectors":
			return telemetryCollectors();
		case "telemetry_collector_url":
			return telemetryCollectorUrl();
		case "telemetry_csp_sources":
			return telemetryCspSources();
		case "telemetry_environment":
			return telemetryEnvironment();
		case "naisdevice_name":
			return context.naisdeviceName;
		case "gcp_only":
			return context.gcpOnly(str(args[0]));
		case "not_in_test_nais":
			return context.notInTestNais(str(args[0]));
		case "external_ips":
			return context.externalIps(str(args[0]));
		case "kafka_pools":
			return context.kafkaPools();
		case "management_project_id":
			return context.managementProjectId();
		case "identity_provider":
			return context.identityProvider();
		case "publishes_deploy_data":
			return context.publishesDeployData();
		case "example_domain":
			return context.exampleDomain(str(args[0]));
		case "log_destinations":
			return context.logDestinations();
		case "environments":
			return context.environments();
		case "has_environments":
			return context.hasEnvironments();
		case "default_log_destination":
			return context.defaultLogDestination();
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
		const args = resolveFunctionArgs(funcMatch[2], context);
		return callTemplateFunction(funcName, args, context);
	}

	// Handle dot access on records: env.name, domain.external
	if (/^\w+(\.\w+)+$/.test(trimmed)) {
		const parts = trimmed.split(".");
		let value: unknown = evaluateValue(parts[0], context);
		for (const part of parts.slice(1)) {
			if (value === null || value === undefined || typeof value !== "object") {
				return undefined;
			}
			value = (value as Record<string, unknown>)[part];
		}
		return value;
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
			const args = resolveFunctionArgs(funcMatch[2], context);
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
 * Find a {% for %}...{% endfor %} block, nesting-aware.
 */
function findLoopBlock(content: string):
	| {
			open: number;
			openEnd: number;
			close: number;
			closeEnd: number;
			varName: string;
			expression: string;
	  }
	| undefined {
	const tagRegex = /\{%-?\s*(?:for\s+(\w+)\s+in\s+(.+?)|(endfor))\s*-?%\}/g;
	let depth = 0;
	let match: RegExpExecArray | null;
	let open = -1;
	let openEnd = -1;
	let varName = "";
	let expression = "";

	while ((match = tagRegex.exec(content)) !== null) {
		if (match[3]) {
			if (depth > 0) {
				depth--;
				if (depth === 0) {
					return {
						open,
						openEnd,
						close: match.index,
						closeEnd: match.index + match[0].length,
						varName,
						expression,
					};
				}
			}
		} else {
			if (depth === 0) {
				open = match.index;
				openEnd = match.index + match[0].length;
				varName = match[1];
				expression = match[2];
			}
			depth++;
		}
	}
	return undefined;
}

/**
 * Process a loop body once per item, with the loop variable in scope.
 * Nested loops expand first so that conditionals inside their bodies see
 * the inner loop variable; conditionals at this level resolve after.
 */
function expandLoopBody(
	body: string,
	varName: string,
	item: unknown,
	context: TemplateContext,
): string {
	const childContext: TemplateContext = { ...context, [varName]: item };
	let result = processLoops(body, childContext);
	result = processConditionals(result, childContext);
	result = processVariables(result, childContext);
	return result;
}

/**
 * Process {% for x in expression %}...{% endfor %} loops.
 * Runs before top-level conditionals so that conditionals inside loop bodies
 * see the loop variable; conditionals wrapping a loop are resolved after.
 */
function processLoops(content: string, context: TemplateContext): string {
	let result = content;
	let iterations = 0;
	const maxIterations = 100; // Prevent infinite loops

	while (iterations < maxIterations) {
		const block = findLoopBlock(result);
		if (!block) {
			break;
		}

		// Standalone tags consume their whole line, like conditional tags
		const [blockStart, innerStart] = expandTagLine(result, block.open, block.openEnd);
		const [innerEnd, blockEnd] = expandTagLine(result, block.close, block.closeEnd);

		const body = result.slice(innerStart, innerEnd);
		const items = evaluateValue(block.expression, context);

		let output = "";
		if (Array.isArray(items)) {
			output = items.map((item) => expandLoopBody(body, block.varName, item, context)).join("");
		} else {
			console.warn(`for-loop expression did not evaluate to a list: ${block.expression}`);
		}

		result = result.slice(0, blockStart) + output + result.slice(blockEnd);
		iterations++;
	}

	return result;
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

	// Process loops (before conditionals, so conditions inside loop bodies
	// see the loop variable; conditionals wrapping loops resolve after)
	result = processLoops(result, context);

	// Process conditionals
	result = processConditionals(result, context);

	// Process << >> variables
	result = processVariables(result, context);

	return result.replace(/@@SVDOCRAW(\d+)@@/g, (_, index: string) => rawBlocks[Number(index)] ?? "");
}
