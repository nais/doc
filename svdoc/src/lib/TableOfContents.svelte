<script lang="ts">
	import type { Token } from "marked";

	interface TocItem {
		id: string;
		text: string;
		depth: number;
	}

	interface Props {
		tokens: Token[];
	}

	let { tokens }: Props = $props();

	function generateId(text: string): string {
		return text
			.toLowerCase()
			.replace(/[^a-z0-9\s-]/g, "")
			.replace(/\s+/g, "-")
			.replace(/-+/g, "-")
			.trim();
	}

	function extractHeadings(tokens: Token[]): TocItem[] {
		const headings: TocItem[] = [];

		for (const token of tokens) {
			if (token.type === "heading") {
				const heading = token as { depth: number; text: string };
				// Only include h2 and h3 in TOC (h1 is the page title)
				if (heading.depth >= 2 && heading.depth <= 3) {
					headings.push({
						id: generateId(heading.text),
						text: heading.text.replace(/:[a-zA-Z0-9_+-]+:/g, "").trim(),
						depth: heading.depth,
					});
				}
			}
		}

		return headings;
	}

	const headings = $derived(extractHeadings(tokens));
</script>

{#if headings.length > 0}
	<nav class="toc">
		<h2 class="toc-title">On this page</h2>
		<ul class="toc-list">
			{#each headings as heading, i (i)}
				<li class="toc-item" class:toc-item--nested={heading.depth > 2}>
					<a href="#{heading.id}" class="toc-link">
						{heading.text}
					</a>
				</li>
			{/each}
		</ul>
	</nav>
{/if}

<style>
	.toc {
		position: sticky;
		top: calc(48px + 1.5rem);
		max-height: calc(100vh - 48px - 3rem);
		overflow-y: auto;
		padding: 1rem;
		font-size: 0.875rem;

		/* Firefox scrollbar */
		scrollbar-width: thin;
		scrollbar-color: var(--ax-border-neutral-subtle, rgba(175, 184, 193, 0.3)) transparent;
	}

	/* Webkit scrollbar styling */
	.toc::-webkit-scrollbar {
		width: 4px;
	}

	.toc::-webkit-scrollbar-track {
		background: transparent;
	}

	.toc::-webkit-scrollbar-thumb {
		background-color: var(--ax-border-neutral-subtle, rgba(175, 184, 193, 0.3));
		border-radius: 2px;
	}

	.toc-title {
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--ax-text-subtle, #8b949e);
		margin: 0 0 0.75rem 0;
	}

	.toc-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.toc-item {
		margin-bottom: 0.25rem;
	}

	.toc-item--nested {
		padding-left: 0.75rem;
	}

	.toc-link {
		display: block;
		padding: 0.25rem 0.5rem;
		color: var(--ax-text-subtle, #8b949e);
		text-decoration: none;
		border-radius: 0.25rem;
		border-left: 2px solid transparent;
		transition:
			color 0.15s ease,
			border-color 0.15s ease;
	}

	.toc-link:hover {
		color: var(--ax-text-default, #f0f6fc);
		border-left-color: var(--ax-border-accent, rgba(0, 103, 197, 0.5));
	}
</style>
