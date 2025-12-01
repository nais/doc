<script lang="ts">
	import { page } from "$app/state";
	import type { NavItem } from "./content-store";
	import Self from "./NavItem.svelte";

	interface Props {
		item: NavItem;
		depth?: number;
	}

	let { item, depth = 0 }: Props = $props();

	// Check if this item or any descendant is active
	function isActiveOrHasActiveDescendant(navItem: NavItem, path: string): boolean {
		// Check if this item is active
		if (navItem.href && path.startsWith(navItem.href)) {
			// Exact match or path continues with /
			if (path === navItem.href || path.startsWith(navItem.href + "/")) {
				return true;
			}
		}
		// Check children recursively
		if (navItem.children) {
			for (const child of navItem.children) {
				if (isActiveOrHasActiveDescendant(child, path)) {
					return true;
				}
			}
		}
		return false;
	}

	const hasChildren = $derived(item.children && item.children.length > 0);
	const isOpen = $derived(isActiveOrHasActiveDescendant(item, page.url.pathname));
	const isActive = $derived(page.url.pathname === item.href);
</script>

<li class="nav-item" class:nav-item--top={depth === 0}>
	{#if hasChildren}
		<details class="nav-details" open={isOpen}>
			<summary
				class="nav-row"
				class:nav-row--top={depth === 0}
				class:nav-row--child={depth === 1}
				class:nav-row--grandchild={depth >= 2}
			>
				{#if item.hasContent}
					<a
						href={item.href}
						class="nav-link"
						class:nav-link--top={depth === 0}
						class:nav-link--child={depth === 1}
						class:nav-link--grandchild={depth >= 2}
						class:nav-link--active={isActive}
					>
						{item.title}
					</a>
				{:else}
					<span
						class="nav-label"
						class:nav-label--top={depth === 0}
						class:nav-label--child={depth === 1}
						class:nav-label--grandchild={depth >= 2}
					>
						{item.title}
					</span>
				{/if}
				<span class="nav-chevron" aria-hidden="true"></span>
			</summary>
			<ul
				class="nav-children"
				class:nav-children--top={depth === 0}
				class:nav-children--nested={depth >= 1}
			>
				{#each item.children as child, i (i)}
					<Self item={child} depth={depth + 1} />
				{/each}
			</ul>
		</details>
	{:else}
		<a
			href={item.href}
			class="nav-link"
			class:nav-link--top={depth === 0}
			class:nav-link--child={depth === 1}
			class:nav-link--grandchild={depth >= 2}
			class:nav-link--active={isActive}
		>
			{item.title}
		</a>
	{/if}
</li>

<style>
	.nav-item {
		margin-bottom: 0;
		list-style: none;
	}

	.nav-item--top {
		margin-bottom: 0.25rem;
	}

	.nav-details {
		display: contents;
	}

	.nav-row {
		display: flex;
		align-items: center;
		cursor: pointer;
		list-style: none;
	}

	/* Hide default marker */
	.nav-row::-webkit-details-marker {
		display: none;
	}

	.nav-row::marker {
		display: none;
		content: "";
	}

	.nav-chevron {
		flex-shrink: 0;
		width: 1.5rem;
		height: 2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--ax-text-subtle, #6e7681);
		transition: transform 0.15s ease;
		overflow: hidden;
	}

	.nav-chevron::before {
		content: "›";
		font-size: 2rem;
		line-height: 1;
	}

	details[open] > summary .nav-chevron {
		transform: rotate(90deg);
	}

	.nav-link {
		flex: 1;
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

	.nav-link--active {
		background-color: var(--ax-bg-neutral-soft, rgba(175, 184, 193, 0.15));
		color: var(--ax-text-default, #f0f6fc);
		font-weight: 500;
	}

	.nav-link--top {
		font-weight: 600;
		font-size: 1rem;
		color: var(--ax-text-default, #f0f6fc);
		padding: 0.3rem 0.5rem;
		margin-bottom: 0.125rem;
	}

	.nav-label {
		flex: 1;
		display: block;
		padding: 0.25rem 0.5rem;
		color: var(--ax-text-neutral);
	}

	.nav-label--top {
		font-weight: 600;
		font-size: 1rem;
		padding: 0.3rem 0.5rem;
		margin-bottom: 0.125rem;
	}

	.nav-label--child {
		padding: 0.2rem 0.5rem;
		font-size: 0.9375rem;
	}

	.nav-label--grandchild {
		padding: 0.15rem 0.5rem;
		font-size: 0.9375rem;
	}

	.nav-link--child {
		padding: 0.2rem 0.5rem;
		font-size: 0.9375rem;
		color: var(--ax-text-subtle, #8b949e);
	}

	.nav-link--child:hover {
		color: var(--ax-text-default, #f0f6fc);
	}

	.nav-link--grandchild {
		padding: 0.15rem 0.5rem;
		font-size: 0.9375rem;
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
