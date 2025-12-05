/**
 * ContentStore - Central singleton for managing all markdown content
 *
 * This module provides a centralized store for:
 * - Parsing and caching markdown files (including full tokens and attributes)
 * - Building navigation trees from the cached documents
 * - Managing tags and metadata
 * - File watching for development hot reload
 *
 * Files are processed once and cached. Navigation and page serving
 * both use this cache, avoiding duplicate file reads.
 */

import type { Token, TokensList } from "marked";
import { readdir, stat } from "node:fs/promises";
import { relative, resolve } from "node:path";
import { IGNORED_DIRECTORIES } from "./constants";
import {
	extractHeadingsFromTokens,
	extractSummaryFromTokens,
	stripMarkdownTokens,
	type Heading,
} from "./helpers/markdown-utils";
import { readMarkdownFile, type Attributes } from "./markdown";

// Resolve the docs directory relative to project root
const DOCS_DIR = resolve(process.cwd(), "../docs");

// Environment variables for tenant-based filtering
// TENANT: the current tenant (e.g., "ssb", "nav")
// NOT_TENANT: exclusion tag with "not-" prefix (e.g., "not-ssb", "not-nav")
const TENANT = process.env.TENANT?.toLowerCase() || "";
const NOT_TENANT = process.env.NOT_TENANT?.toLowerCase() || "";

// Log levels: "debug" | "info" | "warn" | "error" | "none"
const LOG_LEVEL = process.env.CONTENT_STORE_LOG_LEVEL?.toLowerCase() || "info";

const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3, none: 4 };
const currentLogLevel = LOG_LEVELS[LOG_LEVEL as keyof typeof LOG_LEVELS] ?? LOG_LEVELS.info;

const log = {
	debug: (...args: unknown[]) => {
		if (currentLogLevel <= LOG_LEVELS.debug) console.log("[content-store]", ...args);
	},
	info: (...args: unknown[]) => {
		if (currentLogLevel <= LOG_LEVELS.info) console.log("[content-store]", ...args);
	},
	warn: (...args: unknown[]) => {
		if (currentLogLevel <= LOG_LEVELS.warn) console.warn("[content-store]", ...args);
	},
	error: (...args: unknown[]) => {
		if (currentLogLevel <= LOG_LEVELS.error) console.error("[content-store]", ...args);
	},
};

log.debug(`Tenant filtering: TENANT="${TENANT}", NOT_TENANT="${NOT_TENANT}"`);

/**
 * Check if a file should be included based on its conditional frontmatter.
 *
 * The conditional frontmatter is an array of strings that controls visibility:
 *
 * 1. Exclude from specific tenants:
 *    conditional: [not-test-nais, not-nav]
 *    - Excluded when NOT_TENANT matches a value in conditional
 *    - NOT_TENANT already includes the "not-" prefix (e.g., NOT_TENANT=not-ssb)
 *
 * 2. Include only for specific tenants:
 *    conditional: [tenant, nav, ssb]
 *    - The keyword "tenant" indicates this is a tenant-specific page
 *    - Only included if TENANT matches one of the listed values (nav, ssb, etc.)
 *
 * @param conditional - The conditional array from frontmatter
 * @param filePath - Optional file path for logging
 * @returns true if the file should be included, false if it should be excluded
 */
export function shouldIncludeFile(conditional?: string[], filePath?: string): boolean {
	if (!conditional || conditional.length === 0) {
		return true;
	}

	const normalizedConditional = conditional.map((c) => c.toLowerCase());

	// Check for NOT_TENANT exclusion
	// NOT_TENANT already has the "not-" prefix (e.g., "not-ssb")
	// Exclude if the file's conditional array contains this value
	if (NOT_TENANT && normalizedConditional.includes(NOT_TENANT)) {
		log.debug(`Excluding "${filePath}" - matches NOT_TENANT="${NOT_TENANT}"`);
		return false;
	}

	// Check for tenant-specific inclusion
	// If the file has "tenant" in conditional, it's a tenant-specific page
	// Only include if TENANT is set and matches one of the other values
	if (normalizedConditional.includes("tenant")) {
		if (!TENANT) {
			// No TENANT set, exclude tenant-specific pages
			log.debug(`Excluding "${filePath}" - tenant-specific but no TENANT set`);
			return false;
		}
		// Check if TENANT matches any of the values (excluding "tenant" keyword itself)
		const allowedTenants = normalizedConditional.filter((c) => c !== "tenant");
		if (!allowedTenants.includes(TENANT)) {
			log.debug(
				`Excluding "${filePath}" - TENANT="${TENANT}" not in allowed list [${allowedTenants.join(", ")}]`,
			);
			return false;
		}
	}

	return true;
}

