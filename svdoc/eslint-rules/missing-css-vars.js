import fs from "node:fs";
import path from "node:path";

const INCLUDE_EXTENSIONS = new Set([".svelte", ".ts", ".js", ".css", ".scss"]);
const EXTRA_DEF_DIRS = ["node_modules/@navikt"];
const USED_VAR_PATTERN = /var\(--([a-zA-Z0-9-_]+)\)/g;
const DEFINED_VAR_PATTERN = /--([a-zA-Z0-9-_]+)\s*:/g;
const STYLE_SET_PROP_PATTERN = /style\.setProperty\(\s*['"]--([a-zA-Z0-9-_]+)['"]/g;
const SVELTE_STYLE_BINDING_PATTERN = /style:--([a-zA-Z0-9-_]+)=/g;
const KNOWN_DYNAMIC_VARS = new Set(["bg-color", "background", "size", "chat-panel-width"]);

function walkFiles(dir, callback) {
	if (!fs.existsSync(dir)) return;

	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const fullPath = path.join(dir, entry.name);

		if (entry.isDirectory()) {
			walkFiles(fullPath, callback);
			continue;
		}

		if (entry.isFile() && INCLUDE_EXTENSIONS.has(path.extname(fullPath))) {
			callback(fullPath);
		}
	}
}

function collectMissingCssVars(projectRoot) {
	const srcDir = path.join(projectRoot, "src");
	const extraDefDirs = EXTRA_DEF_DIRS.map((dir) => path.join(projectRoot, dir));
	const usedVars = new Map();
	const definedVars = new Set();

	function addUsedVar(varName, filePath) {
		if (!usedVars.has(varName)) {
			usedVars.set(varName, new Set());
		}
		usedVars.get(varName).add(filePath);
	}

	function analyzeUsedVars(filePath) {
		const content = fs.readFileSync(filePath, "utf-8");

		for (const match of content.matchAll(USED_VAR_PATTERN)) {
			addUsedVar(match[1], filePath);
		}

		for (const match of content.matchAll(STYLE_SET_PROP_PATTERN)) {
			addUsedVar(match[1], filePath);
		}

		for (const match of content.matchAll(SVELTE_STYLE_BINDING_PATTERN)) {
			addUsedVar(match[1], filePath);
		}
	}

	function analyzeDefinedVars(filePath) {
		const content = fs.readFileSync(filePath, "utf-8");

		for (const match of content.matchAll(DEFINED_VAR_PATTERN)) {
			definedVars.add(match[1]);
		}
	}

	walkFiles(srcDir, analyzeUsedVars);
	walkFiles(srcDir, analyzeDefinedVars);

	for (const dir of extraDefDirs) {
		walkFiles(dir, analyzeDefinedVars);
	}

	const missingVars = [];
	for (const [varName, files] of usedVars.entries()) {
		if (!definedVars.has(varName) && !KNOWN_DYNAMIC_VARS.has(varName)) {
			missingVars.push({
				variable: `--${varName}`,
				usedIn: Array.from(files)
					.map((file) => path.relative(projectRoot, file))
					.sort(),
			});
		}
	}

	return missingVars.sort((a, b) => a.variable.localeCompare(b.variable));
}

export default {
	meta: {
		type: "problem",
		docs: {
			description: "Report CSS custom properties used in src that are not defined",
		},
		schema: [],
	},

	create(context) {
		const filename = context.filename ?? context.getFilename?.() ?? "";
		const projectRoot = path.dirname(filename);

		if (path.basename(filename) !== "eslint.config.js") {
			return {};
		}

		return {
			"Program:exit"() {
				const missingVars = collectMissingCssVars(projectRoot);

				for (const entry of missingVars) {
					context.report({
						loc: { line: 1, column: 0 },
						message: `${entry.variable} is used but not defined. Used in: ${entry.usedIn.join(", ")}`,
					});
				}
			},
		};
	},
};
