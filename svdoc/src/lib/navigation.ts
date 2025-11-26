import fm from "front-matter";
import { readdir } from "node:fs/promises";
import { parse as parseYaml } from "yaml";
import { IGNORED_DIRECTORIES } from "./constants";

export interface NavItem {
	title: string;
	href: string;
	children?: NavItem[];
	hasContent: boolean;
}

/**
 * Extract all paths from a navigation tree (for static site generation)
 */
function extractPaths(items: NavItem[]): string[] {
	const paths: string[] = [];

	for (const item of items) {
		// Add this item's path (remove leading slash for route params)
		const path = item.href.replace(/^\//, "");
		paths.push(path);

		// Recursively extract paths from children
		if (item.children) {
			paths.push(...extractPaths(item.children));
		}
	}

	return paths;
}

/**
 * Get all page paths for static prerendering
 */
export async function getAllPaths(): Promise<string[]> {
	const navigation = await buildNavigation();
	const paths = extractPaths(navigation);

	// Add root path (empty string maps to /)
	paths.unshift("");

	return paths;
}

export interface NavAttributes {
	title?: string;
}

type NavEntry = string | Record<string, string>;

interface PagesFile {
	nav?: NavEntry[];
	hide?: boolean;
}

/**
 * Read and parse a .pages file
 */
async function readPagesFile(dirPath: string): Promise<PagesFile | null> {
	try {
		const pagesPath = `${dirPath}/.pages`;
		const content = await Bun.file(pagesPath).text();
		const parsed = parseYaml(content) as PagesFile;
		return parsed;
	} catch {
		return null;
	}
}

/**
 * Check if a directory should be hidden from navigation
 */
async function isHiddenDirectory(dirPath: string): Promise<boolean> {
	const pagesFile = await readPagesFile(dirPath);
	return pagesFile?.hide === true;
}

/**
 * Get all files and directories in a directory
 */
async function getDirectoryContents(dirPath: string): Promise<string[]> {
	try {
		const entries = await readdir(dirPath, { withFileTypes: true });
		return entries
			.filter((entry) => {
				// Skip hidden files and .pages
				if (entry.name.startsWith(".")) return false;
				// Skip ignored directories
				if (IGNORED_DIRECTORIES.has(entry.name.toLowerCase())) return false;
				// Include directories and .md files
				return entry.isDirectory() || entry.name.endsWith(".md");
			})
			.map((entry) => entry.name)
			.sort();
	} catch {
		return [];
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
 * Check if a directory has a README.md file
 */
async function hasReadme(dirPath: string): Promise<boolean> {
	try {
		const readme = Bun.file(`${dirPath}/README.md`);
		await readme.text();
		return true;
	} catch {
		return false;
	}
}

/**
 * Check if a path is a directory
 */
async function isDirectory(path: string): Promise<boolean> {
	try {
		const file = Bun.file(`${path}/.pages`);
		await file.text();
		return true;
	} catch {
		// Check if it's a directory by trying to read README.md
		try {
			const readme = Bun.file(`${path}/README.md`);
			await readme.text();
			return true;
		} catch {
			// Try listing directory contents as final check
			try {
				const contents = await readdir(path);
				return contents.length > 0;
			} catch {
				return false;
			}
		}
	}
}

/**
 * Get the path from a nav entry
 */
function getPathFromEntry(entry: NavEntry): string {
	if (typeof entry === "string") {
		return entry;
	}
	return Object.values(entry)[0];
}

/**
 * Process a single nav item (file or directory)
 */
async function processNavItem(
	dirPath: string,
	path: string,
	explicitTitle: string | null,
): Promise<NavItem | null> {
	const fullPath = `${dirPath}/${path}`;
	const isDir = await isDirectory(fullPath);

	// Skip hidden directories
	if (isDir && (await isHiddenDirectory(fullPath))) {
		return null;
	}
	// Use explicit title if provided, otherwise use directory/filename converted to title case
	// Don't use README heading - MkDocs uses directory name for nav
	let title = explicitTitle || filenameToTitle(path);

	if (isDir) {
		// It's a directory - recurse
		const children = await buildNavForDirectory(fullPath);

		// Check if directory has a README.md (has content)
		const dirHasContent = await hasReadme(fullPath);

		return {
			title,
			href: pathToHref(dirPath, path),
			children: children.length > 0 ? children : undefined,
			hasContent: dirHasContent,
		};
	} else {
		// It's a file - get title from the file itself
		const mdPath = path.endsWith(".md") ? fullPath : `${fullPath}.md`;

		// Try to get title from file (frontmatter or first heading)
		if (!explicitTitle) {
			const fileTitle = await getMarkdownTitle(mdPath);
			if (fileTitle) {
				title = fileTitle;
			}
		}

		return {
			title,
			href: pathToHref(dirPath, path),
			hasContent: true,
		};
	}
}

/**
 * Build navigation tree for a directory
 */
async function buildNavForDirectory(dirPath: string): Promise<NavItem[]> {
	const pagesFile = await readPagesFile(dirPath);
	const items: NavItem[] = [];

	// If directory is hidden, return empty array
	if (pagesFile?.hide === true) {
		return [];
	}

	const nav = pagesFile?.nav;

	// If no .pages file or no nav entries, list directory contents directly
	if (!nav) {
		const contents = await getDirectoryContents(dirPath);
		for (const name of contents) {
			// Skip README.md as it represents the directory itself
			if (name.toLowerCase() === "readme.md") {
				continue;
			}
			const item = await processNavItem(dirPath, name, null);
			if (item) {
				items.push(item);
			}
		}
		return items;
	}

	// Track which items are explicitly listed (to know what's left for ...)
	const explicitPaths = new Set<string>();

	// First pass: collect explicitly listed paths
	for (const entry of nav) {
		if (
			entry === "..." ||
			entry === "" ||
			(typeof entry === "object" && Object.keys(entry)[0] === "")
		) {
			continue;
		}
		const path = getPathFromEntry(entry);
		explicitPaths.add(path);
		// Also add without .md extension for matching
		explicitPaths.add(path.replace(/\.md$/, ""));
	}

	for (const entry of nav) {
		// Skip empty entries (separators in mkdocs)
		if (entry === "" || (typeof entry === "object" && Object.keys(entry)[0] === "")) {
			continue;
		}

		// Handle ... (catch-all) - include remaining files/directories
		if (entry === "...") {
			const allContents = await getDirectoryContents(dirPath);

			for (const name of allContents) {
				// Skip if already explicitly listed
				const nameWithoutExt = name.replace(/\.md$/, "");
				if (explicitPaths.has(name) || explicitPaths.has(nameWithoutExt)) {
					continue;
				}

				// Skip README.md as it represents the directory itself
				if (name.toLowerCase() === "readme.md") {
					continue;
				}

				const item = await processNavItem(dirPath, name, null);
				if (item) {
					items.push(item);
				}
			}
			continue;
		}

		let title: string | null = null;
		let path: string;

		if (typeof entry === "string") {
			// Simple entry like "nais.md" or "explanations"
			path = entry;
		} else {
			// Object entry like { "Home": "README.md" } or { "💡 Explanations": "explanations" }
			const key = Object.keys(entry)[0];
			title = key;
			path = entry[key];
		}

		// Skip README.md entries that would duplicate the parent directory link
		// But keep them if they have an explicit title (like "Home: README.md")
		if ((path === "README.md" || path.toLowerCase() === "readme.md") && !title) {
			continue;
		}

		const item = await processNavItem(dirPath, path, title);
		if (item) {
			items.push(item);
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