/**
 * Represents a parsed markdown document with all its metadata and content
 */
export interface ContentDocument {
	/** Absolute file path */
	filePath: string;
	/** URL path (e.g., "/workloads/how-to/access") */
	urlPath: string;
	/** Whether this is a README.md file */
	isReadme: boolean;
	/** Document title (from frontmatter or first heading) */
	title: string;
	/** Optional description from frontmatter */
	description?: string;
	/** Tags from frontmatter */
	tags: string[];
	/** Items to hide (e.g., "toc", "navigation") */
	hide: string[];
	/** Extracted headings for search/TOC */
	headings: Heading[];
	/** Stripped content for search indexing */
	searchContent: string;
	/** Summary extracted from first paragraphs */
	summary?: string;
	/** Last modified time */
	mtime: number;
	/** Full parsed tokens for rendering */
	tokens: Token[] | TokensList;
	/** Full attributes from frontmatter */
	attributes: Attributes;
}

/**
 * Represents tag information with associated pages
 */
export interface TagInfo {
	/** Original tag name */
	name: string;
	/** URL-safe slug */
	slug: string;
	/** Number of pages with this tag */
	count: number;
}

/**
 * Represents a page associated with a tag
 */
export interface TaggedPage {
	title: string;
	path: string;
	description?: string;
	summary?: string;
}

/**
 * Navigation item in the sidebar tree
 */
export interface NavItem {
	title: string;
	href: string;
	children?: NavItem[];
	hasContent: boolean;
}

/**
 * .pages file structure
 */
interface PagesFile {
	nav?: (string | Record<string, string>)[];
	hide?: boolean;
}

// Import tagToSlug from utils to keep it client-safe
import { tagToSlug } from "./utils";

// Re-export for convenience
export { tagToSlug };

/**
 * Convert file path to URL path
 */
function filePathToUrlPath(filePath: string): { urlPath: string; isReadme: boolean } {
	const relativePath = filePath.startsWith(DOCS_DIR)
		? filePath.slice(DOCS_DIR.length)
		: relative(DOCS_DIR, filePath);

	const isReadme = /\/README\.md$/i.test(filePath) || relativePath.toLowerCase() === "readme.md";

	const urlPath =
		("/" + relativePath)
			.replace(/\/README\.md$/i, "")
			.replace(/\.md$/, "")
			.replace(/\/+/g, "/") || "/";

	return { urlPath, isReadme };
}

/**
 * Convert a filename or directory name to a title
 */
function filenameToTitle(name: string): string {
	const baseName = name.replace(/\.md$/, "");

	if (baseName.toLowerCase() === "readme") {
		return "Overview";
	}

	return baseName
		.split("-")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}

// Get base path from environment variable (set in svelte.config.js)
const BASE_PATH = process.env.BASE_PATH || "";

/**
 * Prefix a path with the configured base path
 */
function withBase(path: string): string {
	if (!BASE_PATH) return path;
	const normalizedPath = path.startsWith("/") ? path : `/${path}`;
	return `${BASE_PATH}${normalizedPath}`.replace(/\/+/g, "/");
}

/**
 * Convert a URL path to an href with base path
 */
function urlPathToHref(urlPath: string): string {
	return withBase(urlPath);
}

/**
 * The main ContentStore class - singleton for managing all content
 */
