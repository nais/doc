import { readFileSync } from "node:fs";
import { afterEach, describe, expect, test } from "vitest";
import { processTemplates } from "./templates.ts";
import { setTenantData, type TenantData } from "./tenant-data.ts";

const originalTenant = process.env.TENANT;

afterEach(() => {
	setTenantData(null);
	if (originalTenant === undefined) {
		delete process.env.TENANT;
	} else {
		process.env.TENANT = originalTenant;
	}
});

function render(content: string, tenant: string): string {
	process.env.TENANT = tenant;
	return processTemplates(content);
}

function document(path: string): string {
	return readFileSync(new URL(`../../../../docs/${path}`, import.meta.url), "utf8");
}

// Mirrors what nais-terraform-modules writes to the nais-tenant-data bucket:
// collector URLs are resolved by Terraform before publishing.
const ldirFixture: TenantData = {
	tenant: "ldir",
	domain: "landbruksdirektoratet.no",
	environments: {
		"non-prod": {
			tenant: "ldir",
			env: "non-prod",
			externalIps: ["34.88.202.181"],
			kafkaPool: "ldir-non-prod",
			domains: {
				external: [
					{ name: "external.non-prod.ldir.cloud.nais.io" },
					{ name: "non-prod.landbruksdirektoratet.no", default: true },
				],
				internal: ["non-prod.ldir.cloud.nais.io", "intern.non-prod.landbruksdirektoratet.no"],
			},
			logDestinations: [{ id: "loki", default: true }],
			telemetryCollectorUrl: "https://telemetry.external.non-prod.ldir.cloud.nais.io/collect",
		},
		prod: {
			tenant: "ldir",
			env: "prod",
			externalIps: ["34.88.126.246"],
			kafkaPool: "ldir-prod",
			domains: {
				external: [
					{ name: "external.prod.ldir.cloud.nais.io" },
					{ name: "landbruksdirektoratet.no", default: true },
					{ name: "settogskutt.no" },
				],
				internal: ["prod.ldir.cloud.nais.io", "intern.landbruksdirektoratet.no"],
			},
			logDestinations: [{ id: "loki", default: true }],
			telemetryCollectorUrl: "https://telemetry.external.prod.ldir.cloud.nais.io/collect",
		},
	},
};

// nav's collector URLs are explicit overrides. dev-fss has none, like any
// environment without a collector (on-prem is not published at all).
const navFixture: TenantData = {
	tenant: "nav",
	domain: "nav.no",
	environments: {
		dev: {
			tenant: "nav",
			env: "dev",
			externalIps: ["35.228.4.248"],
			kafkaPool: "nav-dev",
			domains: {
				external: [
					{ name: "external.dev-gcp.nav.cloud.nais.io" },
					{ name: "ekstern.dev.nav.no" },
					{ name: "external.dev.nav.cloud.nais.io" },
					{ name: "ansatt.dev.nav.no" },
					{ name: "authenticated.dev-gcp.nav.cloud.nais.io" },
				],
				internal: ["dev-gcp.nav.cloud.nais.io", "dev.nav.cloud.nais.io", "intern.dev.nav.no"],
			},
			telemetryCollectorUrl: "https://telemetry.ekstern.dev.nav.no/collect",
		},
		prod: {
			tenant: "nav",
			env: "prod",
			externalIps: ["35.228.235.189"],
			kafkaPool: "nav-prod",
			domains: {
				external: [
					{ name: "external.prod.nav.cloud.nais.io" },
					{ name: "nav.no", default: true },
					{ name: "external.prod-gcp.nav.cloud.nais.io" },
					{ name: "workinnorway.no" },
					{ name: "authenticated.prod.nav.cloud.nais.io" },
					{ name: "authenticated.prod-gcp.nav.cloud.nais.io" },
					{ name: "ansatt.nav.no" },
				],
				internal: ["prod.nav.cloud.nais.io", "prod-gcp.nav.cloud.nais.io", "intern.nav.no"],
			},
			telemetryCollectorUrl: "https://telemetry.nav.no/collect",
		},
		"dev-fss": {
			tenant: "nav",
			env: "dev-fss",
			externalIps: [],
			kafkaPool: null,
		},
	},
};

