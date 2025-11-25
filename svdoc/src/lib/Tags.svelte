<script lang="ts">
	import { Tag } from "@nais/ds-svelte-community";

	interface Props {
		tags: string[];
	}

	let { tags }: Props = $props();
</script>

{#if tags.length > 0}
	<div class="tags">
		{#each tags as tag, i (i)}
			<Tag variant="alt3-moderate" size="small">{tag}</Tag>
		{/each}
	</div>
{/if}

<style>
	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
	}
</style>
