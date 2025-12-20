<script lang="ts">
	import { page } from "$app/state";
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

	const canonicalUrl = $derived(`${page.url.origin}${page.url.pathname}`);
	const description = $derived(
		attributes?.description ??
			"Nais documentation - The application platform for the Norwegian government",
	);

	setupContext();
</script>

<svelte:head>
	<title>{pageTitle}</title>
	<link rel="canonical" href={canonicalUrl} />
	<meta name="description" content={description} />

	<!-- Open Graph -->
	<meta property="og:type" content="article" />
	<meta property="og:title" content={pageTitle} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:site_name" content="Nais Documentation" />

	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content={pageTitle} />
	<meta name="twitter:description" content={description} />
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
		max-width: 100%;
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
