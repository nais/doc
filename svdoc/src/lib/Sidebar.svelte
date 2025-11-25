<script lang="ts">
	import type { NavItem } from "./navigation";

	interface Props {
		items: NavItem[];
	}

	let { items }: Props = $props();
</script>

<nav class="sidebar">
	<ul class="nav-list">
		{#each items as item, i (i)}
			<li class="nav-item">
				<a href={item.href} class="nav-link nav-link--top">{item.title}</a>
				{#if item.children && item.children.length > 0}
					<ul class="nav-children">
						{#each item.children as child, j (j)}
							<li class="nav-child">
								<a href={child.href} class="nav-link">{child.title}</a>
								{#if child.children && child.children.length > 0}
									<ul class="nav-grandchildren">
										{#each child.children as grandchild, k (k)}
											<li class="nav-grandchild">
												<a href={grandchild.href} class="nav-link">{grandchild.title}</a>
											</li>
										{/each}
									</ul>
								{/if}
							</li>
						{/each}
					</ul>
				{/if}
			</li>
		{/each}
	</ul>
</nav>

<style>
	.sidebar {
		font-size: 0.875rem;
		line-height: 1.5;
	}

	.nav-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.nav-item {
		margin-bottom: 0.5rem;
	}

	.nav-link {
		display: block;
		padding: 0.375rem 0.75rem;
		color: var(--ax-text-neutral, #c9d1d9);
		text-decoration: none;
		border-radius: 0.375rem;
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
		color: var(--ax-text-default, #f0f6fc);
		padding: 0.5rem 0.75rem;
		margin-bottom: 0.125rem;
	}

	.nav-children {
		list-style: none;
		padding: 0;
		margin: 0.25rem 0 0.5rem 0;
		padding-left: 0.75rem;
		border-left: 1px solid var(--ax-border-neutral-subtle, rgba(175, 184, 193, 0.2));
		margin-left: 0.75rem;
	}

	.nav-child {
		margin-bottom: 0.125rem;
	}

	.nav-children .nav-link {
		padding: 0.25rem 0.75rem;
		font-size: 0.8125rem;
		color: var(--ax-text-subtle, #8b949e);
	}

	.nav-children .nav-link:hover {
		color: var(--ax-text-default, #f0f6fc);
	}

	.nav-grandchildren {
		list-style: none;
		padding: 0;
		margin: 0.25rem 0 0.25rem 0;
		padding-left: 0.75rem;
		border-left: 1px solid var(--ax-border-neutral-subtle, rgba(175, 184, 193, 0.15));
		margin-left: 0.5rem;
	}

	.nav-grandchild {
		margin-bottom: 0.0625rem;
	}

	.nav-grandchildren .nav-link {
		padding: 0.1875rem 0.5rem;
		font-size: 0.75rem;
		color: var(--ax-text-subtle, #6e7681);
	}

	.nav-grandchildren .nav-link:hover {
		color: var(--ax-text-default, #f0f6fc);
	}
</style>
