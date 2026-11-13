<script lang="ts">
	import { Modal as PackageModal } from "@nais/ui";
	import type { Snippet } from "svelte";

	interface Props {
		open: boolean;
		title: string;
		header?: Snippet;
		children: Snippet;
		class?: string;
	}

	let {
		open = $bindable(false),
		title,
		header: renderHeader,
		children,
		class: className,
	}: Props = $props();
	const uid = $props.id();
</script>

<PackageModal
	bind:open
	class={["doc-modal", className].filter(Boolean).join(" ")}
	aria-labelledby={`${uid}-title`}
	aria-describedby={`${uid}-description`}
>
	{#snippet header()}
		<h2 id={`${uid}-title`} class="sr-only">{title}</h2>
		<p id={`${uid}-description`} class="sr-only">
			Search by title or content. Use the arrow keys to select a result.
		</p>
		{#if open}{@render renderHeader?.()}{/if}
	{/snippet}
	{#if open}{@render children()}{/if}
</PackageModal>

<style>
	:global(.sh-modal-layer:has(> .doc-modal)) {
		z-index: 100;
		padding: 0;
	}
	:global(.sh-modal.doc-modal) {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		z-index: 101;
		display: flex;
		flex-direction: column;
		width: min(800px, calc(100vw - 2rem));
		max-width: 800px;
		max-height: calc(100dvh - 2rem);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: var(--popover);
		color: var(--foreground);
		box-shadow: var(--shadow-lg);
		overflow-y: visible;
	}
	:global(.sh-modal.doc-modal .sh-modal__header) {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 1rem;
		border-bottom: 1px solid var(--border);
	}
	:global(.sh-modal.doc-modal .sh-modal__header-content) {
		flex: 1;
		min-width: 0;
	}
	:global(.sh-modal.doc-modal .sh-modal__close) {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		width: auto;
		height: auto;
		padding: 0.375rem;
		border: none;
		border-radius: var(--radius);
		background: transparent;
		color: var(--muted-foreground);
		font: inherit;
		cursor: pointer;
	}
	:global(.sh-modal.doc-modal .sh-modal__close:hover) {
		background: var(--secondary);
		color: var(--foreground);
	}
	:global(.sh-modal.doc-modal .sh-modal__body) {
		padding: 0;
		min-height: 0;
		overflow-y: auto;
	}
</style>