class ContentStore {
	private documents: Map<string, ContentDocument> = new Map();
	private documentsByUrlPath: Map<string, ContentDocument> = new Map();
	private navigation: NavItem[] | null = null;
	private tags: Map<string, TagInfo> = new Map();
	private tagPages: Map<string, TaggedPage[]> = new Map();
	private allPaths: string[] | null = null;
	private initialized = false;
	private initializing: Promise<void> | null = null;

	/**
	 * Initialize the store by scanning all markdown files
	 */
	async initialize(): Promise<void> {
		// Prevent multiple simultaneous initializations
		if (this.initializing) {
			return this.initializing;
		}

		if (this.initialized) {
			return;
		}

		this.initializing = this.doInitialize();
		await this.initializing;
		this.initializing = null;
	}

	private async doInitialize(): Promise<void> {
		const startTime = Date.now();
		log.info("Initializing...");

		// Clear existing data
		this.documents.clear();
		this.documentsByUrlPath.clear();
		this.tags.clear();
		this.tagPages.clear();
		this.navigation = null;
		this.allPaths = null;

		// Scan all markdown files
		const files = await this.findMarkdownFiles(DOCS_DIR);
		log.debug(`Found ${files.length} markdown files`);

		// Process each file
		for (const filePath of files) {
			await this.processFile(filePath);
		}

		// Build derived data
		this.buildTagsIndex();
		this.navigation = await this.buildNavigation();

		this.initialized = true;
		log.info(`Initialized in ${Date.now() - startTime}ms with ${this.documents.size} documents`);
	}

	/**
	 * Invalidate a specific file (called when file changes)
	 */
	async invalidateFile(filePath: string): Promise<void> {
		const absolutePath = resolve(filePath);

		// Find and remove old document
		const oldDoc = this.documents.get(absolutePath);
		if (oldDoc) {
			this.documentsByUrlPath.delete(oldDoc.urlPath);
		}
		this.documents.delete(absolutePath);

		// Re-process the file
		try {
			await this.processFile(absolutePath);
		} catch {
			// File might have been deleted
			this.documents.delete(absolutePath);
		}

		// Rebuild derived data
		this.buildTagsIndex();
		this.navigation = await this.buildNavigation();
		this.allPaths = null;
	}

	/**
	 * Invalidate all content (full rebuild)
	 */
	async invalidateAll(): Promise<void> {
		this.initialized = false;
		await this.initialize();
	}

	/**
	 * Process a single markdown file and add it to the cache
	 */
	private async processFile(filePath: string): Promise<void> {
		try {
			const fileStat = await stat(filePath);
			const { tokens, attributes } = await readMarkdownFile(filePath);

			// Check if file should be included based on conditional frontmatter
			if (!shouldIncludeFile(attributes.conditional, filePath)) {
				return;
			}

			const { urlPath, isReadme } = filePathToUrlPath(filePath);
			const title = attributes.title || "Untitled";
			const headings = extractHeadingsFromTokens(tokens);
			const searchContent = stripMarkdownTokens(tokens).slice(0, 10000);
			const summary = extractSummaryFromTokens(tokens);

			const doc: ContentDocument = {
				filePath,
				urlPath,
				isReadme,
				title,
				description: attributes.description,
				tags: attributes.tags || [],
				hide: attributes.hide || [],
				headings,
				searchContent,
				summary,
				mtime: fileStat.mtimeMs,
				tokens,
				attributes,
			};

			this.documents.set(filePath, doc);
			this.documentsByUrlPath.set(urlPath, doc);
		} catch {
			// Skip files that can't be read
		}
	}

	/**
	 * Build the tags index from all documents
	 */
	private buildTagsIndex(): void {
		this.tags.clear();
		this.tagPages.clear();

		for (const doc of this.documents.values()) {
			for (const tag of doc.tags) {
				const slug = tagToSlug(tag);

				// Update tag count
				const existing = this.tags.get(slug);
				if (existing) {
					existing.count++;
				} else {
					this.tags.set(slug, { name: tag, slug, count: 1 });
				}

				// Add page to tag
				const pages = this.tagPages.get(slug) || [];
				pages.push({
					title: doc.title,
					path: withBase(doc.urlPath),
					description: doc.description,
					summary: doc.summary,
				});
				this.tagPages.set(slug, pages);
			}
		}

		// Sort pages within each tag
		for (const pages of this.tagPages.values()) {
			pages.sort((a, b) => a.title.localeCompare(b.title));
		}
	}

