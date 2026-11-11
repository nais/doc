<script lang="ts">
	import { Check, Copy } from "@lucide/svelte";
	import { onDestroy } from "svelte";
	import type { HTMLButtonAttributes } from "svelte/elements";

	interface Props extends HTMLButtonAttributes {
		copyText: string;
	}

	let { copyText, class: className, ...rest }: Props = $props();
	let active = $state(false);
	let copying = $state(false);
	let error = $state("");
	let timer: ReturnType<typeof setTimeout> | undefined;
	let mounted = true;

	onDestroy(() => {
		mounted = false;
		if (timer) clearTimeout(timer);
	});

	async function copy(event: MouseEvent) {
		event.stopPropagation();
		if (copying) return;
		if (timer) clearTimeout(timer);
		active = false;
		error = "";
		if (!navigator.clipboard?.writeText) {
			error = "Clipboard access is unavailable. Copy the text manually.";
			return;
		}
		copying = true;
		try {
			await navigator.clipboard.writeText(copyText);
			if (mounted) {
				active = true;
				timer = setTimeout(() => (active = false), 2000);
			}
		} catch (cause) {
			console.error("Failed to copy text:", cause);
			if (mounted) error = "Could not copy the text. Try again.";
		} finally {
			if (mounted) copying = false;
		}
	}
</script>

<button
	{...rest}
	type="button"
	class={["sh-copy-button", { active }, className]}
	aria-label={active ? "Copied to clipboard" : "Copy to clipboard"}
	title={active ? "Copied to clipboard" : "Copy to clipboard"}
	onclick={copy}
>
	{#if active}<Check aria-hidden="true" />{:else}<Copy aria-hidden="true" />{/if}
</button>
<span class="sr-only" role="status">{active ? "Copied to clipboard" : ""}</span>
{#if error}<span role="alert" class="copy-error">{error}</span>{/if}

<style>
	.sh-copy-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.375rem;
		border: 1px solid transparent;
		border-radius: var(--radius);
		background: transparent;
		color: var(--muted-foreground);
		font: inherit;
		cursor: pointer;
	}
	.sh-copy-button:hover {
		background: var(--secondary);
		color: var(--foreground);
	}
	.active {
		color: var(--success);
	}
	.copy-error {
		color: var(--destructive);
		font-size: 0.875rem;
	}
</style>
