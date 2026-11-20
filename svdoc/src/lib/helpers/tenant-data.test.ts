import { afterEach, describe, expect, test, vi } from "vitest";
import { getTenantData, initTenantData, setTenantData } from "./tenant-data.ts";

const originalTenant = process.env.TENANT;

afterEach(() => {
	setTenantData(null);
	vi.unstubAllGlobals();
	if (originalTenant === undefined) {
		delete process.env.TENANT;
	} else {
		process.env.TENANT = originalTenant;
	}
});

function stubFetch() {
	const listing = {
		items: [{ name: "docs/ldir/tenant.json" }, { name: "docs/ldir/prod.json" }],
	};
	const objects: Record<string, unknown> = {
		"docs/ldir/tenant.json": {
			tenant: "ldir",
			domain: "landbruksdirektoratet.no",
			consoleUrl: "console.ldir.cloud.nais.io",
			docBuckets: ["doc.ldir.cloud.nais.io"],
		},
		"docs/ldir/prod.json": {
			tenant: "ldir",
			env: "prod",
			externalIps: ["34.88.126.246"],
			kafkaPool: "ldir-prod",
		},
	};
	vi.stubGlobal(
		"fetch",
		vi.fn(async (input: string | URL | Request) => {
			const url = String(input);
			if (url.includes("/storage/v1/")) {
				return new Response(JSON.stringify(listing), { status: 200 });
			}
			const name = url.split("nais-tenant-data/")[1];
			if (name && name in objects) {
				return new Response(JSON.stringify(objects[name]), { status: 200 });
			}
			return new Response("not found", { status: 404 });
		}),
	);
}

describe("initTenantData", () => {
	test("loads tenant.json metadata and environment objects", async () => {
		process.env.TENANT = "ldir";
		stubFetch();
		await initTenantData();
		const data = getTenantData();
		expect(data.domain).toBe("landbruksdirektoratet.no");
		expect(data.docBuckets).toEqual(["doc.ldir.cloud.nais.io"]);
		expect(data.environments.prod.externalIps).toEqual(["34.88.126.246"]);
		expect(data.environments.prod.kafkaPool).toBe("ldir-prod");
	});

	test("missing data yields empty environments instead of failing", async () => {
		process.env.TENANT = "unknown";
		vi.stubGlobal(
			"fetch",
			vi.fn(async () => new Response("nope", { status: 404 })),
		);
		await initTenantData();
		expect(getTenantData().environments).toEqual({});
	});
});
