import { icons as octicon } from "@iconify-json/octicon";
import { icons as mdi } from "@iconify-json/mdi";
import { icons as simpleIcons } from "@iconify-json/simple-icons";
import { icons as fa6Brands } from "@iconify-json/fa6-brands";
import { getIconData, iconToSVG, iconToHTML } from "@iconify/utils";
import type { IconifyJSON } from "@iconify/types";

// Known icon set prefixes mapped to their data
const iconSets: Record<string, IconifyJSON> = {
	octicons: octicon,
	material: mdi,
	simple: simpleIcons,
	"fontawesome-brands": fa6Brands,
};

// Sorted by length descending to match longer prefixes first
const knownPrefixes = Object.keys(iconSets).sort((a, b) => b.length - a.length);

/**
 * Parse a Material for MkDocs icon shortcode like :octicons-arrow-right-24:
 * Returns { prefix, name, size } or null if not a valid icon pattern
 */
function parseIconShortcode(
	shortcode: string,
): { prefix: string; name: string; size: string | null } | null {
	// Try each known prefix
	for (const prefix of knownPrefixes) {
		if (shortcode.startsWith(prefix + "-")) {
			const name = shortcode.slice(prefix.length + 1);
			if (name) {
				// Extract size suffix if present (e.g., -24, -16)
				const sizeMatch = name.match(/-(\d+)$/);
				const size = sizeMatch ? sizeMatch[1] : null;
				return { prefix, name, size };
			}
		}
	}
	return null;
}

/**
 * Get SVG HTML for an icon shortcode
 * Returns the SVG string wrapped in a span, or null if icon not found
 */
export function getIconSvg(shortcode: string): string | null {
	const parsed = parseIconShortcode(shortcode);
	if (!parsed) return null;

	const { prefix, name, size } = parsed;
	const iconSet = iconSets[prefix];

	const iconData = getIconData(iconSet, name);
	if (!iconData) return null;

	const svg = iconToSVG(iconData);

	// Use pixel size if specified, otherwise let CSS handle it
	const sizeAttrs = size ? { width: `${size}px`, height: `${size}px` } : {};

	const svgHtml = iconToHTML(svg.body, {
		...svg.attributes,
		...sizeAttrs,
		"aria-hidden": "true",
	});

	return `<span class="emoji-icon">${svgHtml}</span>`;
}

/**
 * Check if a shortcode matches an icon pattern (for use in tokenizer)
 */
export function isIconShortcode(shortcode: string): boolean {
	const parsed = parseIconShortcode(shortcode);
	if (!parsed) return false;

	const { prefix, name } = parsed;
	const iconSet = iconSets[prefix];

	return getIconData(iconSet, name) !== null;
}
