<script lang="ts">
	import Variable from "$lib/components/Variable.svelte";
	import type { CodeVariable } from "$lib/helpers/shiki";
	import { getContext } from "$lib/state/page_context.svelte";
	import { computePosition, flip, offset, shift } from "@floating-ui/dom";
	import { CopyButton } from "@nais/ds-svelte-community";
	import type { Token } from "marked";
	import { mount, onMount, unmount } from "svelte";
	import Renderer from "./Renderer.svelte";

	interface CodeAnnotation {
		id: string;
		line: number;
		tokens: Token[];
	}

	interface HighlightedCodeToken {
		// type: "highlighted_code";
		// raw: string;
		text: string;
		lang: string;
		lightHtml: string;
		darkHtml: string;
		title: string | null;
		annotations: CodeAnnotation[];
		variables?: CodeVariable[];
	}

	let { token }: { token: HighlightedCodeToken } = $props();

	// Get the page context to pass to mounted Variable components
	const ctx = getContext();

	const hasAnnotations = $derived(token.annotations && token.annotations.length > 0);
	const hasVariables = $derived(token.variables && token.variables.length > 0);

	// Compute copy text with variable values substituted
	const copyText = $derived.by(() => {
		let text = token.text;
		if (!token.variables || token.variables.length === 0) {
			return text;
		}
		// Replace each variable pattern with its current value from context
		for (const variable of token.variables) {
			const pattern = variable.isReadOnly ? `<${variable.name}:readonly>` : `<${variable.name}>`;
			const value = ctx.variables.get(variable.name) ?? pattern;
			text = text.replaceAll(pattern, value);
		}
		return text;
	});

	// Track mounted Variable components for cleanup
	let mountedVariables: Array<{ unmount: () => void }> = [];

	let codeContainer: HTMLDivElement | undefined = $state();
	let annotationSourceContainer: HTMLDivElement | undefined = $state();

	// Position a popover relative to its trigger button using Floating UI
	function positionPopover(button: HTMLElement, popover: HTMLElement) {
		computePosition(button, popover, {
			placement: "bottom-start",
			middleware: [offset(8), flip(), shift({ padding: 8 })],
		}).then(({ x, y }) => {
			Object.assign(popover.style, {
				left: `${x}px`,
				top: `${y}px`,
			});
		});
	}

	// Mount Variable components into marker spans
	function mountVariables() {
		if (!codeContainer || !hasVariables) return;

		// Clean up any previously mounted variables
		for (const v of mountedVariables) {
			v.unmount();
		}
		mountedVariables = [];

		// Find all variable marker spans
		const markers = codeContainer.querySelectorAll<HTMLSpanElement>(".svdoc-variable-marker");

		markers.forEach((marker) => {
			const name = marker.dataset.variableName;
			const readonly = marker.dataset.variableReadonly === "true";

			if (!name) return;

			// Clear the placeholder text
			marker.textContent = "";

			// Mount a Variable component into this span
			// Pass the context as a prop since mount() doesn't inherit Svelte context
			const instance = mount(Variable, {
				target: marker,
				props: {
					name,
					readonly,
					ctx,
				},
			});

			mountedVariables.push({ unmount: () => unmount(instance) });
		});
	}

	// After mount, inject annotation content and set up popover positioning
	onMount(() => {
		// Mount variables
		mountVariables();

		// Cleanup on unmount
		const cleanup = () => {
			for (const v of mountedVariables) {
				v.unmount();
			}
			mountedVariables = [];
		};

		if (!codeContainer || !annotationSourceContainer || !hasAnnotations) return cleanup;

		// Wait a tick for content to render
		requestAnimationFrame(() => {
			// For each annotation, find its rendered content and inject into popover
			token.annotations.forEach((annotation) => {
				const source = annotationSourceContainer?.querySelector(
					`[data-annotation-id="${annotation.id}"]`,
				);
				const popovers = codeContainer?.querySelectorAll(
					`[data-annotation-content="${annotation.id}"]`,
				);

				if (source && popovers) {
					popovers.forEach((popover) => {
						popover.innerHTML = source.innerHTML;
					});
				}
			});

			// Set up popover positioning for all annotation buttons
			const buttons = codeContainer?.querySelectorAll<HTMLButtonElement>(
				".code-annotation-marker[popovertarget]",
			);

			buttons?.forEach((button) => {
				const popoverId = button.getAttribute("popovertarget");
				if (!popoverId) return;

				const popover = document.getElementById(popoverId) as HTMLElement | null;
				if (!popover) return;

				// Position on toggle (when popover opens)
				popover.addEventListener("toggle", (e: Event) => {
					const event = e as ToggleEvent;
					if (event.newState === "open") {
						positionPopover(button, popover);
					}
				});

				return cleanup;
			});
		});
	});
</script>

