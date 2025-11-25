<script lang="ts">
	import type { NavItem } from "./navigation";
	import Self from "./NavItem.svelte";

	interface Props {
		item: NavItem;
		depth?: number;
	}

	let { item, depth = 0 }: Props = $props();
</script>

<li class="nav-item" class:nav-item--top={depth === 0}>
	<a
		href={item.href}
		class="nav-link"
		class:nav-link--top={depth === 0}
		class:nav-link--child={depth === 1}
		class:nav-link--grandchild={depth >= 2}
	>
		{item.title}
	</a>
	{#if item.children && item.children.length > 0}
		<ul
			class="nav-children"
			class:nav-children--top={depth === 0}
			class:nav-children--nested={depth >= 1}
		>
			{#each item.children as child, i (i)}
				<Self item={child} depth={depth + 1} />
			{/each}
		</ul>
	{/if}
</li>

<style>
	.nav-item {
		margin-bottom: 0;
	}

	.nav-item--top {
		margin-bottom: 0.25rem;
	}

	.nav-link {
		display: block;
		padding: 0.25rem 0.5rem;
		color: var(--ax-text-neutral, #c9d1d9);
		text-decoration: none;
		border-radius: 0.25rem;
		transition:
			background-color 0.15s ease,
			color 0.15s ease;
	}

	.nav-link:hover {
		background-color: var(--ax-bg-neutral-soft, rgba(175, 184, 193, 0.1));
		color: var(--ax-text-default, #f0f6fc);
	}

	.nav-link--top {
		font-weight: 600;
		font-size: 0.9375rem;
		color: var(--ax-text-default, #f0f6fc);
		padding: 0.3rem 0.5rem;
		margin-bottom: 0.125rem;
	}

	.nav-link--child {
		padding: 0.2rem 0.5rem;
		font-size: 0.875rem;
		color: var(--ax-text-subtle, #8b949e);
	}

	.nav-link--child:hover {
		color: var(--ax-text-default, #f0f6fc);
	}

	.nav-link--grandchild {
		padding: 0.15rem 0.5rem;
		font-size: 0.8125rem;
		color: var(--ax-text-subtle, #6e7681);
	}

	.nav-link--grandchild:hover {
		color: var(--ax-text-default, #f0f6fc);
	}

	.nav-children {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.nav-children--top {
		margin: 0.125rem 0 0.25rem 0;
		padding-left: 0.625rem;
		border-left: 1px solid var(--ax-border-neutral-subtle, rgba(175, 184, 193, 0.2));
		margin-left: 0.5rem;
	}

	.nav-children--nested {
		margin: 0.125rem 0 0.125rem 0;
		padding-left: 0.625rem;
		border-left: 1px solid var(--ax-border-neutral-subtle, rgba(175, 184, 193, 0.15));
		margin-left: 0.375rem;
	}
</style>
