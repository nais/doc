<script lang="ts">
	import Renderer from "$lib/renderers/Renderer.svelte";
	import type { PageProps } from "./$types";

	let { data }: PageProps = $props();
	const { tokens } = $derived(data);
</script>

<article class="md-content">
	<Renderer {tokens} />
</article>

<style>
	.md-content {
		padding: 2rem;
		max-width: 100%;
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
