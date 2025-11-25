<script lang="ts">
	import NavItem from "./NavItem.svelte";
	import type { NavItem as NavItemType } from "./navigation";

	interface Props {
		items: NavItemType[];
	}

	let { items }: Props = $props();
</script>

<nav class="sidebar">
	<ul class="nav-list">
		{#each items as item, i (i)}
			<NavItem {item} />
		{/each}
	</ul>
</nav>

<style>
	.sidebar {
		font-size: 0.9375rem;
		line-height: 1.4;
	}

	.nav-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}
</style>