describe("tenant-backed telemetry documentation", () => {
	const frontendPage = document("observability/frontend/README.md");
	const referencePage = document("observability/frontend/reference/auto-configuration.md");
	const setupPage = document("observability/frontend/how-to/setup-faro.md");
	const nextjsPage = document("observability/frontend/how-to/setup-nextjs.md");
	const troubleshootingPage = document("observability/frontend/reference/troubleshooting.md");

	test("collector URLs come from the tenant data", () => {
		setTenantData(ldirFixture);
		expect(render("<<telemetry_collectors()>>", "ldir")).toBe(
			[
				"| Environment | Collector endpoint |",
				"| --- | --- |",
				"| `non-prod` | `https://telemetry.external.non-prod.ldir.cloud.nais.io/collect` |",
				"| `prod` | `https://telemetry.external.prod.ldir.cloud.nais.io/collect` |",
			].join("\n"),
		);
	});

	test("explicit overrides are rendered as-is", () => {
		setTenantData(navFixture);
		const endpoints = render("<<telemetry_collectors()>>", "nav");
		expect(endpoints).toContain("https://telemetry.ekstern.dev.nav.no/collect");
		expect(endpoints).toContain("https://telemetry.nav.no/collect");
	});

	test("environments without a collector URL are omitted", () => {
		setTenantData(navFixture);
		expect(render("<<telemetry_collectors()>>", "nav")).not.toContain("fss");
	});

	test("examples prefer the production environment", () => {
		setTenantData(ldirFixture);
		expect(render("<<telemetry_collector_url()>>", "ldir")).toBe(
			"https://telemetry.external.prod.ldir.cloud.nais.io/collect",
		);
		expect(render("<<telemetry_environment()>>", "ldir")).toBe("prod");
	});

	test("CSP sources are unique origins only", () => {
		setTenantData(ldirFixture);
		expect(render("<<telemetry_csp_sources()>>", "ldir")).toBe(
			"https://telemetry.external.non-prod.ldir.cloud.nais.io https://telemetry.external.prod.ldir.cloud.nais.io",
		);
	});

	test("missing tenant data renders placeholders instead of failing", () => {
		setTenantData(null);
		expect(render("<<telemetry_collector_url()>>", "unknown-tenant")).toBe("<COLLECTOR_URL>");
		expect(render("<<telemetry_csp_sources()>>", "unknown-tenant")).toBe("<COLLECTOR_ORIGIN>");
		expect(render("<<telemetry_environment()>>", "unknown-tenant")).toBe("<ENVIRONMENT>");
		expect(render("<<telemetry_collectors()>>", "unknown-tenant")).toContain(
			"No collector endpoints are documented",
		);
	});

	test("migrated pages render from the same data", () => {
		setTenantData(ldirFixture);
		for (const page of [frontendPage, referencePage, setupPage, nextjsPage, troubleshootingPage]) {
			const rendered = render(page, "ldir");
			expect(rendered).not.toMatch(/<<\w+\(|\{%/);
			expect(rendered).toContain("https://telemetry.external.prod.ldir.cloud.nais.io");
			expect(rendered).not.toContain("<COLLECTOR_URL>");
		}
	});

	test("collector URLs cannot bypass tenant data through tenant_url()", () => {
		expect(() => render('<<tenant_url("telemetry.external.dev", "collect")>>', "novari")).toThrow(
			"Use telemetry_collector_url()",
		);
	});

	test("an unset tenant defaults to nav, matching local development", () => {
		delete process.env.TENANT;
		expect(processTemplates("<<tenant()>>")).toBe("nav");
	});
});

describe("environments reference page", () => {
	const environmentsPage = document("workloads/reference/environments.md");

	test("renders one section per environment from tenant data", () => {
		setTenantData(ldirFixture);
		const page = render(environmentsPage, "ldir");
		expect(page).not.toMatch(/<<\w+\(|\{%/);
		expect(page.indexOf("### non-prod")).toBeLessThan(page.indexOf("### prod"));
		// external.*.cloud.nais.io is the fallback and hidden when a dedicated domain exists
		expect(page).not.toContain("external.prod.ldir.cloud.nais.io");
		expect(page).toContain(
			"| landbruksdirektoratet.no | internet | ingress for applications exposed to internet.",
		);
		expect(page).toContain(
			"| intern.landbruksdirektoratet.no | [naisdevice][naisdevice] | ingress for internal applications |",
		);
		expect(page).toContain("- 34.88.126.246");
		expect(page).not.toContain("#### Observability");
	});

	test("keeps the external fallback when no dedicated domain exists", () => {
		setTenantData({
			tenant: "atil",
			domain: "arbeidstilsynet.no",
			environments: {
				dev: {
					tenant: "atil",
					env: "dev",
					externalIps: ["34.88.111.48"],
					kafkaPool: null,
					domains: {
						external: [
							{ name: "external.dev.atil.cloud.nais.io" },
							{ name: "authenticated.dev.atil.cloud.nais.io" },
						],
						internal: ["dev.atil.cloud.nais.io"],
					},
					logDestinations: [],
				},
			},
		});
		const page = render(environmentsPage, "atil");
		expect(page).toContain("| external.dev.atil.cloud.nais.io | internet |");
		// no ansatt.* dedicated domain, so the authenticated fallback stays
		expect(page).toContain("| authenticated.dev.atil.cloud.nais.io | internet |");
	});

	test("filters product domains, keeping the tenant's own domains", () => {
		setTenantData(ldirFixture);
		const page = render(environmentsPage, "ldir");
		expect(page).toContain("landbruksdirektoratet.no");
		expect(page).not.toContain("settogskutt.no");
	});

	test("does not filter domains when the tenant domain is unknown", () => {
		const noDomain: TenantData = {
			tenant: "ldir",
			environments: ldirFixture.environments,
		};
		setTenantData(noDomain);
		expect(render(environmentsPage, "ldir")).toContain("settogskutt.no");
	});

	test("renders a single shared observability section", () => {
		setTenantData(ldirFixture);
		const page = render(environmentsPage, "ldir");
		expect(page.match(/## Observability/g)).toHaveLength(1);
		expect(page).toContain("| logs (stdout)        | `loki` |");
		expect(page).toContain("| auto-instrumentation | `grafana-lgtm`");
	});

	test("renders the real log destination id in the shared section", () => {
		setTenantData({
			tenant: "ssb",
			environments: {
				prod: {
					tenant: "ssb",
					env: "prod",
					externalIps: ["34.88.222.166"],
					kafkaPool: null,
					domains: {
						external: [
							{ name: "external.prod.ssb.cloud.nais.io" },
							{ name: "ssb.no", default: true },
						],
						internal: ["prod.ssb.cloud.nais.io", "intern.ssb.no"],
					},
					logDestinations: [{ id: "team_logs", default: true }],
				},
			},
		});
		const page = render(environmentsPage, "ssb");
		expect(page).toContain("| logs (stdout)        | `team_logs` |");
	});

	test("default_log_destination prefers the prod environment", () => {
		setTenantData({
			tenant: "x",
			environments: {
				dev: {
					tenant: "x",
					env: "dev",
					externalIps: [],
					kafkaPool: null,
					logDestinations: [{ id: "team_logs", default: true }],
				},
				prod: {
					tenant: "x",
					env: "prod",
					externalIps: [],
					kafkaPool: null,
					logDestinations: [{ id: "loki", default: true }],
				},
			},
		});
		expect(render("<<default_log_destination()>>", "x")).toBe("loki");
	});

	test("renders a note and no observability section when the tenant has no environments", () => {
		setTenantData(null);
		const page = render(environmentsPage, "ci-nais");
		expect(page).toContain("No environments documented for this tenant yet.");
		expect(page).not.toContain("## Observability");
	});

	test("nav renders generated GCP sections plus the hand-written on-prem block", () => {
		setTenantData(navFixture);
		const page = render(environmentsPage, "nav");
		// GCP environments come from tenant data, classified and filtered
		expect(page).toContain("### dev");
		expect(page).toContain("- 35.228.4.248");
		expect(page).toContain("| nav.no | internet |");
		expect(page).toContain("| ansatt.nav.no | internet |");
		expect(page).toContain("| ekstern.dev.nav.no | internet |");
		expect(page).toContain("| prod.nav.cloud.nais.io | [naisdevice][naisdevice] |");
		// Product domains, legacy -gcp aliases, and fallbacks with dedicated counterparts are hidden
		expect(page).not.toContain("workinnorway.no");
		expect(page).not.toContain("-gcp.nav.cloud.nais.io");
		expect(page).not.toContain("authenticated.prod.nav.cloud.nais.io");
		expect(page).not.toContain("external.prod.nav.cloud.nais.io");
		// On-prem stays hand-written
		expect(page).toContain("## On-prem");
		expect(page).toContain("### prod-fss");
		expect(page).toContain("Requires [JITA][naisdevice-jita]");
		// One shared observability section after all clusters
		expect(page.match(/## Observability/g)).toHaveLength(1);
		expect(page.indexOf("### prod-fss")).toBeLessThan(page.indexOf("## Observability"));
	});
});
