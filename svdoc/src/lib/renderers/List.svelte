<script lang="ts">
	import { List } from "@nais/ds-svelte-community";
	import type { Tokens } from "marked";
	import ListItemRenderer from "./ListItem.svelte";

	let { token }: { token: Tokens.List } = $props();
</script>

<List as={token.ordered ? "ol" : "ul"}>
	{#each token.items as item, i (i)}
		<ListItemRenderer token={item} />
	{/each}
</List>
