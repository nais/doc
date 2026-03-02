<script lang="ts">
	import { onMount } from "svelte";

	interface Props {
		createdAt?: string;
		modifiedAt?: string;
		sourcePath?: string;
		githubBaseUrl?: string;
	}

	let {
		createdAt,
		modifiedAt,
		sourcePath,
		githubBaseUrl = "https://github.com/nais/doc/blob/main",
	}: Props = $props();

	let mounted = $state(false);

	onMount(() => {
		mounted = true;
	});

	function formatDate(isoDate: string): string {
		const date = new Date(isoDate);
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	}

	function getRelativeTime(isoDate: string): string {
		const date = new Date(isoDate);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

		if (diffDays === 0) {
			return "Today";
		} else if (diffDays === 1) {
			return "Yesterday";
		} else if (diffDays < 7) {
			return `${diffDays} days ago`;
		} else if (diffDays < 30) {
			const weeks = Math.floor(diffDays / 7);
			return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
		} else if (diffDays < 365) {
			const months = Math.floor(diffDays / 30);
			return months === 1 ? "1 month ago" : `${months} months ago`;
		} else {
			const years = Math.floor(diffDays / 365);
			return years === 1 ? "1 year ago" : `${years} years ago`;
		}
	}

	const sourceUrl = $derived(sourcePath ? `${githubBaseUrl}/${sourcePath}` : null);
</script>

{#if createdAt || modifiedAt || sourceUrl}
	<footer class="page-meta">
		<div class="meta-items">
			{#if modifiedAt}
				<div class="meta-item">
					<span class="meta-label">Last updated</span>
					<time datetime={modifiedAt}>
						{#if mounted}
							{getRelativeTime(modifiedAt)}
						{:else}
							{formatDate(modifiedAt)}
						{/if}
					</time>
				</div>
			{/if}

			{#if createdAt}
				<div class="meta-item">
					<span class="meta-label">Created</span>
					<time datetime={createdAt}>
						{#if mounted}
							{getRelativeTime(createdAt)}
						{:else}
							{formatDate(createdAt)}
						{/if}
					</time>
				</div>
			{/if}

			{#if sourceUrl}
				<div class="meta-item">
					<a href={sourceUrl} target="_blank" rel="noopener noreferrer" class="source-link">
						View source on GitHub
					</a>
				</div>
			{/if}
		</div>
	</footer>
{/if}

<style>
	.page-meta {
		margin-top: 3rem;
		padding-top: 1.5rem;
		border-top: 1px solid var(--ax-border-neutral-subtle, rgba(175, 184, 193, 0.2));
	}

	.meta-items {
		display: flex;
		flex-wrap: wrap;
		gap: 1.5rem;
		font-size: 0.875rem;
		color: var(--ax-text-neutral-subtle);
	}

	.meta-item {
		display: flex;
		flex-direction: row;
		gap: 0.25rem;
		align-items: center;
	}

	.meta-label {
		font-size: 0.75rem;
		letter-spacing: 0.05em;
		opacity: 0.7;
	}

	time {
		color: var(--ax-text-neutral);
	}

	.source-link {
		color: var(--ax-text-accent);
		text-decoration: none;
	}

	.source-link:hover {
		text-decoration: underline;
	}
</style>
