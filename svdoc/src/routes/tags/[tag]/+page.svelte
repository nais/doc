<script lang="ts">
	import { resolve } from "$app/paths";
	import { Tag } from "@nais/ds-svelte-community";
	import { ChevronLeftIcon } from "@nais/ds-svelte-community/icons";
	import type { PageProps } from "./$types";

	let { data }: PageProps = $props();
	const { tag, pages } = $derived(data);
</script>

<svelte:head>
	<title>{tag} - Tags - Nais</title>
	<meta name="description" content="Pages tagged with {tag}" />
</svelte:head>

<article class="tag-page">
	<header class="header">
		<a href={resolve("/tags")} class="back-link">
			<ChevronLeftIcon aria-hidden="true" />
			All tags
		</a>
		<div class="title-row">
			<h1>
				<Tag variant="alt3-moderate" size="small">{tag}</Tag>
			</h1>
			<span class="count">{pages.length} {pages.length === 1 ? "page" : "pages"}</span>
		</div>
	</header>

	{#if pages.length > 0}
		<ul class="pages-list">
			{#each pages as page (page.path)}
				<li>
					<a href={page.path} class="page-card">
						<h2 class="page-title">{page.title}</h2>
						{#if page.description || page.summary}
							<p class="page-summary">{page.description || page.summary}</p>
						{/if}
					</a>
				</li>
			{/each}
		</ul>
	{:else}
		<div class="empty">
			<p>No pages found with this tag.</p>
			<a href={resolve("/tags")} class="back-link-empty">Browse all tags</a>
		</div>
	{/if}
</article>

<style>
	.tag-page {
		max-width: 900px;
	}

	.header {
		margin-bottom: 2rem;
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		margin-bottom: 1rem;
		color: var(--ax-text-neutral, #6b7280);
		text-decoration: none;
		font-size: 0.875rem;
		transition: color 0.15s ease;
	}

	.back-link:hover {
		color: var(--ax-text-default, inherit);
	}

	.title-row {
		display: flex;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
	}

	h1 {
		margin: 0;
		display: flex;
		align-items: center;
	}

	.count {
		color: var(--ax-text-neutral, #6b7280);
		font-size: 0.875rem;
	}

	.pages-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.page-card {
		display: block;
		padding: 1.25rem 1.5rem;
		border: 1px solid var(--ax-border-neutral-subtle, rgba(175, 184, 193, 0.3));
		border-radius: 0.5rem;
		background-color: var(--ax-bg-neutral-soft, rgba(175, 184, 193, 0.05));
		text-decoration: none;
		transition:
			border-color 0.2s ease,
			background-color 0.2s ease,
			box-shadow 0.2s ease;
	}

	.page-card:hover {
		border-color: var(--ax-border-accent, rgba(0, 103, 197, 0.5));
		background-color: var(--ax-bg-accent-soft, rgba(0, 103, 197, 0.05));
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
	}

	.page-card:hover .page-title {
		color: var(--ax-text-accent, #0067c5);
	}

	.page-title {
		margin: 0 0 0.5rem 0;
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--ax-text-default, inherit);
		transition: color 0.2s ease;
	}

	.page-summary {
		margin: 0;
		font-size: 0.9375rem;
		color: var(--ax-text-neutral, #6b7280);
		line-height: 1.5;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.empty {
		text-align: center;
		padding: 3rem 1rem;
		color: var(--ax-text-neutral, #6b7280);
	}

	.empty p {
		margin: 0 0 1rem 0;
		font-size: 1rem;
	}

	.back-link-empty {
		color: var(--ax-text-accent, #0067c5);
		text-decoration: none;
	}

	.back-link-empty:hover {
		text-decoration: underline;
	}
</style>
