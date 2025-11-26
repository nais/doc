<script lang="ts">
	import Renderer from "$lib/renderers/Renderer.svelte";
	import { setupContext } from "$lib/state/page_context.svelte";
	import TableOfContents from "$lib/TableOfContents.svelte";
	import Tags from "$lib/Tags.svelte";
	import type { PageProps } from "./$types";

	let { data }: PageProps = $props();
	const { tokens, attributes } = $derived(data);
	const pageTitle = $derived(attributes?.title ? `${attributes.title} - Nais` : "Nais");
	const tags = $derived(attributes?.tags ?? []);
	const hideItems = $derived(attributes?.hide ?? []);
	const showToc = $derived(!hideItems.includes("toc"));

	setupContext();
</script>

<svelte:head>
	<title>{pageTitle}</title>
</svelte:head>

<article class="md-content">
	{#if tags.length > 0}
		<Tags {tags} />
	{/if}
	<Renderer {tokens} />
</article>

{#if showToc}
	<aside class="toc-container scrollbar-thin">
		<TableOfContents {tokens} />
	</aside>
{/if}

<style>
	.md-content {
		padding: 2rem;
		max-width: 100%;
	}

	.toc-container {
		position: fixed;
		top: calc(48px + 1.5rem);
		right: 2rem;
		width: 220px;
		max-height: calc(100vh - 48px - 3rem);
		overflow-y: auto;
	}

	@media (max-width: 1300px) {
		.toc-container {
			display: none;
		}
	}
</style>
