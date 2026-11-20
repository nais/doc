import { getTenantData, type EnvironmentData } from "./tenant-data.ts";

/**
 * An environment shaped for template loops: typed records, no prose.
 * Prose belongs in the Markdown pages; this only structures tenant data.
 */
export interface DocEnvironment {
	name: string;
	domains: { name: string; external: boolean }[];
	externalIps: string[];
	defaultLogDestination: string;
}

/**
 * Environment ingress domains are the tenant's own: cloud.nais.io subdomains
 * or subdomains of the tenant's primary domain. Product-specific custom
 * domains (e.g. workinnorway.no) share the same load balancers but are not
 * environment ingress, so they are filtered out. When the tenant domain is
 * unknown (partial data), no filtering is applied.
 */
function isEnvironmentDomain(name: string, tenantDomain: string | undefined): boolean {
	if (!tenantDomain) {
		return true;
	}
	return (
		name === tenantDomain || name.endsWith(`.${tenantDomain}`) || name.endsWith(".cloud.nais.io")
	);
}

/**
 * Classify and filter an environment's domains for display:
 * - Legacy -gcp. infix aliases are always hidden (nav-only).
 * - authenticated.* is the fa-class fallback, hidden when the environment has
 *   a dedicated ansatt.* domain.
 * - external.*.cloud.nais.io is the ingress fallback, hidden when the
 *   environment has a dedicated external domain (custom, non-ansatt).
 */
function classifyDomains(
	environment: EnvironmentData,
	tenantDomain: string | undefined,
): { name: string; external: boolean }[] {
	const external = (environment.domains?.external ?? [])
		.filter((domain) => isEnvironmentDomain(domain.name, tenantDomain))
		.map((domain) => domain.name);
	const internal = (environment.domains?.internal ?? []).filter((name) =>
		isEnvironmentDomain(name, tenantDomain),
	);

	const hasAnsatt = external.some((name) => name.startsWith("ansatt."));
	const hasDedicatedExternal = external.some(
		(name) => !name.endsWith(".cloud.nais.io") && !name.startsWith("ansatt."),
	);

	const visibleExternal = external.filter((name) => {
		if (name.includes("-gcp.")) {
			return false;
		}
		if (name.startsWith("authenticated.") && hasAnsatt) {
			return false;
		}
		if (name.startsWith("external.") && name.endsWith(".cloud.nais.io") && hasDedicatedExternal) {
			return false;
		}
		return true;
	});
	const visibleInternal = internal.filter((name) => !name.includes("-gcp."));

	return [
		...visibleExternal
			.map((name) => ({ name, external: true }))
			.sort(
				(a, b) => Number(!a.name.startsWith("external.")) - Number(!b.name.startsWith("external.")),
			),
		...visibleInternal.map((name) => ({ name, external: false })),
	];
}

/**
 * Environments for the current tenant, sorted alphabetically with prod last
 * (matching the established page convention). External domains come first,
 * with the external.*.cloud.nais.io domain ahead of any custom domains.
 */
export function docEnvironments(): DocEnvironment[] {
	const tenantDomain = getTenantData().domain;
	return Object.values(getTenantData().environments)
		.map((environment) => ({
			name: environment.env,
			domains: classifyDomains(environment, tenantDomain),
			externalIps: environment.externalIps ?? [],
			defaultLogDestination:
				environment.logDestinations?.find((destination) => destination.default)?.id ??
				environment.logDestinations?.[0]?.id ??
				"loki",
		}))
		.sort(
			(a, b) =>
				Number(a.name === "prod") - Number(b.name === "prod") || a.name.localeCompare(b.name),
		);
}

export function hasDocEnvironments(): boolean {
	return Object.keys(getTenantData().environments).length > 0;
}

/**
 * Tenant-level default log destination for shared sections: the prod
 * environment's default when present, otherwise the first environment's.
 */
export function defaultLogDestination(): string {
	const environments = docEnvironments();
	const prod = environments.find((environment) => environment.name === "prod") ?? environments[0];
	return prod?.defaultLogDestination ?? "loki";
}

function table(headers: string[], rows: string[][]): string {
	const row = (cells: string[]) =>
		`| ${cells.map((cell) => cell.replaceAll("|", "\\|")).join(" | ")} |`;
	return [row(headers), row(headers.map(() => "---")), ...rows.map(row)].join("\n");
}

type Collector = EnvironmentData & { url: string };

/**
 * Collector URLs come resolved from Terraform (explicit override or derived
 * from the external ingress domain). Environments without a collector URL —
 * such as on-prem, which is not published at all — are omitted.
 */
function collectors(): Collector[] {
	return Object.values(getTenantData().environments)
		.map((environment) => ({ ...environment, url: environment.telemetryCollectorUrl }))
		.filter((environment): environment is Collector => Boolean(environment.url))
		.sort((a, b) => a.env.localeCompare(b.env));
}

export function telemetryCollectors(): string {
	const environments = collectors();
	if (environments.length === 0) {
		return "No collector endpoints are documented for this tenant yet. Replace the placeholders in manual configuration examples with your collector URL.";
	}
	return table(
		["Environment", "Collector endpoint"],
		environments.map((environment) => [`\`${environment.env}\``, `\`${environment.url}\``]),
	);
}

export function telemetryCspSources(): string {
	const sources = collectors().map((environment) => new URL(environment.url).origin);
	return [...new Set(sources)].join(" ") || "<COLLECTOR_ORIGIN>";
}

function exampleCollector(): Collector | undefined {
	const environments = collectors();
	return environments.find((environment) => environment.env === "prod") ?? environments[0];
}

export function telemetryCollectorUrl(): string {
	return exampleCollector()?.url ?? "<COLLECTOR_URL>";
}

export function telemetryEnvironment(): string {
	return exampleCollector()?.env ?? "<ENVIRONMENT>";
}
