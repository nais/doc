/**
 * Tenant data published by nais-terraform-modules to the public
 * `nais-tenant-data` GCS bucket. Each tenant writes:
 *
 *   docs/<tenant>/tenant.json  — { tenant, domain, consoleUrl, docBuckets }
 *   docs/<tenant>/<env>.json   — { tenant, env, externalIps, kafkaPool }
 *
 * The docs build fetches these at build time so values like outbound IPs and
 * Kafka pools stay in sync with what Terraform has applied.
 */

export interface EnvironmentData {
	tenant: string;
	env: string;
	externalIps: string[];
	kafkaPool: string | null;
	domains?: {
		external: { name: string; default?: boolean }[];
		internal: string[];
	};
	logDestinations?: { id: string; default: boolean }[];
	telemetryCollectorUrl?: string | null;
}

export interface TenantData {
	tenant: string;
	domain?: string;
	consoleUrl?: string;
	docBuckets?: string[];
	managementProjectId?: string;
	identityProvider?: string;
	deployDataPublished?: boolean;
	otlpInternetEndpoint?: string;
	environments: Record<string, EnvironmentData>;
}

const BUCKET = "nais-tenant-data";
const MEDIA_BASE = `https://storage.googleapis.com/${BUCKET}`;
const API_BASE = `https://storage.googleapis.com/storage/v1/b/${BUCKET}/o`;

let cache: TenantData | null = null;

function tenant(): string {
	return process.env.TENANT || "tenant";
}

function emptyTenantData(): TenantData {
	return { tenant: tenant(), environments: {} };
}

/**
 * Load tenant data for the current build. Memoized: only the first call
 * performs network requests. Never rejects — missing data (new tenant not
 * applied yet, offline local dev) yields empty data so the build goes on.
 */
export async function initTenantData(): Promise<TenantData> {
	if (cache) {
		return cache;
	}
	cache = await fetchTenantData();
	return cache;
}

/** Synchronous access for the template engine; call initTenantData() first. */
export function getTenantData(): TenantData {
	return cache ?? emptyTenantData();
}

/** Test hook: inject tenant data (or reset with null) without network. */
export function setTenantData(data: TenantData | null): void {
	cache = data;
}

async function fetchTenantData(): Promise<TenantData> {
	const data = emptyTenantData();
	const prefix = `docs/${data.tenant}/`;
	try {
		const listResponse = await fetch(`${API_BASE}?prefix=${prefix}`);
		if (!listResponse.ok) {
			throw new Error(`bucket listing failed: ${listResponse.status}`);
		}
		const listing = (await listResponse.json()) as { items?: { name: string }[] };

		for (const item of listing.items ?? []) {
			const response = await fetch(`${MEDIA_BASE}/${item.name}`);
			if (!response.ok) {
				continue;
			}
			const json = await response.json();
			if (item.name === `${prefix}tenant.json`) {
				data.domain = json.domain;
				data.consoleUrl = json.consoleUrl;
				data.docBuckets = json.docBuckets;
				data.managementProjectId = json.managementProjectId;
				data.identityProvider = json.identityProvider;
				data.deployDataPublished = json.deployDataPublished;
				data.otlpInternetEndpoint = json.otlpInternetEndpoint;
			} else if (typeof json.env === "string") {
				data.environments[json.env] = json;
			}
		}
	} catch (error) {
		console.warn(`tenant-data: no data for tenant "${data.tenant}" (${error})`);
	}
	return data;
}
