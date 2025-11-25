<script lang="ts">
	import favicon from "$lib/assets/favicon.svg";
	import Sidebar from "$lib/Sidebar.svelte";
	import { Spacer, Theme } from "@nais/ds-svelte-community";
	import { InternalHeader, InternalHeaderTitle } from "@nais/ds-svelte-community/experimental";
	import "../css/app.css";
	import type { LayoutProps } from "./$types";
	import "./layout.css";

	let { children, data }: LayoutProps = $props();
	const { navigation } = $derived(data);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<Theme theme="dark">
	<div class="layout-root">
		<header class="header-container">
			<InternalHeader>
				<InternalHeaderTitle href="#Home">Nais Docs</InternalHeaderTitle>
				<Spacer />
			</InternalHeader>
		</header>

		<div class="content-wrapper">
			<aside class="sidebar-container">
				<Sidebar items={navigation} />
			</aside>
			<main class="main-content">
				<div class="main-content-inner">
					{@render children()}
				</div>
			</main>
		</div>
	</div>
</Theme>

<style>
	.layout-root {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	.header-container {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 50;
	}

	.content-wrapper {
		display: flex;
		flex: 1;
		margin-top: 48px; /* Height of InternalHeader */
	}

	.sidebar-container {
		width: 280px;
		flex-shrink: 0;
		padding: 1rem 0.5rem;
		border-right: 1px solid var(--ax-border-neutral-subtle, rgba(175, 184, 193, 0.2));
		background-color: var(--ax-bg-neutral-soft, rgba(0, 0, 0, 0.2));
		overflow-y: auto;
		position: fixed;
		top: 48px;
		left: 0;
		bottom: 0;
		height: calc(100vh - 48px);

		/* Firefox scrollbar */
		scrollbar-width: thin;
		scrollbar-color: var(--ax-border-neutral-subtle, rgba(175, 184, 193, 0.3)) transparent;
	}

	/* Webkit scrollbar styling */
	.sidebar-container::-webkit-scrollbar {
		width: 6px;
	}

	.sidebar-container::-webkit-scrollbar-track {
		background: transparent;
	}

	.sidebar-container::-webkit-scrollbar-thumb {
		background-color: var(--ax-border-neutral-subtle, rgba(175, 184, 193, 0.3));
		border-radius: 3px;
	}

	.sidebar-container::-webkit-scrollbar-thumb:hover {
		background-color: var(--ax-border-neutral, rgba(175, 184, 193, 0.5));
	}

	.main-content {
		flex: 1;
		min-width: 0;
		margin-left: 280px; /* Same as sidebar width */
		overflow-x: hidden;
	}

	.main-content-inner {
		max-width: 1000px;
		margin: 0 auto;
		padding: 1.5rem 2rem;
	}

	/* Responsive adjustments */
	@media (max-width: 1200px) {
		.main-content-inner {
			max-width: 900px;
			padding: 1rem 1.5rem;
		}
	}

	@media (max-width: 900px) {
		.sidebar-container {
			width: 240px;
		}

		.main-content {
			margin-left: 240px;
		}

		.main-content-inner {
			max-width: none;
			padding: 1rem;
		}
	}
</style>
