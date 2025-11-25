<script lang="ts">
	import type { Tokens } from "marked";

	let { token }: { token: Tokens.Image } = $props();

	// Check if this is an emoji (twemoji pattern)
	const isEmoji = token.href.includes("twemoji") || token.text.startsWith(":");
</script>

{#if isEmoji}
	<img src={token.href} alt={token.text} title={token.title || token.text} class="twemoji" />
{:else}
	<img src={token.href} alt={token.text} title={token.title} />
{/if}

<style>
	.twemoji {
		display: inline;
		height: 1.25em;
		width: 1.25em;
		vertical-align: text-bottom;
	}

	img {
		max-width: 100%;
		height: auto;
	}
</style>