<!-- Hidden annotation content for rendering -->
{#if hasAnnotations}
	<div class="annotation-content-source" aria-hidden="true" bind:this={annotationSourceContainer}>
		{#each token.annotations as annotation (annotation.id)}
			<div class="annotation-source" data-annotation-id={annotation.id}>
				<Renderer tokens={annotation.tokens} />
			</div>
		{/each}
	</div>
{/if}

<div class="code-block" class:has-annotations={hasAnnotations}>
	<div class="code-header">
		{#if token.title}
			<span class="title">{token.title}</span>
		{:else if token.lang && token.lang !== "text" && token.lang !== "plaintext"}
			<span class="language">{token.lang}</span>
		{:else}
			<span>Plaintext</span>
		{/if}
		<CopyButton size="small" variant="neutral" {copyText} class="hide-noscript" />
	</div>
	<div class="code-content" bind:this={codeContainer}>
		<div class="light-theme">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html token.lightHtml}
		</div>
		<div class="dark-theme">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html token.darkHtml}
		</div>
	</div>
</div>

<style>
	/* Hidden source for annotation content */
	.annotation-content-source {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	.code-block {
		margin: 1rem 0;
		border-radius: 0.5rem;
		border: 1px solid var(--ax-border-neutral-subtle, rgba(175, 184, 193, 0.2));
		/* Allow popups to overflow */
		overflow: visible;
		position: relative;
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

	.title {
		font-size: 0.8rem;
		font-weight: 500;
		color: var(--ax-text-neutral, inherit);
		font-family: "Monaco", "Menlo", "Ubuntu Mono", "Consolas", "source-code-pro", monospace;
	}

	.code-content {
		overflow-x: auto;
		position: relative;
	}

	/* Theme switching */
	.light-theme {
		display: block;
	}

	.dark-theme {
		display: none;
	}

	:global(.dark) .light-theme {
		display: none;
	}

	:global(.dark) .dark-theme {
		display: block;
	}

	/* Shiki pre/code styling */
	.code-content :global(pre) {
		margin: 0;
		padding: 1rem;
		overflow-x: auto;
		background-color: transparent !important;
	}

	.code-content :global(code) {
		font-family: "Monaco", "Menlo", "Ubuntu Mono", "Consolas", "source-code-pro", monospace;
		font-size: 0.875rem;
		line-height: 1.6;
	}

	/* Line styling */
	.code-content :global(.line) {
		display: inline-block;
		width: 100%;
		padding: 0 0.5rem;
		margin: 0 -0.5rem;
	}

	/* Highlighted line styling */
	.code-content :global(.highlighted-line) {
		background-color: rgba(255, 255, 0, 0.15);
		border-left: 3px solid #f0c000;
		padding-left: calc(0.5rem - 3px);
	}

	:global(.dark) .code-content :global(.highlighted-line) {
		background-color: rgba(255, 255, 0, 0.1);
		border-left-color: #e0b000;
	}

	/* Shiki theme backgrounds */
	.light-theme :global(pre) {
		background-color: #f6f8fa !important;
	}

	.dark-theme :global(pre) {
		background-color: #161b22 !important;
	}

	/* ===== Code Annotation Styles (Popover API) ===== */
	.code-content :global(.code-annotation) {
		display: inline-flex;
		align-items: center;
		margin-left: 0.5rem;
	}

	/* The circled number marker button */
	.code-content :global(.code-annotation-marker) {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.35rem;
		height: 1.35rem;
		border-radius: 50%;
		background-color: var(--ax-bg-info-moderate, rgba(90, 143, 174, 0.5));
		color: white;
		font-size: 0.7rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.15s ease;
		border: none;
		outline: none;
		padding: 0;
	}

	.code-content :global(.code-annotation-marker:hover),
	.code-content :global(.code-annotation-marker:focus) {
		background-color: var(--ax-bg-info, #5a8fae);
		transform: scale(1.1);
	}

	/* The popup container */
	.code-content :global(.code-annotation-popup) {
		position: absolute;
		left: 0;
		top: 100%;
		transform: translateX(-25%);
		margin-top: 0.5rem;
		opacity: 0;
		visibility: hidden;
		pointer-events: none;
		transition:
			opacity 0.2s ease,
			visibility 0.2s ease;
		z-index: 100;
		/* Ensure popup stays in viewport */
		max-width: min(400px, 90vw);
	}

	/* Show popup on hover/focus */
	.code-content :global(.code-annotation:hover .code-annotation-popup),
	.code-content :global(.code-annotation:focus-within .code-annotation-popup) {
		opacity: 1;
		visibility: visible;
		pointer-events: auto;
	}

	/* Popup arrow */
	.code-content :global(.code-annotation-popup-arrow) {
		position: absolute;
		top: -6px;
		left: 1.5rem;
		transform: rotate(45deg);
		width: 12px;
		height: 12px;
		background: var(--ax-bg-default, #fff);
		border-top: 1px solid var(--ax-border-neutral-subtle, rgba(175, 184, 193, 0.3));
		border-left: 1px solid var(--ax-border-neutral-subtle, rgba(175, 184, 193, 0.3));
		z-index: -1;
	}

	:global(.dark) .code-content :global(.code-annotation-popup-arrow) {
		background: #1e2530;
		border-color: rgba(175, 184, 193, 0.2);
	}

	/* Popup content */
	.code-content :global(.code-annotation-popup-content) {
		display: block;
		min-width: 220px;
		max-width: 400px;
		padding: 0.75rem 1rem;
		background: var(--ax-bg-default, #fff);
		border: 1px solid var(--ax-border-neutral-subtle, rgba(175, 184, 193, 0.3));
		border-radius: 0.5rem;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		font-size: 0.85rem;
		line-height: 1.6;
		color: var(--ax-text-default, inherit);
		text-align: left;
		white-space: normal;
		word-wrap: break-word;
		font-family:
			-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
	}

	:global(.dark .code-annotation-popover) {
		background: #1e2530;
		border-color: rgba(175, 184, 193, 0.2);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
	}

	/* Style content inside popover */
	:global(.code-annotation-popover p) {
		margin: 0 0 0.5rem 0;
	}

	:global(.code-annotation-popover p:last-child) {
		margin-bottom: 0;
	}

	:global(.code-annotation-popover code) {
		font-size: 0.8rem;
		padding: 0.15rem 0.35rem;
		background: var(--ax-bg-neutral-soft, rgba(175, 184, 193, 0.15));
		border-radius: 0.25rem;
	}

	:global(.code-annotation-popover a) {
		color: var(--ax-text-info, #5a8fae);
		text-decoration: none;
	}

	:global(.code-annotation-popover a:hover) {
		text-decoration: underline;
	}
</style>
