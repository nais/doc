import fm from "front-matter";
import { readdir } from "node:fs/promises";
import { parse as parseYaml } from "yaml";

export interface NavItem {
	title: string;
	href: string;
	children?: NavItem[];
}

export interface NavAttributes {
	title?: string;
}

type NavEntry = string | Record<string, string>;

/**
 * Read and parse a .pages file
 */
async function readPagesFile(dirPath: string): Promise<NavEntry[] | null> {
	try {
		const pagesPath = `${dirPath}/.pages`;
		const content = await Bun.file(pagesPath).text();
		const parsed = parseYaml(content) as { nav?: NavEntry[] };
		return parsed.nav || null;
	} catch {
		return null;
	}
}

/**
 * Extract title from a markdown file (frontmatter title or first heading)
 */
async function getMarkdownTitle(filePath: string): Promise<string | null> {
	try {
		const content = await Bun.file(filePath).text();
		const { attributes, body } = fm<NavAttributes>(content);

		// First try frontmatter title
		if (attributes.title) {
			return attributes.title;
		}

		// Then try first heading
		const headingMatch = body.match(/^#\s+(.+)$/m);
		if (headingMatch) {
			// Strip any markdown formatting like **bold** or :emoji:
			return headingMatch[1]
				.replace(/\*\*/g, "")
				.replace(/:[a-zA-Z0-9_+-]+:/g, "")
				.trim();
		}

		return null;
	} catch {
		return null;
	}
}

/**
 * Convert a filename or directory name to a title
 */
function filenameToTitle(name: string): string {
	// Remove .md extension
	const baseName = name.replace(/\.md$/, "");

	// Handle README as index
	if (baseName.toLowerCase() === "readme") {
		return "Overview";
	}

	// Convert kebab-case to Title Case
	return baseName
		.split("-")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}

/**
 * Convert a file/directory path to a URL href
 */
function pathToHref(basePath: string, name: string): string {
	// Remove docs prefix and .md extension
	const cleanBase = basePath.replace(/^\.\.\/docs\/?/, "/").replace(/\/$/, "");
	const cleanName = name.replace(/\.md$/, "").replace(/README$/i, "");

	if (cleanName === "") {
		return cleanBase || "/";
	}

	return `${cleanBase}/${cleanName}`.replace(/\/+/g, "/");
}

/**
 * Check if a path is a directory using fs
 */
async function isDirectory(path: string): Promise<boolean> {
	try {
		await readdir(path);
		return true;
	} catch {
		return false;
	}
}

/**
 * Check if a file exists
 */
async function fileExists(path: string): Promise<boolean> {
	try {
		await Bun.file(path).text();
		return true;
	} catch {
		return false;
	}
}

/**
 * Scan a directory for markdown files and subdirectories
 */
async function scanDirectory(dirPath: string): Promise<NavEntry[]> {
	try {
		const entries = await readdir(dirPath, { withFileTypes: true });
		const navEntries: NavEntry[] = [];

		for (const entry of entries) {
			// Skip hidden files and .pages
			if (entry.name.startsWith(".")) {
				continue;
			}

			if (entry.isDirectory()) {
				navEntries.push(entry.name);
			} else if (entry.name.endsWith(".md") && entry.name.toLowerCase() !== "readme.md") {
				navEntries.push(entry.name);
			}
		}

		// Sort alphabetically
		return navEntries.sort((a, b) => {
			const nameA = typeof a === "string" ? a : Object.values(a)[0];
			const nameB = typeof b === "string" ? b : Object.values(b)[0];
			return nameA.localeCompare(nameB);
		});
	} catch {
		return [];
	}
}

/**
 * Build navigation tree for a directory
 */
async function buildNavForDirectory(dirPath: string, depth: number = 0): Promise<NavItem[]> {
	// First try to read .pages file, otherwise scan directory
	let nav = await readPagesFile(dirPath);

	if (!nav) {
		// No .pages file - scan the directory
		nav = await scanDirectory(dirPath);
	}

	if (!nav || nav.length === 0) {
		return [];
	}

	const items: NavItem[] = [];

	for (const entry of nav) {
		// Skip empty entries (separators in mkdocs)
		if (entry === "" || (typeof entry === "object" && Object.keys(entry)[0] === "")) {
			continue;
		}

		// Skip ... (catch-all)
		if (entry === "...") {
			continue;
		}

		let title: string;
		let path: string;

		if (typeof entry === "string") {
			// Simple entry like "nais.md" or "explanations"
			path = entry;
			title = filenameToTitle(entry);
		} else {
			// Object entry like { "Home": "README.md" } or { "💡 Explanations": "explanations" }
			const key = Object.keys(entry)[0];
			title = key;
			path = entry[key];
		}

		// Skip README.md entries that would duplicate the parent directory link
		// But keep them if they have an explicit title (like "Home: README.md")
		if (
			(path === "README.md" || path.toLowerCase() === "readme.md") &&
			title === filenameToTitle(path)
		) {
			continue;
		}

		const fullPath = `${dirPath}/${path}`;
		const isDir = await isDirectory(fullPath);

		if (isDir) {
			// It's a directory - recurse
			const children = await buildNavForDirectory(fullPath, depth + 1);

			// Try to get title from README.md if not explicitly set
			if (title === filenameToTitle(path)) {
				const readmeTitle = await getMarkdownTitle(`${fullPath}/README.md`);
				if (readmeTitle) {
					title = readmeTitle;
				}
			}

			items.push({
				title,
				href: pathToHref(dirPath, path),
				children: children.length > 0 ? children : undefined,
			});
		} else {
			// It's a file
			const mdPath = path.endsWith(".md") ? fullPath : `${fullPath}.md`;

			// Check if file exists
			if (!(await fileExists(mdPath))) {
				continue;
			}

			// Try to get title from file
			const fileTitle = await getMarkdownTitle(mdPath);
			if (fileTitle && title === filenameToTitle(path)) {
				title = fileTitle;
			}

			items.push({
				title,
				href: pathToHref(dirPath, path),
			});
		}
	}

	return items;
}

/**
 * Build the complete navigation tree from the docs directory
 */
export async function buildNavigation(): Promise<NavItem[]> {
	return buildNavForDirectory("../docs");
}
