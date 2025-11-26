<script lang="ts">
	import { List } from "@nais/ds-svelte-community";
	import type { Tokens } from "marked";
	import ListItemRenderer from "./ListItem.svelte";

	let { token }: { token: Tokens.List } = $props();

	// Check if this is a task list (has any items with task: true)
	const isTaskList = $derived(token.items.some((item) => item.task));
</script>

<List as={token.ordered ? "ol" : "ul"} class={isTaskList ? "task-list" : ""}>
	{#each token.items as item, i (i)}
		<ListItemRenderer token={item} />
	{/each}
</List>

<style>
	/* Hide bullet markers for task lists */
	:global(.task-list) {
		list-style: none;
		padding-left: 0;
	}

	:global(.task-list .aksel-list__item-marker) {
		display: none;
	}
</style>
