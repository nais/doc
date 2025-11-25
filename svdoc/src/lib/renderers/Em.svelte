<script lang="ts">
	import type { Tokens } from "marked";
	import Renderer from "./Renderer.svelte";

	let { token }: { token: Tokens.Em } = $props();
</script>

<em>
	{#if (token.tokens?.length || 0) > 0}
		<Renderer tokens={token.tokens!} />
	{:else}
		{token.text}
	{/if}
</em>