	/**
	 * Recursively find all markdown files
	 */
	private async findMarkdownFiles(dirPath: string): Promise<string[]> {
		const files: string[] = [];

		try {
			const entries = await readdir(dirPath, { withFileTypes: true });

			for (const entry of entries) {
				if (entry.name.startsWith(".")) continue;
				if (IGNORED_DIRECTORIES.has(entry.name.toLowerCase())) continue;

				const fullPath = `${dirPath}/${entry.name}`;

				if (entry.isDirectory()) {
					const subFiles = await this.findMarkdownFiles(fullPath);
					files.push(...subFiles);
				} else if (entry.name.endsWith(".md")) {
					files.push(fullPath);
				}
			}
		} catch {
			// Directory doesn't exist or can't be read
		}

		return files;
	}

	// ============ Public API ============

	/**
	 * Get all documents
	 */
	async getAllDocuments(): Promise<ContentDocument[]> {
		await this.initialize();
		return Array.from(this.documents.values());
	}

	/**
	 * Get a document by its URL path
	 */
	async getDocumentByPath(urlPath: string): Promise<ContentDocument | undefined> {
		await this.initialize();

		// Normalize the path
		const normalizedPath = urlPath.startsWith("/") ? urlPath : `/${urlPath}`;
		return this.documentsByUrlPath.get(normalizedPath);
	}

	/**
	 * Get a document by its file path
	 */
	async getDocumentByFilePath(filePath: string): Promise<ContentDocument | undefined> {
		await this.initialize();
		return this.documents.get(resolve(filePath));
	}

	/**
	 * Get parsed markdown content for a URL path
	 * Returns the cached tokens and attributes directly from the store
	 */
	async getContent(
		urlPath: string,
	): Promise<{ tokens: Token[] | TokensList; attributes: Attributes } | null> {
		await this.initialize();

		const doc = await this.getDocumentByPath(urlPath);
		if (!doc) return null;

		return {
			tokens: doc.tokens,
			attributes: doc.attributes,
		};
	}

	/**
	 * Get all tags with their counts
	 */
	async getAllTags(): Promise<TagInfo[]> {
		await this.initialize();
		return Array.from(this.tags.values()).sort((a, b) => a.name.localeCompare(b.name));
	}

	/**
	 * Get a tag by its slug
	 */
	async getTag(slug: string): Promise<TagInfo | undefined> {
		await this.initialize();
		return this.tags.get(slug);
	}

	/**
	 * Get all pages for a tag
	 */
	async getTagPages(slug: string): Promise<TaggedPage[]> {
		await this.initialize();
		return this.tagPages.get(slug) || [];
	}

	/**
	 * Get the navigation tree
	 */
	async getNavigation(): Promise<NavItem[]> {
		await this.initialize();
		return this.navigation || [];
	}

	/**
	 * Get all URL paths for static site generation
	 */
	async getAllPaths(): Promise<string[]> {
		await this.initialize();

		if (this.allPaths) {
			return this.allPaths;
		}

		const navigation = await this.getNavigation();
		const paths = this.extractPaths(navigation);

		// Add root path if we have a root document
		if (this.documentsByUrlPath.has("/")) {
			paths.unshift("");
		}

		this.allPaths = paths;
		return this.allPaths;
	}

