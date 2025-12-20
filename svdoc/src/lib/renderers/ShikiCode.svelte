<script lang="ts">
	import Variable from "$lib/components/Variable.svelte";
	import { highlightCodeDual, parseHighlightLines, parseTitle } from "$lib/helpers/shiki";
	import { getContext } from "$lib/state/page_context.svelte";
	import { CopyButton } from "@nais/ds-svelte-community";
	import type { Token } from "marked";
	import { mount, unmount } from "svelte";
	import ContentRenderer from "./ContentRenderer.svelte";

	let {
		text,
		lang,
		annotations: tokenAnnotations,
	}: { text: string; lang: string; annotations?: Token[][] } = $props();

	const ctx = getContext();
	const codeBlockId = $props.id();

	// Parse language and title from the lang info string
	const langInfo = lang || "text";
	const { language } = parseHighlightLines(langInfo);
	const title = parseTitle(langInfo);

	// Highlight code with Shiki (async)
	const highlighted = await highlightCodeDual(text, langInfo);

	// Merge Shiki annotations (line info) with token annotations (content)
	const annotationsWithContent = $derived.by(() => {
		if (!highlighted.annotations || highlighted.annotations.length === 0) return [];
		if (!tokenAnnotations || tokenAnnotations.length === 0) return [];

		return highlighted.annotations.map((ann, idx) => ({
			id: ann.id,
			line: ann.line,
			tokens: tokenAnnotations[idx] || [],
		}));
	});

	const hasAnnotations = $derived(annotationsWithContent.length > 0);
	const hasVariables = highlighted.variables && highlighted.variables.length > 0;

	// Track which annotation is currently highlighted
	let highlightedAnnotation = $state<string | null>(null);
	let highlightTimeout: ReturnType<typeof setTimeout> | null = null;

	// Compute copy text with variable values substituted
	const copyText = $derived.by(() => {
		let result = text;
		if (!highlighted.variables || highlighted.variables.length === 0) {
			return result;
		}
		for (const variable of highlighted.variables) {
			const pattern = variable.isReadOnly ? `<${variable.name}:readonly>` : `<${variable.name}>`;
			const value = ctx.variables.get(variable.name) ?? pattern;
			result = result.replaceAll(pattern, value);
		}
		return result;
	});

	// Track mounted Variable components for cleanup
	let mountedVariables: Array<{ unmount: () => void }> = [];
	let codeContainer: HTMLDivElement | undefined = $state();

	// Mount Variable components into marker spans
	function mountVariables() {
		console.log("mount variables");
		if (!codeContainer || !hasVariables) return;

		for (const v of mountedVariables) {
			v.unmount();
		}
		mountedVariables = [];

		const markers = codeContainer.querySelectorAll<HTMLSpanElement>(".svdoc-variable-marker");

		markers.forEach((marker) => {
			const name = marker.dataset.variableName;
			const readonly = marker.dataset.variableReadonly === "true";

			if (!name) return;

			marker.textContent = "";

			const instance = mount(Variable, {
				target: marker,
				props: { name, readonly, ctx },
			});

			mountedVariables.push({ unmount: () => unmount(instance) });
		});
	}

	// Handle annotation marker clicks
	function handleAnnotationClick(annotationId: string) {
		// Clear any existing timeout
		if (highlightTimeout) {
			clearTimeout(highlightTimeout);
		}

		highlightedAnnotation = annotationId;

		// Scroll the annotation into view
		const annotationElement = document.getElementById(`annotation-${codeBlockId}-${annotationId}`);
		annotationElement?.scrollIntoView({ behavior: "smooth", block: "nearest" });

		// Remove highlight after a delay
		highlightTimeout = setTimeout(() => {
			highlightedAnnotation = null;
			highlightTimeout = null;
		}, 2000);
	}

	// Handle click/keyboard on annotation markers using event delegation
	function handleCodeContentInteraction(event: MouseEvent | KeyboardEvent) {
		const target = event.target as HTMLElement;
		const marker = target.closest(".code-annotation-marker");
		if (!marker) return;

		// For keyboard events, only handle Enter and Space
		if (event instanceof KeyboardEvent && event.key !== "Enter" && event.key !== " ") {
			return;
		}

		// Prevent space from scrolling the page
		if (event instanceof KeyboardEvent && event.key === " ") {
			event.preventDefault();
		}

		const annotationSpan = marker.closest(".code-annotation");
		const annotationId = annotationSpan?.getAttribute("data-annotation-id");
		if (annotationId) {
			handleAnnotationClick(annotationId);
		}
	}

	$effect(() => {
		mountVariables();

		return () => {
			for (const v of mountedVariables) {
				v.unmount();
			}
			mountedVariables = [];

			// Clear timeout on unmount
			if (highlightTimeout) {
				clearTimeout(highlightTimeout);
			}
		};
	});
