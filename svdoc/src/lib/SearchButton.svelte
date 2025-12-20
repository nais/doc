<script lang="ts">
	import { InternalHeaderButton } from "@nais/ds-svelte-community/experimental";
	import { MagnifyingGlassIcon } from "@nais/ds-svelte-community/icons";

	interface Props {
		onclick: () => void;
	}

	let { onclick }: Props = $props();

	// Detect if user is on Mac for keyboard shortcut hint
	const isMac =
		typeof navigator !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0;
	const shortcutKey = isMac ? "⌘" : "Ctrl";
</script>

<InternalHeaderButton as="button" {onclick} aria-label="Search documentation">
	<MagnifyingGlassIcon aria-hidden="true" />
	<span class="search-label">Search</span>
	<kbd class="search-shortcut">{shortcutKey}+K</kbd>
</InternalHeaderButton>

<style>
	.search-label {
		margin-left: 0.375rem;
		margin-right: 0.25rem;
	}

	.search-shortcut {
		display: inline-block;
		padding: 0.125rem 0.375rem;
		font-family: monospace;
		font-size: 0.625rem;
		background: var(--ax-bg-neutral-soft, rgba(0, 0, 0, 0.2));
		border: 1px solid var(--ax-border-neutral-subtle, rgba(175, 184, 193, 0.2));
		border-radius: 4px;
		color: var(--ax-text-neutral-subtle, #6a7280);
	}

	@media (max-width: 600px) {
		.search-label,
		.search-shortcut {
			display: none;
		}
	}
</style>
