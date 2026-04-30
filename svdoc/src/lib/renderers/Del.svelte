<script lang="ts">
	import type { Tokens } from "marked";
	import Renderer from "./Renderer.svelte";

	let { token }: { token: Tokens.Del } = $props();
</script>

<del>
	{#if (token.tokens?.length || 0) > 0}
		<Renderer tokens={token.tokens!} />
	{:else}
		{token.text}
	{/if}
</del>

<style>
	del {
		text-decoration: line-through;
		opacity: 0.7;
	}
</style>
