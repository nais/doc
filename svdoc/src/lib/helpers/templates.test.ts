import { afterEach, describe, expect, test } from "bun:test";
import { processTemplates } from "./templates.ts";

const originalTenant = process.env.TENANT;

afterEach(() => {
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

interface Case {
	name: string;
	tenant: string;
	input: string;
	expected: string;
}

describe("variables", () => {
	const cases: Case[] = [
		{
			name: "tenant()",
			tenant: "nav",
			input: "console.<<tenant()>>.cloud.nais.io",
			expected: "console.nav.cloud.nais.io",
		},
		{
			name: "tenant_url() with path",
			tenant: "test-nais",
			input: '<<tenant_url("console", "team")>>',
			expected: "https://console.test-nais.cloud.nais.io/team",
		},
		{
			name: "naisdevice_name()",
			tenant: "nav",
			input: "<<naisdevice_name()>>",
			expected: "naisdevice",
		},
		{
			name: "unknown function is left untouched",
			tenant: "nav",
			input: "<<no_such_function()>>",
			expected: "<<no_such_function()>>",
		},
	];

	for (const c of cases) {
		test(c.name, () => {
			expect(render(c.input, c.tenant)).toBe(c.expected);
		});
	}
});

describe("inline conditionals", () => {
	const input = 'hl_lines="28 {% if tenant() == "test-nais" %}41{% else %}35{% endif %}"';

	test("keeps surrounding text on the same line", () => {
		expect(render(input, "test-nais")).toBe('hl_lines="28 41"');
		expect(render(input, "nav")).toBe('hl_lines="28 35"');
	});

	test("does not consume the line it sits on", () => {
		const multiline = `a\n${input}\nb`;
		expect(render(multiline, "nav")).toBe('a\nhl_lines="28 35"\nb');
	});
});

describe("standalone block tags consume their own line", () => {
	const input = [
		"before",
		'{% if tenant() == "test-nais" %}',
		"inside",
		"{% endif %}",
		"after",
	].join("\n");

	test("true branch leaves no blank lines", () => {
		expect(render(input, "test-nais")).toBe("before\ninside\nafter");
	});

	test("false branch leaves no blank lines", () => {
		expect(render(input, "nav")).toBe("before\nafter");
	});
});

describe("indented block tags preserve body indentation", () => {
	// Tags carry the 4-space indent of an enclosing admonition. That indent
	// belongs to the tag line and must not leak onto the rendered body.
	const input = [
		"    steps:",
		"      - name: Build",
		"        with:",
		"          team: <MY-TEAM>",
		'    {% if tenant() == "test-nais" %}',
		"          project_id: nais-management-ddba",
		"    {% endif %}",
		"      - name: Deploy",
	].join("\n");

	test("body keeps its authored indentation", () => {
		expect(render(input, "test-nais")).toBe(
			[
				"    steps:",
				"      - name: Build",
				"        with:",
				"          team: <MY-TEAM>",
				"          project_id: nais-management-ddba",
				"      - name: Deploy",
			].join("\n"),
		);
	});

	test("omitted body leaves no stray indented blank line", () => {
		expect(render(input, "nav")).toBe(
			[
				"    steps:",
				"      - name: Build",
				"        with:",
				"          team: <MY-TEAM>",
				"      - name: Deploy",
			].join("\n"),
		);
	});
});

describe("elif and else on their own lines", () => {
	const input = [
		"a:",
		'{% if tenant() == "nav" %}',
		"  b: nav",
		'{% elif tenant() == "test-nais" %}',
		"  b: test",
		"{% else %}",
		"  b: other",
		"{% endif %}",
		"c: end",
	].join("\n");

	const cases: Case[] = [
		{ name: "if branch", tenant: "nav", input, expected: "a:\n  b: nav\nc: end" },
		{ name: "elif branch", tenant: "test-nais", input, expected: "a:\n  b: test\nc: end" },
		{ name: "else branch", tenant: "dev-nais", input, expected: "a:\n  b: other\nc: end" },
	];

	for (const c of cases) {
		test(c.name, () => {
			expect(render(c.input, c.tenant)).toBe(c.expected);
		});
	}
});

describe("explicit whitespace markers", () => {
	test("are redundant for standalone tags, which already consume their line", () => {
		const withMarkers = 'a\n{%- if tenant() == "nav" -%}\nb\n{%- endif -%}\nc';
		const withoutMarkers = 'a\n{% if tenant() == "nav" %}\nb\n{% endif %}\nc';
		expect(render(withMarkers, "nav")).toBe("a\nb\nc");
		expect(render(withoutMarkers, "nav")).toBe("a\nb\nc");
	});

	test("{%- strips whitespace before an inline opening tag", () => {
		expect(render('a {%- if tenant() == "nav" %}b{% endif %} c', "nav")).toBe("ab c");
	});

	test("-%} strips whitespace after an inline closing tag", () => {
		expect(render('a {% if tenant() == "nav" %}b{% endif -%} c', "nav")).toBe("a bc");
	});

	test("{%- on an inline closing tag trims the selected branch", () => {
		const input = [
			"!!! note",
			'    {% if tenant() == "nav" -%}',
			"    body",
			"    {%- endif %} tail",
		].join("\n");
		expect(render(input, "nav")).toBe("!!! note\n    body tail");
	});
});

describe("condition operators", () => {
	const cases: Case[] = [
		{
			name: "==",
			tenant: "nav",
			input: '{% if tenant() == "nav" %}yes{% else %}no{% endif %}',
			expected: "yes",
		},
		{
			name: "!=",
			tenant: "nav",
			input: '{% if tenant() != "nav" %}yes{% else %}no{% endif %}',
			expected: "no",
		},
		{
			name: "in tuple",
			tenant: "test-nais",
			input: '{% if tenant() in ("nav", "test-nais") %}yes{% else %}no{% endif %}',
			expected: "yes",
		},
		{
			name: "not",
			tenant: "nav",
			input: '{% if not tenant() == "ssb" %}yes{% else %}no{% endif %}',
			expected: "yes",
		},
	];

	for (const c of cases) {
		test(c.name, () => {
			expect(render(c.input, c.tenant)).toBe(c.expected);
		});
	}
});

describe("set statements", () => {
	test("defines a variable usable in conditions and output", () => {
		const input = '{% set thing = "kafka" %}<<thing>>';
		expect(render(input, "nav").trim()).toBe("kafka");
	});
});

describe("fenced code block inside an admonition", () => {
	// The regression that motivated line-consuming tags: a templated YAML
	// workflow nested inside a `???+ note` admonition must render as valid,
	// correctly indented YAML for every tenant.
	const input = [
		'???+ note ".github/workflows/main.yaml"',
		"",
		"    ```yaml",
		"    jobs:",
		"      build:",
		"        steps:",
		"          - uses: nais/docker-build-push@v0",
		"            with:",
		"              team: <MY-TEAM>",
		'    {% if tenant() == "test-nais" %}',
		"              project_id: nais-management-ddba",
		"    {% endif %}",
		"          - name: Deploy to Nais",
		"            run: nais apply .nais/app.yaml",
		"    ```",
	].join("\n");

	test("keeps the extra key indented under with:", () => {
		expect(render(input, "test-nais")).toContain(
			"              team: <MY-TEAM>\n              project_id: nais-management-ddba\n          - name: Deploy to Nais",
		);
	});

	test("leaves no blank line behind when the branch is omitted", () => {
		expect(render(input, "nav")).toContain(
			"              team: <MY-TEAM>\n          - name: Deploy to Nais",
		);
	});

	test("every line stays inside the 4-space admonition body", () => {
		for (const tenant of ["nav", "test-nais"]) {
			const lines = render(input, tenant).split("\n");
			const start = lines.indexOf("    ```yaml");
			const end = lines.indexOf("    ```", start + 1);
			for (const line of lines.slice(start + 1, end)) {
				expect(line.startsWith("    ")).toBe(true);
			}
		}
	});
});

describe("admonition helpers", () => {
	test("gcp_only renders only for nav", () => {
		expect(render('<<gcp_only("Kafka")>>', "nav")).toContain("!!! gcp-only");
		expect(render('<<gcp_only("Kafka")>>', "test-nais")).toBe("");
	});

	test("not_in_test_nais renders only for test-nais", () => {
		expect(render('<<not_in_test_nais("Kafka")>>', "test-nais")).toContain("!!! not-in-test-nais");
		expect(render('<<not_in_test_nais("Kafka")>>', "nav")).toBe("");
	});
});
