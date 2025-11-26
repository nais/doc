<script lang="ts">
	import { Tag } from "@nais/ds-svelte-community";

	interface Props {
		tags: string[];
	}

	let { tags }: Props = $props();

	/**
	 * Convert a tag name to a URL-safe slug
	 */
	function tagToSlug(tag: string): string {
		return tag
			.toLowerCase()
			.replace(/\s+/g, "-")
			.replace(/[^a-z0-9-]/g, "");
	}
</script>

{#if tags.length > 0}
	<div class="tags">
		{#each tags as tag (tag)}
			<a href="/tags/{tagToSlug(tag)}" class="tag-link">
				<Tag variant="alt3-moderate" size="small">{tag}</Tag>
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
