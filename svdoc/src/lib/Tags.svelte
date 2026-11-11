<script lang="ts">
	import { resolve } from "$app/paths";
	import { Tag } from "$lib/shadcn/ui";
	import { tagToSlug } from "./utils";

	interface Props {
		tags: string[];
	}

	let { tags }: Props = $props();
</script>

{#if tags.length > 0}
	<div class="tags">
		{#each tags as tag (tag)}
			<a href={resolve("/tags/[tag]", { tag: tagToSlug(tag) })} class="tag-link">
				<Tag>{tag}</Tag>
			</a>
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

	.tag-link {
		text-decoration: none;
		transition: transform 0.15s ease;
	}

	.tag-link:hover {
		transform: translateY(-1px);
	}
</style>
