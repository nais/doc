<script lang="ts">
	import type { Tokens } from "marked";
	import ListItemRenderer from "./ListItem.svelte";

	let { token }: { token: Tokens.List } = $props();

	// Check if this is a task list (has any items with task: true)
	const isTaskList = $derived(token.items.some((item) => item.task));
</script>

<svelte:element
	this={token.ordered ? "ol" : "ul"}
	start={token.ordered && typeof token.start === "number" ? token.start : undefined}
	class={isTaskList ? "task-list" : ""}
>
	{#each token.items as item, i (i)}
		<ListItemRenderer token={item} />
	{/each}
</svelte:element>

<style>
	/* Hide bullet markers for task lists */
	:global(.task-list) {
		list-style: none;
		padding-left: 0;
	}
</style>
