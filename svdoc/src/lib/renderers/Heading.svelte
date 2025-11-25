<script lang="ts">
	import { Heading } from "@nais/ds-svelte-community";
	import type { Tokens } from "marked";
	import Renderer from "./Renderer.svelte";

	let { token }: { token: Tokens.Heading } = $props();

	// Generate ID from heading text for anchor links
	function generateId(text: string): string {
		return text
			.toLowerCase()
			.replace(/[^\w\s-]/g, "")
			.replace(/\s+/g, "-")
			.replace(/^-+|-+$/g, "");
	}

	const headingId = token.text ? generateId(token.text) : undefined;

	// Map heading depth to appropriate size
	const sizeMap: Record<number, "xlarge" | "large" | "medium" | "small" | "xsmall"> = {
		1: "xlarge",
		2: "large",
		3: "medium",
		4: "small",
		5: "xsmall",
		6: "xsmall",
	};

	const headingSize = sizeMap[token.depth] || "medium";
	const headingLevel = `h${token.depth}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
</script>

<Heading as={headingLevel} size={headingSize} spacing id={headingId}>
	<Renderer tokens={token.tokens} />
	{#if headingId}
		<a class="headerlink" href="#{headingId}" title="Permanent link">¶</a>
	{/if}
</Heading>

<style>
	:global(.headerlink) {
		margin-left: 0.5rem;
		opacity: 0;
		transition: opacity 0.2s;
		text-decoration: none;
		color: inherit;
	}

	:global(h1:hover .headerlink),
	:global(h2:hover .headerlink),
	:global(h3:hover .headerlink),
	:global(h4:hover .headerlink),
	:global(h5:hover .headerlink),
	:global(h6:hover .headerlink) {
		opacity: 0.5;
	}

	:global(.headerlink:hover) {
		opacity: 1 !important;
	}
</style>
