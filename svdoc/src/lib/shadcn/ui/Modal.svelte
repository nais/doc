<script lang="ts">
	import { X } from "@lucide/svelte";
	import { Dialog } from "bits-ui";
	import type { Snippet } from "svelte";

	interface Props {
		open: boolean;
		title: string;
		header?: Snippet;
		children: Snippet;
		class?: string;
	}

	let { open = $bindable(false), title, header, children, class: className }: Props = $props();
	let anchor = $state<HTMLSpanElement>();
	const portalTarget = $derived(anchor?.closest(".sh-theme-root") ?? undefined);
	let returnFocus: HTMLElement | null = null;
</script>

<span hidden bind:this={anchor}></span>
<Dialog.Root bind:open>
	{#if anchor}
		<Dialog.Portal to={portalTarget}>
			<Dialog.Overlay class="sh-modal-backdrop" />
			<Dialog.Content
				class={["sh-modal", className]}
				onOpenAutoFocus={() => {
					returnFocus =
						document.activeElement instanceof HTMLElement ? document.activeElement : null;
				}}
				onCloseAutoFocus={(event) => {
					if (returnFocus?.isConnected) {
						event.preventDefault();
						returnFocus.focus();
					}
				}}
			>
				<Dialog.Title class="sr-only">{title}</Dialog.Title>
				<Dialog.Description class="sr-only"
					>Search by title or content. Use the arrow keys to select a result.</Dialog.Description
				>
				<div class="sh-modal-header">
					<div class="sh-modal-header-content">{@render header?.()}</div>
					<Dialog.Close class="sh-modal-close" aria-label="Close">
						<X aria-hidden="true" />
					</Dialog.Close>
				</div>
				<div class="sh-modal-body">{@render children()}</div>
			</Dialog.Content>
		</Dialog.Portal>
	{/if}
</Dialog.Root>

<style>
	:global(.sh-modal-backdrop) {
		position: fixed;
		inset: 0;
		z-index: 100;
		background: rgb(2 6 23 / 55%);
		backdrop-filter: blur(2px);
	}
	:global(.sh-modal) {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		z-index: 101;
		display: flex;
		flex-direction: column;
		width: min(800px, calc(100vw - 2rem));
		max-height: calc(100dvh - 2rem);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background: var(--popover);
		color: var(--foreground);
		box-shadow: var(--shadow-lg);
	}
	.sh-modal-header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 1rem;
		border-bottom: 1px solid var(--border);
	}
	.sh-modal-header-content {
		flex: 1;
		min-width: 0;
	}
	:global(.sh-modal-close) {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		padding: 0.375rem;
		border: none;
		border-radius: var(--radius);
		background: transparent;
		color: var(--muted-foreground);
		font: inherit;
		cursor: pointer;
	}
	:global(.sh-modal-close:hover) {
		background: var(--secondary);
		color: var(--foreground);
	}
	.sh-modal-body {
		min-height: 0;
		overflow-y: auto;
	}
</style>
