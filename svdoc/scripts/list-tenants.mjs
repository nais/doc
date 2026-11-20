#!/usr/bin/env node
/**
 * Lists the tenants that publish docs data to the public nais-tenant-data
 * bucket (written by nais-terraform-modules on apply).
 *
 * Usage:
 *   list-tenants.mjs          → JSON: { "tenants": [{ "name", "docBuckets" }] }
 *   list-tenants.mjs --names  → space-separated tenant names (for mise build)
 *   list-tenants.mjs --matrix → GitHub Actions matrix, one entry per publish bucket
 */

const BUCKET = "nais-tenant-data";
const API_BASE = `https://storage.googleapis.com/storage/v1/b/${BUCKET}/o`;
const MEDIA_BASE = `https://storage.googleapis.com/${BUCKET}`;

const listResponse = await fetch(`${API_BASE}?prefix=docs/`);
if (!listResponse.ok) {
	console.error(`Failed to list bucket: ${listResponse.status}`);
	process.exit(1);
}
const listing = await listResponse.json();

const names = [
	...new Set(
		(listing.items ?? [])
			.map((item) => item.name)
			.filter((name) => /^docs\/[^/]+\/[^/]+\.json$/.test(name))
			.map((name) => name.split("/")[1]),
	),
].sort();

const tenants = [];
for (const name of names) {
	let docBuckets;
	try {
		const response = await fetch(`${MEDIA_BASE}/docs/${name}/tenant.json`);
		if (!response.ok) throw new Error(`${response.status}`);
		docBuckets = (await response.json()).docBuckets;
	} catch {
		// tenant.json not written yet (management not applied); fall back to convention
	}
	tenants.push({ name, docBuckets: docBuckets ?? [`doc.${name}.cloud.nais.io`] });
}

if (process.argv.includes("--names")) {
	console.log(tenants.map((t) => t.name).join(" "));
} else if (process.argv.includes("--matrix")) {
	const include = tenants.flatMap((t) =>
		t.docBuckets.map((bucket) => ({ tenant: t.name, bucket })),
	);
	console.log(JSON.stringify({ include }));
} else {
	console.log(JSON.stringify({ tenants }, null, 2));
}
