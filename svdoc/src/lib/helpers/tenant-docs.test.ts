import { readFileSync } from "node:fs";
import { afterEach, describe, expect, test } from "vitest";
import { getTenantConfig, tenants } from "../tenants.ts";
import { processTemplates } from "./templates.ts";

const originalTenant = process.env.TENANT;

afterEach(() => {
	if (originalTenant === undefined) {
		delete process.env.TENANT;
	} else {
		process.env.TENANT = originalTenant;
	}
	delete tenants["invalid-fixture"];
});

function render(content: string, tenant: string): string {
	process.env.TENANT = tenant;
	return processTemplates(content);
}

function document(path: string): string {
	return readFileSync(new URL(`../../../../docs/${path}`, import.meta.url), "utf8");
}

describe("tenant-backed documentation", () => {
	const environmentsPage = document("workloads/reference/environments.md");
	const frontendPage = document("observability/frontend/README.md");
	const referencePage = document("observability/frontend/reference/auto-configuration.md");
	const setupPage = document("observability/frontend/how-to/setup-faro.md");
	const nextjsPage = document("observability/frontend/how-to/setup-nextjs.md");
	const troubleshootingPage = document("observability/frontend/reference/troubleshooting.md");

	test.each([
		["nav", ["dev-gcp", "prod-gcp", "dev-fss", "prod-fss"]],
		["novari", ["test", "prod"]],
		["ssb", ["test", "prod"]],
		["atil", ["dev", "prod"]],
		["ks-digital", ["dev", "prod"]],
		["ldir", ["non-prod", "prod"]],
		["miljodir", ["non-prod"]],
		["test-nais", ["sandbox"]],
	] as const)("%s uses its actual environment names", (tenant, names) => {
		const overview = render(environmentsPage, tenant);
		expect([...overview.matchAll(/^### (.+)$/gm)].map((match) => match[1])).toEqual(names);
		for (const name of names) {
			if (name.endsWith("-fss")) continue;
			expect(render(frontendPage, tenant)).toContain(`| \`${name}\` |`);
			expect(render(referencePage, tenant)).toContain(`| \`${name}\` |`);
		}
	});

	test.each(Object.keys(tenants))("%s renders all migrated pages from the same data", (tenant) => {
		const config = getTenantConfig(tenant);
		const overview = render(environmentsPage, tenant);
		const frontend = render(frontendPage, tenant);
		const reference = render(referencePage, tenant);
		const setup = render(setupPage, tenant);
		const nextjs = render(nextjsPage, tenant);
		const troubleshooting = render(troubleshootingPage, tenant);

		for (const page of [overview, frontend, reference, setup, nextjs, troubleshooting]) {
			expect(page).not.toMatch(/<<\w+\(|\{%/);
		}
		for (const environment of config.environments) {
			for (const domain of environment.domains) {
				expect(overview).toContain(domain.name);
				if (domain.ip) expect(overview).toContain(domain.ip);
			}
			for (const ip of environment.outboundIps) {
				expect(overview).toContain(ip);
			}
			if (!environment.telemetryCollectorUrl) continue;
			expect(frontend).toContain(environment.telemetryCollectorUrl);
			expect(reference).toContain(environment.telemetryCollectorUrl);
			const origin = new URL(environment.telemetryCollectorUrl).origin;
			expect(setup).toContain(origin);
			expect(troubleshooting).toContain(origin);
		}
		const collectors = config.environments.filter(
			(environment) => environment.telemetryCollectorUrl,
		);
		const example = collectors.find((environment) => environment.production) ?? collectors[0];
		if (example) {
			for (const page of [setup, reference, nextjs]) {
				expect(page).toContain(example.telemetryCollectorUrl);
				expect(page).toContain(`\`${example.name}\``);
				expect(page).not.toContain("<COLLECTOR_URL>");
			}
		} else {
			expect(overview).toContain(config.notice);
			expect(frontend).toContain(config.notice);
			expect(setup).toContain("<COLLECTOR_URL>");
			expect(setup).toContain("<COLLECTOR_ORIGIN>");
			expect(setup).not.toContain(`telemetry.external.prod.${tenant}`);
		}
	});

	test("Novari has no dev collector in tables or CSP, and CSP contains origins only", () => {
		const sources = render("<<telemetry_csp_sources()>>", "novari");
		expect(sources).toBe(
			"https://telemetry.external.test.novari.cloud.nais.io https://telemetry.external.prod.novari.cloud.nais.io",
		);
		for (const page of [frontendPage, referencePage, setupPage, nextjsPage, troubleshootingPage]) {
			expect(render(page, "novari")).not.toContain("telemetry.external.dev.");
		}
	});

	test("NAV retains on-premises details without inventing on-premises collectors", () => {
		const overview = render(environmentsPage, "nav");
		expect(overview).toContain("## Google Cloud Platform (GCP)");
		expect(overview).toContain("## On-prem\n\n!!! warning");
		expect(overview).toContain("Requires [JITA][naisdevice-jita]");
		expect(overview).toContain("#### Kubectl access");
		const endpoints = render("<<telemetry_collectors()>>", "nav");
		expect(endpoints).not.toContain("fss");
		expect(endpoints).toContain("https://telemetry.ekstern.dev.nav.no/collect");
		expect(endpoints).toContain("https://telemetry.nav.no/collect");
	});

	test("configuration changes update environment headings, tables, examples and CSP together", () => {
		const original = tenants.novari;
		tenants["invalid-fixture"] = {
			environments: [
				{
					...original.environments[0],
					name: "acceptance",
					telemetryCollectorUrl: "https://collector.example.org/collect",
				},
			],
		};
		expect(render(environmentsPage, "invalid-fixture")).toContain("### acceptance");
		expect(render(frontendPage, "invalid-fixture")).toContain(
			"| `acceptance` | `https://collector.example.org/collect` |",
		);
		expect(render(setupPage, "invalid-fixture")).toContain(
			"connect-src 'self' https://collector.example.org;",
		);
		expect(render(nextjsPage, "invalid-fixture")).toContain(
			"https://collector.example.org/collect",
		);
	});
});

describe("invalid tenant configuration fails rendering", () => {
	test("an unset tenant defaults to NAV, matching local development", () => {
		delete process.env.TENANT;
		expect(processTemplates("<<tenant()>>")).toBe("nav");
		expect(processTemplates("<<telemetry_collectors()>>")).toContain(
			"https://telemetry.nav.no/collect",
		);
	});

	test("unknown tenants do not fall back to guessed endpoints", () => {
		expect(() => render("<<telemetry_collectors()>>", "unknown-tenant")).toThrow("Unknown tenant");
		expect(() => render("<<environment_reference()>>", "toString")).toThrow("Unknown tenant");
	});

	test("empty configuration needs an explicit notice", () => {
		tenants["invalid-fixture"] = { environments: [] };
		expect(() => render("<<environment_reference()>>", "invalid-fixture")).toThrow(
			"needs environments or an explicit documentation notice",
		);
	});

	test("duplicate environment names are rejected", () => {
		const environment = tenants.novari.environments[0];
		tenants["invalid-fixture"] = { environments: [environment, environment] };
		expect(() => render("<<telemetry_collectors()>>", "invalid-fixture")).toThrow(
			"duplicate environment name",
		);
	});

	test.each([
		"not-a-url",
		"http://collector.example.org/collect",
		"https://collector.example.org/",
	])("invalid collector URL %s is rejected", (telemetryCollectorUrl) => {
		tenants["invalid-fixture"] = {
			environments: [{ ...tenants.novari.environments[0], telemetryCollectorUrl }],
		};
		expect(() => render("<<telemetry_collectors()>>", "invalid-fixture")).toThrow(
			"Invalid collector URL",
		);
	});

	test("collector URLs cannot bypass tenant data through tenant_url()", () => {
		expect(() => render('<<tenant_url("telemetry.external.dev", "collect")>>', "novari")).toThrow(
			"Use telemetry_collector_url()",
		);
	});
});
