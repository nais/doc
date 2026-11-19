export interface IngressDomain {
	name: string;
	access: string;
	description: string;
	ip?: string;
}

export interface TenantEnvironment {
	name: string;
	production: boolean;
	infrastructure: "gcp" | "on-prem";
	domains: IngressDomain[];
	outboundIps: string[];
	kubectlAccess?: string;
	logs: string;
	autoInstrumentation: string;
	telemetryCollectorUrl: string | null;
}

export interface TenantConfig {
	environments: TenantEnvironment[];
	notice?: string;
}

const publicIngress =
	"Ingress for applications exposed to the internet. URLs containing `/metrics`, `/actuator` or `/internal` are blocked.";
const internalIngress = "Ingress for internal applications.";
const deviceAccess = "[naisdevice]";
const navInternalAccess = "NAV internal networks (including [naisdevice])";
const employeeAccess = "internet, only for authenticated humans on compliant devices";
const developmentKubectl =
	"Kubectl access to the cluster is available through [naisdevice]. You can access all namespaces in the cluster, but you can only modify resources in your team's namespace.";
const productionKubectl =
	"Kubectl access to the cluster is available through [naisdevice]. You can only read or modify resources in your team's namespace.";
const onPremConnectivity =
	"See [How do I reach an application found on-premises from my application in GCP?][on-prem]";

