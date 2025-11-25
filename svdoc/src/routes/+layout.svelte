<script lang="ts">
	import favicon from "$lib/assets/favicon.svg";
	import Sidebar from "$lib/Sidebar.svelte";
	import { Page, Spacer, Theme } from "@nais/ds-svelte-community";
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
	<div class="fixed z-50 w-full">
		<InternalHeader>
			<InternalHeaderTitle href="#Home">Nais Docs</InternalHeaderTitle>
			<Spacer />
		</InternalHeader>
	</div>

	<Page contentBlockPadding="none">
		<div class="full-wrapper">
			<aside class="sidebar-container">
				<Sidebar items={navigation} />
			</aside>
			<main class="main-content">
				{@render children()}
			</main>
		</div>
	</Page>
</Theme>

<style>
	:global(.page) {
		margin: 0 auto 0 auto;
		min-width: 1000px;
		max-width: 1432px;
	}

	@media (max-width: 1464px) {
		:global(.page) {
			padding: 0 2rem;
		}
	}

	.full-wrapper {
		display: flex;
		padding-bottom: 1rem;
		min-height: calc(100vh - 48px);
	}

	.sidebar-container {
		width: 280px;
		flex-shrink: 0;
		padding: 1rem 0.5rem;
		border-right: 1px solid var(--ax-border-neutral-subtle, rgba(175, 184, 193, 0.2));
		background-color: var(--ax-bg-neutral-soft, rgba(0, 0, 0, 0.2));
		overflow-y: auto;
		position: sticky;
		top: 48px;
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
		overflow-x: hidden;
	}
</style>
