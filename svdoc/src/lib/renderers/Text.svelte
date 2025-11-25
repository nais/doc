<script lang="ts">
	import type { Tokens } from "marked";
	import Renderer from "./Renderer.svelte";

	let { token }: { token: Tokens.Text } = $props();
</script>

{#if (token.tokens?.length || 0) > 0}
	<Renderer tokens={token.tokens!} />
{:else}
	{token.text}
{/if}
