/**
 * ContentStore - Central singleton for managing all markdown content
 *
 * This module provides a centralized store for:
 * - Parsing and caching markdown files
 * - Building navigation trees
 * - Managing tags and metadata
 * - File watching for development hot reload
 */

import fm from "front-matter";
import type { Token } from "marked";
import { readdir, stat } from "node:fs/promises";
import { relative, resolve } from "node:path";
import { IGNORED_DIRECTORIES } from "./constants";
import {
	extractHeadingsFromTokens,
	extractSummaryFromTokens,
	extractTitle,
	stripMarkdownTokens,
	type Heading,
} from "./helpers/markdown-utils";
import { readMarkdownFile, type Attributes } from "./markdown";

// Resolve the docs directory relative to project root
const DOCS_DIR = resolve(process.cwd(), "../docs");

/**
 * Represents a parsed markdown document with all its metadata
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
 * Frontmatter attributes from markdown files
 */
interface DocAttributes {
	title?: string;
	description?: string;
	tags?: string[];
	hide?: string[];
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
 * Convert a file/directory path to a URL href
 */
function pathToHref(basePath: string, name: string): string {
	const cleanBase = basePath.replace(DOCS_DIR, "").replace(/\/$/, "");
	const cleanName = name.replace(/\.md$/, "").replace(/README$/i, "");

	let href: string;
	if (cleanName === "") {
		href = cleanBase || "/";
	} else {
		href = `${cleanBase}/${cleanName}`.replace(/\/+/g, "/");
	}

	return withBase(href);
}

/**
 * The main ContentStore class - singleton for managing all content
 */
class ContentStore {
	private documents: Map<string, ContentDocument> = new Map();
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
		// Clear existing data
		this.documents.clear();
		this.tags.clear();
		this.tagPages.clear();
		this.navigation = null;
		this.allPaths = null;

		// Scan all markdown files
		const files = await this.findMarkdownFiles(DOCS_DIR);

		// Process each file
		for (const filePath of files) {
			await this.processFile(filePath);
		}

		// Build derived data
		this.buildTagsIndex();

		this.initialized = true;
	}

	/**
	 * Invalidate a specific file (called when file changes)
	 */
	async invalidateFile(filePath: string): Promise<void> {
		const absolutePath = resolve(filePath);

		// Remove from cache
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
		this.navigation = null;
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
	 * Process a single markdown file
	 */
	private async processFile(filePath: string): Promise<void> {
		try {
			const fileStat = await stat(filePath);
			const { tokens, attributes } = await readMarkdownFile(filePath);

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
			};

			this.documents.set(filePath, doc);
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

		for (const doc of this.documents.values()) {
			if (doc.urlPath === normalizedPath) {
				return doc;
			}
		}

		return undefined;
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
	 */
	async getContent(urlPath: string): Promise<{ tokens: Token[]; attributes: Attributes } | null> {
		await this.initialize();

		const doc = await this.getDocumentByPath(urlPath);
		if (!doc) return null;

		// Use the existing readMarkdownFile for full parsing
		// This handles all the complex token processing
		const relativePath = relative(process.cwd(), doc.filePath);
		return await readMarkdownFile(relativePath);
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

		if (this.navigation) {
			return this.navigation;
		}

		this.navigation = await this.buildNavForDirectory(DOCS_DIR);
		return this.navigation;
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

		// Add root path
		paths.unshift("");

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

	private async hasReadme(dirPath: string): Promise<boolean> {
		try {
			await Bun.file(`${dirPath}/README.md`).text();
			return true;
		} catch {
			return false;
		}
	}

	private async isDirectory(path: string): Promise<boolean> {
		try {
			const s = await stat(path);
			return s.isDirectory();
		} catch {
			return false;
		}
	}

	private async getMarkdownTitle(filePath: string): Promise<string | null> {
		const doc = this.documents.get(filePath);
		if (doc) {
			return doc.title;
		}

		// Fallback to reading the file directly
		try {
			const source = await Bun.file(filePath).text();
			const { attributes, body } = fm<DocAttributes>(source);
			return extractTitle(attributes, body);
		} catch {
			return null;
		}
	}

	private async processNavItem(
		dirPath: string,
		path: string,
		explicitTitle: string | null,
	): Promise<NavItem | null> {
		const fullPath = `${dirPath}/${path}`;
		const isDir = await this.isDirectory(fullPath);

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
			const dirHasContent = await this.hasReadme(fullPath);

			return {
				title,
				href: pathToHref(dirPath, path),
				children: children.length > 0 ? children : undefined,
				hasContent: dirHasContent,
			};
		} else {
			const mdPath = path.endsWith(".md") ? fullPath : `${fullPath}.md`;

			if (!explicitTitle) {
				const fileTitle = await this.getMarkdownTitle(mdPath);
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

	private async buildNavForDirectory(dirPath: string): Promise<NavItem[]> {
		const pagesFile = await this.readPagesFile(dirPath);
		const items: NavItem[] = [];

		if (pagesFile?.hide === true) {
			return [];
		}

		const nav = pagesFile?.nav;

		if (!nav) {
			const contents = await this.getDirectoryContents(dirPath);
			for (const name of contents) {
				if (name.toLowerCase() === "readme.md") continue;
				const item = await this.processNavItem(dirPath, name, null);
				if (item) items.push(item);
			}
			return items;
		}

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

// Export singleton instance
export const contentStore = new ContentStore();

// Re-export types that other modules might need
export type { Heading };
