<script lang="ts">
	import type { Tokens } from "marked";
	import ContentRenderer from "./ContentRenderer.svelte";

	let { token }: { token: Tokens.Blockquote } = $props();
</script>

<blockquote class="blockquote">
	{#if (token.tokens?.length || 0) > 0}
		<ContentRenderer tokens={token.tokens!} />
	{:else}
		{token.text}
	{/if}
</blockquote>

<style>
	.blockquote {
		margin: 1rem 0;
		padding: 0.75rem 1rem;
		border-left: 4px solid var(--ax-border-neutral-subtle, rgba(175, 184, 193, 0.4));
		background-color: var(--ax-bg-neutral-soft, rgba(175, 184, 193, 0.1));
		border-radius: 0 0.25rem 0.25rem 0;
		color: var(--ax-text-neutral, inherit);
	}

	.blockquote :global(p:first-child) {
		margin-top: 0;
	}

	.blockquote :global(p:last-child) {
		margin-bottom: 0;
	}
</style>
