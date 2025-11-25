<script lang="ts">
	import Renderer from "$lib/renderers/Renderer.svelte";
	import TableOfContents from "$lib/TableOfContents.svelte";
	import Tags from "$lib/Tags.svelte";
	import type { PageProps } from "./$types";

	let { data }: PageProps = $props();
	const { tokens, attributes } = $derived(data);
	const pageTitle = $derived(attributes?.title ? `${attributes.title} - Nais` : "Nais");
	const tags = $derived(attributes?.tags ?? []);
	const hideItems = $derived(attributes?.hide ?? []);
	const showToc = $derived(!hideItems.includes("toc"));
</script>

<svelte:head>
	<title>{pageTitle}</title>
</svelte:head>

<div class="page-container">
	<article class="md-content">
		{#if tags.length > 0}
			<Tags {tags} />
		{/if}
		<Renderer {tokens} />
	</article>
	{#if showToc}
		<aside class="toc-container">
			<TableOfContents {tokens} />
		</aside>
	{/if}
</div>

<style>
	.page-container {
		display: flex;
		gap: 2rem;
	}

	.md-content {
		flex: 1;
		min-width: 0;
		padding: 2rem;
		max-width: 100%;
	}

	.toc-container {
		width: 220px;
		flex-shrink: 0;
	}

	@media (max-width: 1100px) {
		.toc-container {
			display: none;
		}
	}

	/* Grid cards styling for Material for MkDocs compatibility */
	:global(.md-content .grid.cards ul) {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1rem;
		list-style: none;
		padding: 0;
		margin: 1.5rem 0;
	}

	@media (max-width: 600px) {
		:global(.md-content .grid.cards ul) {
			grid-template-columns: 1fr;
		}
	}

	:global(.md-content .grid.cards li .aksel-list__item-marker) {
		display: none;
	}

	:global(.md-content .grid.cards li) {
		padding: 1rem;
		border: 1px solid var(--ax-border-neutral-subtle, rgba(175, 184, 193, 0.3));
		border-radius: 0.5rem;
		background-color: var(--ax-bg-neutral-soft, rgba(175, 184, 193, 0.05));
		transition: all 0.2s;
	}

	:global(.md-content .grid.cards li:hover) {
		border-color: var(--ax-border-accent, rgba(0, 103, 197, 0.5));
		background-color: var(--ax-bg-accent-soft, rgba(0, 103, 197, 0.1));
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	}

	:global(.md-content .grid.cards li .twemoji) {
		margin-right: 0.5rem;
	}
</style>
