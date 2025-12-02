<script lang="ts">
	import { browser } from "$app/environment";
	import { afterNavigate } from "$app/navigation";
	import { resolve } from "$app/paths";
	import favicon from "$lib/assets/favicon.svg";
	import SearchButton from "$lib/SearchButton.svelte";
	import SearchModal from "$lib/SearchModal.svelte";
	import Sidebar from "$lib/Sidebar.svelte";
	import { setupTheme, type Theme as ThemeMode } from "$lib/state/theme.svelte";
	import ThemeToggle from "$lib/ThemeToggle.svelte";
	import { Spacer, Theme } from "@nais/ds-svelte-community";
	import { InternalHeader, InternalHeaderTitle } from "@nais/ds-svelte-community/experimental";
	import { MenuHamburgerIcon } from "@nais/ds-svelte-community/icons";
	import "../css/app.css";
	import type { LayoutProps } from "./$types";

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

	const themeState = setupTheme(getInitialTheme());

	function handleThemeChange(newTheme: ThemeMode) {
		themeState.theme = newTheme;
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
					themeState.theme = e.matches ? "dark" : "light";
				}
			};
			mediaQuery.addEventListener("change", handler);
			return () => mediaQuery.removeEventListener("change", handler);
		}
	});

	// Close sidebar when navigating to a new page
	afterNavigate(() => {
		if (browser) {
			const checkbox = document.getElementById("sidebar-toggle") as HTMLInputElement | null;
			if (checkbox) {
				checkbox.checked = false;
			}
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<noscript>
		<style>
			/* CSS checkbox hack works without JS - just hide the overlay */
			/* The overlay uses JS-like behavior we don't need without JS */
			.sidebar-overlay {
				display: none !important;
			}

			.hide-noscript {
				display: none !important;
			}
		</style>
	</noscript>
</svelte:head>

<Theme theme={themeState.theme}>
	<div class="layout-root">
		<!-- Hidden checkbox for CSS-only sidebar toggle -->
		<input type="checkbox" id="sidebar-toggle" class="sidebar-toggle-input" aria-hidden="true" />

		<header class="header-container">
			<InternalHeader>
				<!-- Hamburger menu button (label for checkbox) - only visible on mobile -->
				<label
					for="sidebar-toggle"
					class="sidebar-toggle-btn aksel-internalheader__button"
					aria-label="Toggle navigation menu"
				>
					<MenuHamburgerIcon aria-hidden="true" />
				</label>
				<InternalHeaderTitle href={resolve("/")}>Nais Docs</InternalHeaderTitle>
				<Spacer />
				<div class="hide-noscript contents">
					<SearchButton onclick={() => (searchOpen = true)} />
					<ThemeToggle theme={themeState.theme} onchange={handleThemeChange} />
				</div>
			</InternalHeader>
		</header>

		<SearchModal bind:open={searchOpen} />

		<div class="content-wrapper">
			<!-- Overlay to close sidebar when clicking outside (mobile) -->
			<label for="sidebar-toggle" class="sidebar-overlay" aria-hidden="true"></label>

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

<style lang="postcss">
	@reference "../css/app.css";

	.layout-root {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	/* Hidden checkbox that controls sidebar state */
	.sidebar-toggle-input {
		position: absolute;
		opacity: 0;
		pointer-events: none;
	}

	/* Hamburger button - hidden on desktop, uses InternalHeaderButton styling */
	:global(.sidebar-toggle-btn) {
		display: none;
		cursor: pointer;
		/* Override border from aksel-internalheader__button - we're on the left side */
		border-left: none !important;
		border-right: 1px solid var(--ax-border-neutral-subtleA) !important;
	}

	/* Overlay - hidden by default */
	.sidebar-overlay {
		display: none;
		position: fixed;
		top: var(--svdoc-header-height);
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 40;
		cursor: pointer;
	}

	.header-container {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 50;
		height: var(--svdoc-header-height);
	}

	.content-wrapper {
		display: flex;
		flex: 1;
		margin-top: var(--svdoc-header-height);
	}

	.sidebar-container {
		width: var(--svdoc-sidebar-width);
		flex-shrink: 0;
		padding: 1rem 0.5rem;
		border-right: 1px solid var(--ax-border-neutral-subtle, rgba(175, 184, 193, 0.2));
		background-color: var(--ax-bg-neutral-soft, rgba(0, 0, 0, 0.2));
		overflow-y: auto;
		overscroll-behavior: contain;
		position: fixed;
		top: var(--svdoc-header-height);
		left: 0;
		bottom: 0;
		height: calc(100vh - var(--svdoc-header-height));
		z-index: 45;
	}

	.main-content {
		flex: 1;
		min-width: 0;
		margin-left: var(--svdoc-sidebar-width);
		margin-right: var(--svdoc-toc-width);
		overflow-x: hidden;
	}

	.main-content-inner {
		max-width: var(--svdoc-content-max-width);
		margin: 0 auto;
		padding: var(--svdoc-content-padding);
	}

	/* Sidebar collapses */
	@media (width < theme(--breakpoint-svdoc-sidebar-collapse)) {
		/* Show hamburger button */
		:global(.sidebar-toggle-btn) {
			display: inline-flex;
		}

		/* Sidebar hidden by default, slides in from left */
		.sidebar-container {
			width: var(--svdoc-sidebar-width-mobile);
			transform: translateX(-100%);
			transition: transform var(--svdoc-transition-duration) var(--svdoc-transition-timing);
			background-color: var(--ax-bg-default, #0d1117);
		}

		/* Content takes full width on left */
		.main-content {
			margin-left: 0;
		}

		/* When checkbox is checked, show sidebar */
		.sidebar-toggle-input:checked ~ .content-wrapper .sidebar-container {
			transform: translateX(0);
		}

		/* Show overlay when sidebar is open */
		.sidebar-toggle-input:checked ~ .content-wrapper .sidebar-overlay {
			display: block;
		}
	}

	/* TOC hides */
	@media (width < theme(--breakpoint-svdoc-toc-hide)) {
		.main-content {
			margin-right: 0;
		}

		.main-content-inner {
			max-width: var(--svdoc-content-max-width-narrow);
			padding: var(--svdoc-content-padding-narrow);
		}
	}

	/* Mobile - smaller padding */
	@media (width < theme(--breakpoint-svdoc-mobile)) {
		.main-content-inner {
			padding: var(--svdoc-content-padding-mobile);
		}
	}
</style>
