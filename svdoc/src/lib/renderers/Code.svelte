<script lang="ts">
	import { browser } from "$app/environment";
	import { getMermaidThemeVariables } from "$lib/helpers/mermaid";
	import { getTheme } from "$lib/state/theme.svelte";
	import { CopyButton } from "@nais/ds-svelte-community";
	import type { Tokens } from "marked";
	import mermaid from "mermaid";

	let { token }: { token: Tokens.Code } = $props();

	const id = $props.id();
	const themeState = getTheme();

	let mermaidSvg: string = $state("");
	let mermaidError: string | null = $state(null);

	const isMermaid = $derived(token.lang === "mermaid");
	const isDark = $derived(themeState?.isDark ?? false);

	$effect(() => {
		if (!browser || !isMermaid) return;

		// Track theme changes by accessing isDark
		const currentTheme = isDark;

		// Reset state for re-render
		mermaidError = null;

		mermaid.initialize({
			startOnLoad: false,
			theme: "base",
			themeVariables: getMermaidThemeVariables(currentTheme),
		});

		const mermaidId = `mermaid-${id}-${currentTheme ? "dark" : "light"}`;

		mermaid
			.render(mermaidId, token.text)
			.then((result) => {
				mermaidSvg = result.svg;
			})
			.catch((err) => {
				console.error("Mermaid rendering failed:", err);
				mermaidError = err.message || "Failed to render diagram";
			});
	});
</script>

{#if isMermaid}
	<div class="mermaid-diagram">
		{#if mermaidSvg}
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html mermaidSvg}
		{:else if mermaidError}
			<div class="mermaid-error">
				<p>Failed to render diagram:</p>
				<pre>{mermaidError}</pre>
				<details>
					<summary>Show source</summary>
					<pre>{token.text}</pre>
				</details>
			</div>
		{:else}
			<!-- Show code on server or while loading -->
			<div class="code-block">
				<div class="code-header">
					<span class="language">mermaid</span>
					<CopyButton size="small" variant="neutral" copyText={token.text} class="hide-noscript" />
				</div>
				<pre><code class="language-mermaid">{token.text}</code></pre>
			</div>
		{/if}
	</div>
{:else}
	<div class="code-block">
		<div class="code-header">
			{#if token.lang}
				<span class="language">{token.lang}</span>
			{/if}
			<CopyButton size="small" variant="neutral" copyText={token.text} class="hide-noscript" />
		</div>
		<pre><code class="language-{token.lang || 'text'}">{token.text}</code></pre>
	</div>
{/if}

<style>
	.mermaid-diagram {
		display: flex;
		justify-content: center;
		margin: 1.5rem 0;
		padding: 1rem;
		overflow-x: auto;
		background-color: var(--ax-bg-neutral-soft, rgba(175, 184, 193, 0.05));
		border: 1px solid var(--ax-border-neutral-subtle, rgba(175, 184, 193, 0.2));
		border-radius: 0.5rem;
	}

	.mermaid-diagram :global(svg) {
		max-width: 100%;
		height: auto;
	}

	/* Progressive shading for nested subgraphs - dark theme */
	:global(.dark) .mermaid-diagram :global(.cluster rect) {
		fill: #1e2530 !important;
	}

	:global(.dark) .mermaid-diagram :global(.cluster .cluster rect) {
		fill: #262d3a !important;
	}

	:global(.dark) .mermaid-diagram :global(.cluster .cluster .cluster rect) {
		fill: #2e3644 !important;
	}

	:global(.dark) .mermaid-diagram :global(.cluster .cluster .cluster .cluster rect) {
		fill: #363e4e !important;
	}

	/* Progressive shading for nested subgraphs - light theme */
	:global(.light) .mermaid-diagram :global(.cluster rect) {
		fill: #f0f1f3 !important;
	}

	:global(.light) .mermaid-diagram :global(.cluster .cluster rect) {
		fill: #e4e6e9 !important;
	}

	:global(.light) .mermaid-diagram :global(.cluster .cluster .cluster rect) {
		fill: #d8dadf !important;
	}

	:global(.light) .mermaid-diagram :global(.cluster .cluster .cluster .cluster rect) {
		fill: #cccfd5 !important;
	}

	.mermaid-error {
		padding: 1rem;
		color: var(--ax-text-danger, #ec526e);
		background-color: var(--ax-bg-danger-soft, rgba(236, 82, 110, 0.1));
		border-radius: 0.25rem;
		width: 100%;
	}

	.mermaid-error pre {
		margin: 0.5rem 0;
		padding: 0.5rem;
		background-color: var(--ax-bg-neutral-soft, rgba(0, 0, 0, 0.1));
		border-radius: 0.25rem;
		font-size: 0.75rem;
		overflow-x: auto;
	}

	.mermaid-error details {
		margin-top: 1rem;
	}

	.mermaid-error summary {
		cursor: pointer;
		color: var(--ax-text-subtle, #8b949e);
	}

	.code-block {
		margin: 1rem 0;
		border-radius: 0.5rem;
		overflow: hidden;
		background-color: var(--ax-bg-neutral-soft, rgba(175, 184, 193, 0.1));
		border: 1px solid var(--ax-border-neutral-subtle, rgba(175, 184, 193, 0.2));
	}

	.code-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 1rem;
		background-color: var(--ax-bg-neutral-moderate, rgba(175, 184, 193, 0.15));
		border-bottom: 1px solid var(--ax-border-neutral-subtle, rgba(175, 184, 193, 0.2));
	}

	.language {
		font-size: 0.75rem;
		font-weight: 500;
		text-transform: uppercase;
		color: var(--ax-text-neutral, inherit);
		opacity: 0.7;
	}

	pre {
		margin: 0;
		padding: 1rem;
		overflow-x: auto;
	}

	code {
		font-family: "Monaco", "Menlo", "Ubuntu Mono", "Consolas", "source-code-pro", monospace;
		font-size: 0.875rem;
		line-height: 1.5;
	}
</style>
