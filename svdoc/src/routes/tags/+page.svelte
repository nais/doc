<script lang="ts">
	import { browser } from "$app/environment";
	import { resolve } from "$app/paths";
	import { Tag } from "@nais/ds-svelte-community";
	import { onMount } from "svelte";
	import type { PageProps } from "./$types";

	let { data }: PageProps = $props();
	const { tags } = $derived(data);

	// Handle MkDocs-style tag hash syntax: #tag:workloads
	onMount(() => {
		if (!browser) return;

		const hash = window.location.hash;
		if (hash.startsWith("#tag:")) {
			const tagName = hash.slice(5); // Remove "#tag:" prefix
			const element = document.getElementById(`tag:${tagName}`);
			if (element) {
				element.scrollIntoView({ behavior: "smooth", block: "center" });
				element.focus();
			}
		}
	});
</script>

<svelte:head>
	<title>Tags - Nais</title>
</svelte:head>

<article class="tags-page">
	<h1>Tags</h1>
	<p class="description">Browse documentation by topic tags.</p>

	<div class="tags-grid">
		{#each tags as tag (tag.slug)}
			<a href={resolve("/tags/[tag]", { tag: tag.slug })} class="tag-card" id="tag:{tag.slug}">
				<Tag variant="alt3-moderate" size="small">{tag.name}</Tag>
				<span class="count">{tag.count} {tag.count === 1 ? "page" : "pages"}</span>
			</a>
		{/each}
	</div>

	{#if tags.length === 0}
		<p class="empty">No tags found.</p>
	{/if}
</article>

<style>
	.tags-page {
		padding: 2rem;
		max-width: 900px;
	}

	h1 {
		margin-bottom: 0.5rem;
	}

	.description {
		color: var(--ax-text-neutral, #6b7280);
		margin-bottom: 2rem;
	}

	.tags-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 1rem;
	}

	.tag-card {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 1rem;
		border: 1px solid var(--ax-border-neutral-subtle, rgba(175, 184, 193, 0.3));
		border-radius: 0.5rem;
		background-color: var(--ax-bg-neutral-soft, rgba(175, 184, 193, 0.05));
		text-decoration: none;
		transition: all 0.2s ease;
	}

	.tag-card:hover {
		border-color: var(--ax-border-accent, rgba(0, 103, 197, 0.5));
		background-color: var(--ax-bg-accent-soft, rgba(0, 103, 197, 0.1));
		transform: translateY(-2px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	}

	.count {
		font-size: 0.875rem;
		color: var(--ax-text-neutral, #6b7280);
	}

	.empty {
		color: var(--ax-text-neutral, #6b7280);
		font-style: italic;
	}
</style>