export const tenants: Record<string, TenantConfig> = {
	nav: {
		environments: [
			{
				name: "dev-gcp",
				production: false,
				infrastructure: "gcp",
				domains: [
					{ name: "ekstern.dev.nav.no", access: "internet", description: publicIngress },
					{ name: "intern.dev.nav.no", access: navInternalAccess, description: "" },
					{ name: "ansatt.dev.nav.no", access: employeeAccess, description: publicIngress },
				],
				outboundIps: ["35.228.4.248", "34.88.219.93", "35.228.165.176"],
				kubectlAccess: developmentKubectl,
				logs: "loki",
				autoInstrumentation: "grafana-lgtm",
				telemetryCollectorUrl: "https://telemetry.ekstern.dev.nav.no/collect",
			},
			{
				name: "prod-gcp",
				production: true,
				infrastructure: "gcp",
				domains: [
					{ name: "nav.no", access: "internet", description: publicIngress },
					{ name: "intern.nav.no", access: navInternalAccess, description: "" },
					{ name: "ansatt.nav.no", access: employeeAccess, description: publicIngress },
				],
				outboundIps: ["35.228.235.189", "35.228.12.134", "35.228.189.194"],
				kubectlAccess: productionKubectl,
				logs: "loki",
				autoInstrumentation: "grafana-lgtm",
				telemetryCollectorUrl: "https://telemetry.nav.no/collect",
			},
			{
				name: "dev-fss",
				production: false,
				infrastructure: "on-prem",
				domains: [
					{
						name: "intern.dev.nav.no",
						access: deviceAccess,
						description:
							"Development ingress for internal applications. Also available in dev-gcp, use this to ease migration.",
					},
					{ name: "dev-fss-pub.nais.io", access: "GCP", description: onPremConnectivity },
				],
				outboundIps: [],
				kubectlAccess: developmentKubectl,
				logs: "loki",
				autoInstrumentation: "grafana-lgtm",
				telemetryCollectorUrl: null,
			},
			{
				name: "prod-fss",
				production: true,
				infrastructure: "on-prem",
				domains: [
					{
						name: "intern.nav.no",
						access: deviceAccess,
						description:
							"Ingress for internal applications (supersedes nais.adeo.no). Also available in prod-gcp, use this to ease migration. Requires [JITA][naisdevice-jita] to `onprem-k8s-prod`.",
					},
					{ name: "prod-fss-pub.nais.io", access: "GCP", description: onPremConnectivity },
				],
				outboundIps: ["155.55.65.50 (with webproxy)", "155.55.51.x/24 (without webproxy)"],
				kubectlAccess:
					"Kubectl access to the cluster is available through [naisdevice] with just in time access ([JITA][naisdevice-jita]). You can only read or modify resources in your team's namespace.",
				logs: "loki",
				autoInstrumentation: "grafana-lgtm",
				telemetryCollectorUrl: null,
			},
		],
	},
	ssb: {
		environments: [
			{
				name: "test",
				production: false,
				infrastructure: "gcp",
				domains: [
					{
						name: "external.test.ssb.cloud.nais.io",
						access: "internet",
						description: publicIngress,
					},
					{ name: "test.ssb.no", access: "internet", description: publicIngress },
					{ name: "test.ssb.cloud.nais.io", access: deviceAccess, description: internalIngress },
					{ name: "intern.test.ssb.no", access: deviceAccess, description: internalIngress },
				],
				outboundIps: ["35.228.178.170"],
				logs: "team-logs",
				autoInstrumentation: "Not enabled",
				telemetryCollectorUrl: "https://telemetry.external.test.ssb.cloud.nais.io/collect",
			},
			{
				name: "prod",
				production: true,
				infrastructure: "gcp",
				domains: [
					{
						name: "external.prod.ssb.cloud.nais.io",
						access: "internet",
						description: publicIngress,
					},
					{ name: "ssb.no", access: "internet", description: publicIngress },
					{ name: "prod.ssb.cloud.nais.io", access: deviceAccess, description: internalIngress },
					{ name: "intern.ssb.no", access: deviceAccess, description: internalIngress },
				],
				outboundIps: ["34.88.222.166"],
				logs: "team-logs",
				autoInstrumentation: "Not enabled",
				telemetryCollectorUrl: "https://telemetry.external.prod.ssb.cloud.nais.io/collect",
			},
		],
	},
	atil: {
		environments: [
			{
				name: "dev",
				production: false,
				infrastructure: "gcp",
				domains: [
					{
						name: "external.dev.atil.cloud.nais.io",
						access: "internet",
						description: publicIngress,
						ip: "130.211.21.180/32",
					},
					{ name: "dev.atil.cloud.nais.io", access: deviceAccess, description: internalIngress },
				],
				outboundIps: ["34.88.111.48"],
				logs: "loki",
				autoInstrumentation: "grafana-lgtm",
				telemetryCollectorUrl: "https://telemetry.external.dev.atil.cloud.nais.io/collect",
			},
			{
				name: "prod",
				production: true,
				infrastructure: "gcp",
				domains: [
					{
						name: "external.prod.atil.cloud.nais.io",
						access: "internet",
						description: publicIngress,
						ip: "34.111.208.235/32",
					},
					{ name: "prod.atil.cloud.nais.io", access: deviceAccess, description: internalIngress },
				],
				outboundIps: ["34.88.243.178"],
				logs: "loki",
				autoInstrumentation: "grafana-lgtm",
				telemetryCollectorUrl: "https://telemetry.external.prod.atil.cloud.nais.io/collect",
			},
		],
	},
	ldir: {
		environments: [
			{
				name: "non-prod",
				production: false,
				infrastructure: "gcp",
				domains: [
					{
						name: "external.non-prod.ldir.cloud.nais.io",
						access: "internet",
						description: publicIngress,
					},
					{
						name: "non-prod.landbruksdirektoratet.no",
						access: "internet",
						description: publicIngress,
					},
					{
						name: "non-prod.ldir.cloud.nais.io",
						access: deviceAccess,
						description: internalIngress,
					},
					{
						name: "intern.non-prod.landbruksdirektoratet.no",
						access: deviceAccess,
						description: internalIngress,
					},
				],
				outboundIps: ["34.88.202.181"],
				logs: "loki",
				autoInstrumentation: "grafana-lgtm",
				telemetryCollectorUrl: "https://telemetry.external.non-prod.ldir.cloud.nais.io/collect",
			},
			{
				name: "prod",
				production: true,
				infrastructure: "gcp",
				domains: [
					{
						name: "external.prod.ldir.cloud.nais.io",
						access: "internet",
						description: publicIngress,
					},
					{ name: "landbruksdirektoratet.no", access: "internet", description: publicIngress },
					{ name: "prod.ldir.cloud.nais.io", access: deviceAccess, description: internalIngress },
					{
						name: "intern.landbruksdirektoratet.no",
						access: deviceAccess,
						description: internalIngress,
					},
				],
				outboundIps: ["34.88.126.246"],
				logs: "loki",
				autoInstrumentation: "grafana-lgtm",
				telemetryCollectorUrl: "https://telemetry.external.prod.ldir.cloud.nais.io/collect",
			},
		],
	},
	miljodir: {
		environments: [
			{
				name: "non-prod",
				production: false,
				infrastructure: "gcp",
				domains: [
					{
						name: "external.non-prod.miljodir.cloud.nais.io",
						access: "internet",
						description: publicIngress,
					},
					{
						name: "non-prod.miljodir.cloud.nais.io",
						access: deviceAccess,
						description: internalIngress,
					},
				],
				outboundIps: ["34.88.160.181"],
				logs: "loki",
				autoInstrumentation: "grafana-lgtm",
				telemetryCollectorUrl: "https://telemetry.external.non-prod.miljodir.cloud.nais.io/collect",
			},
		],
	},
	novari: {
		environments: [
			{
				name: "test",
				production: false,
				infrastructure: "gcp",
				domains: [
					{
						name: "external.test.novari.cloud.nais.io",
						access: "internet",
						description: publicIngress,
					},
					{ name: "test.novari.cloud.nais.io", access: deviceAccess, description: internalIngress },
				],
				outboundIps: ["34.88.140.75"],
				logs: "loki",
				autoInstrumentation: "grafana-lgtm",
				telemetryCollectorUrl: "https://telemetry.external.test.novari.cloud.nais.io/collect",
			},
			{
				name: "prod",
				production: true,
				infrastructure: "gcp",
				domains: [
					{ name: "external.novari.cloud.nais.io", access: "internet", description: publicIngress },
					{ name: "novari.cloud.nais.io", access: deviceAccess, description: internalIngress },
				],
				outboundIps: ["35.228.121.133"],
				logs: "loki",
				autoInstrumentation: "grafana-lgtm",
				telemetryCollectorUrl: "https://telemetry.external.prod.novari.cloud.nais.io/collect",
			},
		],
	},
	"ks-digital": {
		environments: [
			{
				name: "dev",
				production: false,
				infrastructure: "gcp",
				domains: [
					{
						name: "external.dev.ks-digital.cloud.nais.io",
						access: "internet",
						description: publicIngress,
					},
					{
						name: "dev.ks-digital.cloud.nais.io",
						access: deviceAccess,
						description: internalIngress,
					},
				],
				outboundIps: ["34.88.181.201"],
				logs: "loki",
				autoInstrumentation: "grafana-lgtm",
				telemetryCollectorUrl: "https://telemetry.external.dev.ks-digital.cloud.nais.io/collect",
			},
			{
				name: "prod",
				production: true,
				infrastructure: "gcp",
				domains: [
					{
						name: "external.ks-digital.cloud.nais.io",
						access: "internet",
						description: publicIngress,
					},
					{ name: "ks-digital.cloud.nais.io", access: deviceAccess, description: internalIngress },
				],
				outboundIps: ["35.228.214.218"],
				logs: "loki",
				autoInstrumentation: "grafana-lgtm",
				telemetryCollectorUrl: "https://telemetry.external.prod.ks-digital.cloud.nais.io/collect",
			},
		],
	},
	"test-nais": {
		environments: [
			{
				name: "sandbox",
				production: false,
				infrastructure: "gcp",
				domains: [
					{
						name: "external.sandbox.test-nais.cloud.nais.io",
						access: "internet",
						description: publicIngress,
					},
					{
						name: "sandbox.test-nais.cloud.nais.io",
						access: deviceAccess,
						description: internalIngress,
					},
				],
				outboundIps: ["34.88.109.100"],
				logs: "loki",
				autoInstrumentation: "grafana-lgtm",
				telemetryCollectorUrl: "https://telemetry.external.sandbox.test-nais.cloud.nais.io/collect",
			},
		],
	},
	"ci-nais": {
		environments: [],
		notice: "Environments and collector endpoints for this tenant are not documented yet.",
	},
	"dev-nais": {
		environments: [],
		notice: "Environments and collector endpoints for this tenant are not documented yet.",
	},
};

export function getTenantConfig(name: string): TenantConfig {
	if (!Object.hasOwn(tenants, name)) {
		throw new Error(`Unknown tenant "${name}". Add its environments to src/lib/tenants.ts.`);
	}
	const config = tenants[name];
	if (config.environments.length === 0 && !config.notice) {
		throw new Error(`Tenant "${name}" needs environments or an explicit documentation notice.`);
	}
	const names = new Set<string>();
	for (const environment of config.environments) {
		if (!environment.name || names.has(environment.name)) {
			throw new Error(`Missing or duplicate environment name for tenant "${name}".`);
		}
		names.add(environment.name);
		if (environment.telemetryCollectorUrl === null) continue;
		let url: URL;
		try {
			url = new URL(environment.telemetryCollectorUrl);
		} catch {
			throw new Error(`Invalid collector URL for "${name}/${environment.name}".`);
		}
		if (
			environment.infrastructure === "on-prem" ||
			url.protocol !== "https:" ||
			url.pathname !== "/collect" ||
			url.username ||
			url.password ||
			url.search ||
			url.hash
		) {
			throw new Error(`Invalid collector URL for "${name}/${environment.name}".`);
		}
	}
	return config;
}
