<script lang="ts">
	import { CopyButton } from "@nais/ds-svelte-community";
	import type { Tokens } from "marked";
	import mermaid from "mermaid";
	import { onMount } from "svelte";

	let { token }: { token: Tokens.Code } = $props();

	let mermaidContainer: HTMLDivElement | undefined = $state();
	let mermaidSvg: string = $state("");
	let mermaidError: string | null = $state(null);

	const isMermaid = $derived(token.lang === "mermaid");

	onMount(() => {
		if (isMermaid && mermaidContainer) {
			// Detect theme from parent element
			const themeElement = mermaidContainer.closest(".light, .dark");
			const isDark = themeElement?.classList.contains("dark") ?? false;

			mermaid.initialize({
				startOnLoad: false,
				theme: "base",
				themeVariables: isDark
					? {
							// Dark theme variables
							background: "#161d28",
							primaryColor: "#17365c",
							primaryTextColor: "#dfe1e5",
							primaryBorderColor: "#2e6db8",
							secondaryColor: "#242b37",
							secondaryTextColor: "#a5acb6",
							secondaryBorderColor: "#3a4250",
							tertiaryColor: "#2e3641",
							tertiaryTextColor: "#949ba8",
							tertiaryBorderColor: "#4a5260",
							lineColor: "#656d7b",
							textColor: "#dfe1e5",
							mainBkg: "#17365c",
							nodeBorder: "#2e6db8",
							clusterBkg: "#1e2530",
							clusterBorder: "#3a4250",
							titleColor: "#dfe1e5",
							edgeLabelBackground: "#242b37",
							nodeTextColor: "#dfe1e5",
							actorBkg: "#17365c",
							actorBorder: "#2e6db8",
							actorTextColor: "#dfe1e5",
							actorLineColor: "#656d7b",
							signalColor: "#dfe1e5",
							signalTextColor: "#dfe1e5",
							labelBoxBkgColor: "#242b37",
							labelBoxBorderColor: "#2e3641",
							labelTextColor: "#dfe1e5",
							loopTextColor: "#a5acb6",
							noteBkgColor: "#242b37",
							noteBorderColor: "#2e3641",
							noteTextColor: "#a5acb6",
							activationBkgColor: "#17365c",
							activationBorderColor: "#2e6db8",
							sequenceNumberColor: "#dfe1e5",
							sectionBkgColor: "#1c232f",
							altSectionBkgColor: "#242b37",
							sectionBkgColor2: "#161d28",
							taskBkgColor: "#17365c",
							taskBorderColor: "#2e6db8",
							taskTextColor: "#dfe1e5",
							taskTextLightColor: "#a5acb6",
							taskTextOutsideColor: "#dfe1e5",
							taskTextClickableColor: "#84aee6",
							activeTaskBorderColor: "#5f94d8",
							gridColor: "#2e3641",
							doneTaskBkgColor: "#207c41",
							doneTaskBorderColor: "#4ca265",
							critBkgColor: "#002300",
							critBorderColor: "#004000",
							todayLineColor: "#5f94d8",
							personBkg: "#17365c",
							personBorder: "#2e6db8",
						}
					: {
							// Light theme variables
							background: "#ffffff",
							primaryColor: "#bad5fb",
							primaryTextColor: "#202733",
							primaryBorderColor: "#0063c1",
							secondaryColor: "#ecedef",
							secondaryTextColor: "#49515e",
							secondaryBorderColor: "#c0c4ca",
							tertiaryColor: "#e1e3e7",
							tertiaryTextColor: "#5d6573",
							tertiaryBorderColor: "#b0b5bd",
							lineColor: "#818997",
							textColor: "#202733",
							mainBkg: "#bad5fb",
							nodeBorder: "#0063c1",
							clusterBkg: "#f0f1f3",
							clusterBorder: "#c0c4ca",
							titleColor: "#202733",
							edgeLabelBackground: "#f5f6f7",
							nodeTextColor: "#202733",
							actorBkg: "#bad5fb",
							actorBorder: "#0063c1",
							actorTextColor: "#202733",
							actorLineColor: "#818997",
							signalColor: "#202733",
							signalTextColor: "#202733",
							labelBoxBkgColor: "#f5f6f7",
							labelBoxBorderColor: "#cfd3d8",
							labelTextColor: "#202733",
							loopTextColor: "#49515e",
							noteBkgColor: "#f5f6f7",
							noteBorderColor: "#cfd3d8",
							noteTextColor: "#49515e",
							activationBkgColor: "#bad5fb",
							activationBorderColor: "#0063c1",
							sequenceNumberColor: "#202733",
							sectionBkgColor: "#f5f6f7",
							altSectionBkgColor: "#ecedef",
							sectionBkgColor2: "#ffffff",
							taskBkgColor: "#bad5fb",
							taskBorderColor: "#0063c1",
							taskTextColor: "#202733",
							taskTextLightColor: "#49515e",
							taskTextOutsideColor: "#202733",
							taskTextClickableColor: "#0063c1",
							activeTaskBorderColor: "#2176d4",
							gridColor: "#cfd3d8",
							doneTaskBkgColor: "#a8dfb4",
							doneTaskBorderColor: "#007629",
							critBkgColor: "#ffc2d7",
							critBorderColor: "#cb0035",
							todayLineColor: "#2176d4",
							personBkg: "#bad5fb",
							personBorder: "#0063c1",
						},
			});

			const id = `mermaid-${crypto.randomUUID()}`;
			mermaid
				.render(id, token.text)
				.then((result) => {
					mermaidSvg = result.svg;
				})
				.catch((err) => {
					console.error("Mermaid rendering failed:", err);
					mermaidError = err.message || "Failed to render diagram";
				});
		}
	});
</script>

{#if isMermaid}
	<div class="mermaid-diagram" bind:this={mermaidContainer}>
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
			<div class="mermaid-loading">Loading diagram...</div>
		{/if}
	</div>
{:else}
	<div class="code-block">
		<div class="code-header">
			{#if token.lang}
				<span class="language">{token.lang}</span>
			{/if}
			<CopyButton size="small" variant="neutral" copyText={token.text} />
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

	.mermaid-loading {
		padding: 2rem;
		color: var(--ax-text-subtle, #8b949e);
		font-style: italic;
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