</script>

<div class="code-block">
	<div class="code-header">
		{#if title}
			<span class="title">{title}</span>
		{:else if language && language !== "text" && language !== "plaintext"}
			<span class="language">{language}</span>
		{:else}
			<span class="language">Plaintext</span>
		{/if}
		<CopyButton size="small" variant="neutral" {copyText} class="hide-noscript" />
	</div>
	<div
		class="code-content"
		bind:this={codeContainer}
		id={codeBlockId}
		onclick={handleCodeContentInteraction}
		onkeydown={handleCodeContentInteraction}
		role="presentation"
	>
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html highlighted.html}
	</div>
</div>

{#if hasAnnotations}
	<div class="annotation-list">
		{#each annotationsWithContent as annotation (annotation.id)}
			<div
				class="annotation-item"
				class:highlighted={highlightedAnnotation === annotation.id}
				id="annotation-{codeBlockId}-{annotation.id}"
			>
				<span class="annotation-number">{annotation.id}</span>
				<div class="annotation-content">
					<ContentRenderer tokens={annotation.tokens} />
				</div>
			</div>
		{/each}
	</div>
{/if}

<style>
	.code-block {
		margin: 1rem 0;
		border-radius: 0.5rem;
		border: 1px solid var(--ax-border-neutral-subtle, rgba(175, 184, 193, 0.2));
		background-color: var(--ax-bg-default);
		/* Force width to parent, don't grow with content */
		width: 0;
		min-width: 100%;
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
	}

	/* Shiki pre/code styling */
	.code-content :global(pre) {
		margin: 0;
		padding: 1rem;
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
		white-space: pre;
	}

	/* Highlighted line styling */
	.code-content :global(.highlighted-line) {
		background-color: light-dark(rgba(255, 255, 0, 0.15), rgba(255, 255, 0, 0.1));
		border-left: 3px solid light-dark(#f0c000, #e0b000);
		padding-left: calc(0.5rem - 3px);
	}

	/* Shiki dual theme colors */
	.code-content :global(span[style]) {
		color: light-dark(var(--shiki-light), var(--shiki-dark));
	}

	/* Annotation marker in code */
	.code-content :global(.code-annotation) {
		display: inline-flex;
		align-items: center;
		margin-left: 0.5rem;
	}

	.code-content :global(.code-annotation-marker) {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.35rem;
		height: 1.35rem;
		border-radius: 50%;
		background-color: var(--ax-bg-accent-strong);
		color: var(--ax-text-accent-contrast);
		font-size: 0.7rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.15s ease;
		border: none;
		padding: 0;
	}

	.code-content :global(.code-annotation-marker:hover),
	.code-content :global(.code-annotation-marker:focus) {
		background-color: var(--ax-bg-accent-strong-hover);
		transform: scale(1.1);
	}

	/* Annotation list below code */
	.annotation-list {
		margin: 0.5rem 0 1rem 0;
		border: 1px solid var(--ax-border-neutral-subtle, rgba(175, 184, 193, 0.2));
		border-radius: 0.5rem;
		overflow: hidden;
	}

	.annotation-item {
		display: flex;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		border-top: 1px solid var(--ax-border-neutral-subtle, rgba(175, 184, 193, 0.2));
		transition: background-color 0.3s ease;
	}

	.annotation-item:first-of-type {
		border-top: none;
	}

	.annotation-item.highlighted {
		background-color: var(--ax-bg-accent-soft);
	}

	.annotation-number {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		width: 1.5rem;
		height: 1.5rem;
		border-radius: 50%;
		background-color: var(--ax-bg-accent-strong);
		color: var(--ax-text-accent-contrast);
		font-size: 0.75rem;
		font-weight: 600;
	}

	.annotation-content {
		flex: 1;
		font-size: 0.875rem;
		line-height: 1.6;
	}

	.annotation-content :global(p) {
		margin: 0 0 0.5rem 0;
	}

	.annotation-content :global(p:last-child) {
		margin-bottom: 0;
	}
</style>
