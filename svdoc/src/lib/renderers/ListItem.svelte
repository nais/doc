<script lang="ts">
	import { ListItem } from "@nais/ds-svelte-community";
	import type { Tokens } from "marked";
	import Renderer from "./Renderer.svelte";

	let { token }: { token: Tokens.ListItem } = $props();
</script>

<ListItem>
	{#if (token.tokens?.length || 0) > 0}
		<Renderer tokens={token.tokens!} />
	{:else}
		{token.text}
	{/if}
</ListItem>