	/**
	 * Get search index data
	 */
	async getSearchIndex(): Promise<
		Array<{
			id: string;
			title: string;
			path: string;
			headings: Heading[];
			content: string;
		}>
	> {
		await this.initialize();

		const documents: Array<{
			id: string;
			title: string;
			path: string;
			headings: Heading[];
			content: string;
		}> = [];

		for (const doc of this.documents.values()) {
			// Skip hidden documents
			if (doc.hide.includes("navigation")) continue;

			documents.push({
				id: doc.filePath,
				title: doc.title,
				path: withBase(doc.urlPath),
				headings: doc.headings,
				content: doc.searchContent,
			});
		}

		return documents;
	}

	// ============ Navigation Building ============

	/**
	 * Extract paths from navigation items
	 */
	private extractPaths(items: NavItem[]): string[] {
		const paths: string[] = [];

		for (const item of items) {
			// Strip the base path prefix if present, then remove leading slash
			let path = item.href;
			if (BASE_PATH && path.startsWith(BASE_PATH)) {
				path = path.slice(BASE_PATH.length);
			}
			path = path.replace(/^\//, "");
			paths.push(path);

			if (item.children) {
				paths.push(...this.extractPaths(item.children));
			}
		}

		return paths;
	}

	/**
	 * Read and parse a .pages file
	 */
	private async readPagesFile(dirPath: string): Promise<PagesFile | null> {
		try {
			const { parse: parseYaml } = await import("yaml");
			const pagesPath = `${dirPath}/.pages`;
			const content = await Bun.file(pagesPath).text();
			return parseYaml(content) as PagesFile;
		} catch {
			return null;
		}
	}

	/**
	 * Get directory contents from filesystem
	 */
	private async getDirectoryContents(dirPath: string): Promise<string[]> {
		try {
			const entries = await readdir(dirPath, { withFileTypes: true });
			return entries
				.filter((entry) => {
					if (entry.name.startsWith(".")) return false;
					if (IGNORED_DIRECTORIES.has(entry.name.toLowerCase())) return false;
					return entry.isDirectory() || entry.name.endsWith(".md");
				})
				.map((entry) => entry.name)
				.sort();
		} catch {
			return [];
		}
	}

	/**
	 * Check if a directory has a README.md that is included in the store
	 */
	private hasIncludedReadme(dirPath: string): boolean {
		const readmePath = `${dirPath}/README.md`;
		return this.documents.has(readmePath);
	}

	/**
	 * Check if an item (file or directory) should be included in navigation
	 */
	private isItemIncluded(fullPath: string, isDir: boolean): boolean {
		if (isDir) {
			// A directory is included if it has any documents underneath it
			for (const doc of this.documents.values()) {
				if (doc.filePath.startsWith(fullPath + "/")) {
					return true;
				}
			}
			return false;
		} else {
			// A file is included if it's in the documents map
			const mdPath = fullPath.endsWith(".md") ? fullPath : `${fullPath}.md`;
			return this.documents.has(mdPath);
		}
	}

	/**
	 * Get title for a path from the documents cache
	 */
	private getTitleForPath(fullPath: string): string | null {
		const mdPath = fullPath.endsWith(".md") ? fullPath : `${fullPath}.md`;
		const doc = this.documents.get(mdPath);
		return doc?.title || null;
	}

	/**
	 * Check if path is a directory
	 */
	private async isDirectory(path: string): Promise<boolean> {
		try {
			const s = await stat(path);
			return s.isDirectory();
		} catch {
			return false;
		}
	}

	/**
	 * Build the navigation tree from cached documents
	 */
	private async buildNavigation(): Promise<NavItem[]> {
		return this.buildNavForDirectory(DOCS_DIR);
	}

	/**
	 * Process a single navigation item
	 */
	private async processNavItem(
		dirPath: string,
		path: string,
		explicitTitle: string | null,
	): Promise<NavItem | null> {
		const fullPath = `${dirPath}/${path}`;
		const isDir = await this.isDirectory(fullPath);

		// Check if this item should be included
		if (!this.isItemIncluded(fullPath, isDir)) {
			return null;
		}

		// Check for hidden directory
		if (isDir) {
			const pagesFile = await this.readPagesFile(fullPath);
			if (pagesFile?.hide === true) {
				return null;
			}
		}

		let title = explicitTitle || filenameToTitle(path);

		if (isDir) {
			const children = await this.buildNavForDirectory(fullPath);
			const hasContent = this.hasIncludedReadme(fullPath);

			// If no children and no content, skip
			if (children.length === 0 && !hasContent) {
				return null;
			}

			// Get title from README if available
			if (!explicitTitle) {
				const readmeTitle = this.getTitleForPath(`${fullPath}/README.md`);
				if (readmeTitle) {
					title = readmeTitle;
				}
			}

			// Build URL path for this directory
			const urlPath = fullPath.slice(DOCS_DIR.length) || "/";

			return {
				title,
				href: urlPathToHref(urlPath),
				children: children.length > 0 ? children : undefined,
				hasContent,
			};
		} else {
			const mdPath = path.endsWith(".md") ? fullPath : `${fullPath}.md`;

			if (!explicitTitle) {
				const fileTitle = this.getTitleForPath(mdPath);
				if (fileTitle) {
					title = fileTitle;
				}
			}

			// Get URL path from document
			const doc = this.documents.get(mdPath);
			const urlPath = doc?.urlPath || filePathToUrlPath(mdPath).urlPath;

			return {
				title,
				href: urlPathToHref(urlPath),
				hasContent: true,
			};
		}
	}

	/**
	 * Build navigation for a directory
	 */
	private async buildNavForDirectory(dirPath: string): Promise<NavItem[]> {
		const pagesFile = await this.readPagesFile(dirPath);
		const items: NavItem[] = [];

		if (pagesFile?.hide === true) {
			return [];
		}

		const nav = pagesFile?.nav;

		if (!nav) {
			// No .pages file - use directory contents
			const contents = await this.getDirectoryContents(dirPath);
			for (const name of contents) {
				if (name.toLowerCase() === "readme.md") continue;
				const item = await this.processNavItem(dirPath, name, null);
				if (item) items.push(item);
			}
			return items;
		}

		// Process .pages nav entries
		const explicitPaths = new Set<string>();

		for (const entry of nav) {
			if (
				entry === "..." ||
				entry === "" ||
				(typeof entry === "object" && Object.keys(entry)[0] === "")
			) {
				continue;
			}
			const path = typeof entry === "string" ? entry : Object.values(entry)[0];
			explicitPaths.add(path);
			explicitPaths.add(path.replace(/\.md$/, ""));
		}

		for (const entry of nav) {
			if (entry === "" || (typeof entry === "object" && Object.keys(entry)[0] === "")) {
				continue;
			}

			if (entry === "...") {
				// Include all non-explicit items
				const allContents = await this.getDirectoryContents(dirPath);

				for (const name of allContents) {
					const nameWithoutExt = name.replace(/\.md$/, "");
					if (explicitPaths.has(name) || explicitPaths.has(nameWithoutExt)) continue;
					if (name.toLowerCase() === "readme.md") continue;

					const item = await this.processNavItem(dirPath, name, null);
					if (item) items.push(item);
				}
				continue;
			}

			let title: string | null = null;
			let path: string;

			if (typeof entry === "string") {
				path = entry;
			} else {
				const key = Object.keys(entry)[0];
				title = key;
				path = entry[key];
			}

			if ((path === "README.md" || path.toLowerCase() === "readme.md") && !title) {
				continue;
			}

			const item = await this.processNavItem(dirPath, path, title);
			if (item) items.push(item);
		}

		return items;
	}
}

// Use globalThis to ensure singleton is shared across all module contexts
// This is necessary because Vite plugin and SvelteKit server may have different module instances
const CONTENT_STORE_KEY = Symbol.for("nais-doc-content-store");

function getContentStore(): ContentStore {
	const globalAny = globalThis as unknown as { [key: symbol]: ContentStore };
	if (!globalAny[CONTENT_STORE_KEY]) {
		globalAny[CONTENT_STORE_KEY] = new ContentStore();
	}
	return globalAny[CONTENT_STORE_KEY];
}

// Export singleton instance
export const contentStore = getContentStore();
