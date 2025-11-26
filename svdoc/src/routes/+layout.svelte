<script lang="ts">
	import { browser } from "$app/environment";
	import { resolve } from "$app/paths";
	import favicon from "$lib/assets/favicon.svg";
	import SearchButton from "$lib/SearchButton.svelte";
	import SearchModal from "$lib/SearchModal.svelte";
	import Sidebar from "$lib/Sidebar.svelte";
	import ThemeToggle from "$lib/ThemeToggle.svelte";
	import { Spacer, Theme } from "@nais/ds-svelte-community";
	import { InternalHeader, InternalHeaderTitle } from "@nais/ds-svelte-community/experimental";
	import "../css/app.css";
	import type { LayoutProps } from "./$types";

	type ThemeMode = "light" | "dark";

	let { children, data }: LayoutProps = $props();
	const { navigation } = $derived(data);

	let searchOpen = $state(false);

	// Initialize theme from localStorage or system preference
	function getInitialTheme(): ThemeMode {
		if (browser) {
			const stored = localStorage.getItem("theme");
			if (stored === "light" || stored === "dark") {
				return stored;
			}
			// Fall back to system preference
			if (window.matchMedia("(prefers-color-scheme: light)").matches) {
				return "light";
			}
		}
		return "dark";
	}

	let theme = $state<ThemeMode>(getInitialTheme());

	function handleThemeChange(newTheme: ThemeMode) {
		theme = newTheme;
		if (browser) {
			localStorage.setItem("theme", newTheme);
		}
	}

	// Listen for system preference changes
	$effect(() => {
		if (browser) {
			const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
			const handler = (e: MediaQueryListEvent) => {
				// Only auto-switch if user hasn't explicitly set a preference
				if (!localStorage.getItem("theme")) {
					theme = e.matches ? "dark" : "light";
				}
			};
			mediaQuery.addEventListener("change", handler);
			return () => mediaQuery.removeEventListener("change", handler);
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<Theme {theme}>
	<div class="layout-root">
		<header class="header-container">
			<InternalHeader>
				<InternalHeaderTitle href={resolve("/")}>Nais Docs</InternalHeaderTitle>
				<Spacer />
				<SearchButton onclick={() => (searchOpen = true)} />
				<ThemeToggle {theme} onchange={handleThemeChange} />
			</InternalHeader>
		</header>

		<SearchModal bind:open={searchOpen} />

		<div class="content-wrapper">
			<aside class="sidebar-container scrollbar-thin">
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
