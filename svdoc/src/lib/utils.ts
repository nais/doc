/**
 * Shared utilities that are safe to use on both client and server
 */

/**
 * Convert a tag name to a URL-safe slug
 */
export function tagToSlug(tag: string): string {
	return tag
		.toLowerCase()
		.replace(/\s+/g, "-")
		.replace(/[^a-z0-9-]/g, "");
}
