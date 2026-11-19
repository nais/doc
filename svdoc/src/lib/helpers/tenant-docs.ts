import { getTenantConfig, type TenantEnvironment } from "../tenants.ts";

function table(headers: string[], rows: string[][]): string {
	const row = (cells: string[]) =>
		`| ${cells.map((cell) => cell.replaceAll("|", "\\|")).join(" | ")} |`;
	return [row(headers), row(headers.map(() => "---")), ...rows.map(row)].join("\n");
}

export function environmentReference(tenant: string): string {
	const config = getTenantConfig(tenant);
	if (config.environments.length === 0) {
		return config.notice ?? "";
	}

	const sections: string[] = [];
	const hasOnPrem = config.environments.some(
		(environment) => environment.infrastructure === "on-prem",
	);
	for (const infrastructure of ["gcp", "on-prem"] as const) {
		const environments = config.environments.filter(
			(environment) => environment.infrastructure === infrastructure,
		);
		if (environments.length === 0) continue;
		if (hasOnPrem) {
			sections.push(
				infrastructure === "gcp"
					? "## Google Cloud Platform (GCP)"
					: "## On-prem\n\n!!! warning\n    This is a legacy environment, and is not recommended for new workloads.",
			);
		}
		for (const environment of environments) {
			const hasIngressIp = environment.domains.some((domain) => domain.ip);
			sections.push(
				`### ${environment.name}`,
				hasOnPrem ? "#### Ingress domains" : "#### Domains",
				table(
					["domain", "accessible from", "description", ...(hasIngressIp ? ["ip address"] : [])],
					environment.domains.map((domain) => [
						domain.name,
						domain.access,
						domain.description,
						...(hasIngressIp ? [domain.ip ?? ""] : []),
					]),
				),
			);
			if (hasOnPrem && infrastructure === "gcp") {
				sections.push(
					"See [explanation for exposing application][expose-app] for more information.",
				);
			}
			if (environment.outboundIps.length > 0) {
				sections.push(
					hasOnPrem ? "#### External IPs" : "#### External/outbound IPs",
					environment.outboundIps.map((ip) => `- ${ip}`).join("\n"),
				);
			}
			if (environment.kubectlAccess) {
				sections.push("#### Kubectl access", environment.kubectlAccess);
			}
			sections.push(
				"#### Observability",
				table(
					["data", "default"],
					[
						["logs (stdout)", `\`${environment.logs}\``],
						[
							"auto-instrumentation",
							environment.autoInstrumentation === "Not enabled"
								? environment.autoInstrumentation
								: `\`${environment.autoInstrumentation}\``,
						],
					],
				),
			);
		}
	}
	return sections.join("\n\n");
}

function collectors(tenant: string): (TenantEnvironment & { telemetryCollectorUrl: string })[] {
	return getTenantConfig(tenant).environments.filter(
		(environment): environment is TenantEnvironment & { telemetryCollectorUrl: string } =>
			environment.telemetryCollectorUrl !== null,
	);
}

export function telemetryCollectors(tenant: string): string {
	const environments = collectors(tenant);
	if (environments.length === 0) {
		return `${getTenantConfig(tenant).notice ?? "No collector endpoints are configured for this tenant."} Replace the placeholders in manual configuration examples with your collector URL.`;
	}
	return table(
		["Environment", "Collector endpoint"],
		environments.map((environment) => [
			`\`${environment.name}\``,
			`\`${environment.telemetryCollectorUrl}\``,
		]),
	);
}

export function telemetryCspSources(tenant: string): string {
	const sources = collectors(tenant).map(
		(environment) => new URL(environment.telemetryCollectorUrl).origin,
	);
	return [...new Set(sources)].join(" ") || "<COLLECTOR_ORIGIN>";
}

function exampleCollector(tenant: string) {
	const environments = collectors(tenant);
	return environments.find((environment) => environment.production) ?? environments[0];
}

export function telemetryCollectorUrl(tenant: string): string {
	return exampleCollector(tenant)?.telemetryCollectorUrl ?? "<COLLECTOR_URL>";
}

export function telemetryEnvironment(tenant: string): string {
	return exampleCollector(tenant)?.name ?? "<ENVIRONMENT>";
}
