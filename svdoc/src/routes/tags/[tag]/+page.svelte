<script lang="ts">
	import { resolve } from "$app/paths";
	import { Tag } from "@nais/ds-svelte-community";
	import type { PageProps } from "./$types";

	let { data }: PageProps = $props();
	const { tag, pages } = $derived(data);
</script>

<svelte:head>
	<title>{tag} - Tags - Nais</title>
</svelte:head>

<article class="tag-page">
	<div class="header">
		<a href={resolve("/tags")} class="back-link">← All tags</a>
		<div class="title-row">
			<h1>
				<Tag variant="alt3-moderate" size="small">{tag}</Tag>
			</h1>
			<span class="count">{pages.length} {pages.length === 1 ? "page" : "pages"}</span>
		</div>
	</div>

	<ul class="pages-list">
		{#each pages as page (page.path)}
			<li>
				<a href={page.path} class="page-card">
					<span class="page-title">{page.title}</span>
					{#if page.description}
						<span class="page-description">{page.description}</span>
					{/if}
					<span class="page-path">{page.path}</span>
				</a>
			</li>
		{/each}
	</ul>

	{#if pages.length === 0}
		<p class="empty">No pages found with this tag.</p>
	{/if}
</article>

<style>
	.tag-page {
		padding: 2rem;
		max-width: 900px;
	}

	.header {
		margin-bottom: 2rem;
	}

	.back-link {
		display: inline-block;
		margin-bottom: 1rem;
		color: var(--ax-text-neutral, #6b7280);
		text-decoration: none;
		font-size: 0.875rem;
	}

	.back-link:hover {
		color: var(--ax-text-default, inherit);
		text-decoration: underline;
	}

	.title-row {
		display: flex;
		align-items: center;
		gap: 1rem;
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
		gap: 0.75rem;
	}

	.page-card {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		padding: 1rem;
		border: 1px solid var(--ax-border-neutral-subtle, rgba(175, 184, 193, 0.3));
		border-radius: 0.5rem;
		background-color: var(--ax-bg-neutral-soft, rgba(175, 184, 193, 0.05));
		text-decoration: none;
		transition: all 0.2s ease;
	}

	.page-card:hover {
		border-color: var(--ax-border-accent, rgba(0, 103, 197, 0.5));
		background-color: var(--ax-bg-accent-soft, rgba(0, 103, 197, 0.1));
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	}

	.page-title {
		font-weight: 500;
		color: var(--ax-text-default, inherit);
	}

	.page-description {
		font-size: 0.875rem;
		color: var(--ax-text-neutral, #6b7280);
		line-height: 1.4;
	}

	.page-path {
		font-size: 0.75rem;
		color: var(--ax-text-neutral, #9ca3af);
		font-family: "Monaco", "Menlo", "Ubuntu Mono", "Consolas", monospace;
	}

	.empty {
		color: var(--ax-text-neutral, #6b7280);
		font-style: italic;
	}
</style>
