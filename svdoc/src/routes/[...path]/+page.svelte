<script lang="ts">
	import PageMeta from "$lib/components/PageMeta.svelte";
	import ContentRenderer from "$lib/renderers/ContentRenderer.svelte";
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
	const showMeta = $derived(!hideItems.includes("meta"));
	const git = $derived(attributes?.git);

	setupContext();
</script>

<svelte:head>
	<title>{pageTitle}</title>
</svelte:head>

<article class="md-content">
	{#if tags.length > 0}
		<Tags {tags} />
	{/if}
	<ContentRenderer {tokens} />
	{#if showMeta && git}
		<PageMeta createdAt={git.createdAt} modifiedAt={git.modifiedAt} sourcePath={git.sourcePath} />
	{/if}
</article>

{#if showToc}
	<aside class="toc-container scrollbar-thin">
		<TableOfContents {tokens} />
	</aside>
{/if}

<style lang="postcss">
	@reference "../../css/app.css";

	.md-content {
		padding: 2rem;
		max-width: 100%;
	}

	/* Mobile - smaller padding */
	@media (width < theme(--breakpoint-svdoc-mobile)) {
		.md-content {
			padding: var(--svdoc-content-padding-mobile);
		}
	}

	.toc-container {
		position: fixed;
		top: calc(var(--svdoc-header-height) + 1rem);
		right: 0;
		width: var(--svdoc-toc-width);
		max-height: calc(100vh - var(--svdoc-header-height) - 2rem);
		overflow-y: auto;
		padding: 0 1rem;
	}

	/* TOC hides */
	@media (width < theme(--breakpoint-svdoc-toc-hide)) {
		.toc-container {
			display: none;
		}
	}
</style>
