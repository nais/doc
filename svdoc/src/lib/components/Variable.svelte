<script lang="ts">
	import { getContext, type PageContext } from "$lib/state/page_context.svelte";
	import { PencilIcon } from "@nais/ds-svelte-community/icons";

	let {
		name,
		readonly,
		ctx: ctxProp,
	}: { name: string; readonly: boolean; ctx?: PageContext } = $props();

	// Use provided context prop (for mount() scenarios) or get from Svelte context
	const ctx = ctxProp ?? getContext();

	const id = $props.id();

	let edit = $state(false);
	let value = $derived.by(() => {
		return ctx.variables.get(name) || `<${name}>`;
	});

	let button: HTMLButtonElement | null = $state(null);
	let input: HTMLInputElement | null = $state(null);

	let inputWidth = $derived.by(() => {
		// Create a temporary span to measure the text width
		if (typeof document !== "undefined" && input) {
			const span = document.createElement("span");
			span.style.visibility = "hidden";
			span.style.position = "absolute";
			span.style.whiteSpace = "pre";
			span.style.font = getComputedStyle(input).font;
			span.textContent = value || " ";
			document.body.appendChild(span);
			const textWidth = span.offsetWidth; // Add a bit of padding
			document.body.removeChild(span);
			return textWidth;
		}
		return 0;
	});

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === "Enter" || event.key === "Escape") {
			event.preventDefault();
			if (!readonly) {
				ctx.variables.set(name, value);
			}
			edit = false;
		}
	}
</script>

<input
	bind:this={input}
	bind:value
	type="text"
	onblur={() => {
		if (!readonly) {
			ctx.variables.set(name, value);
		}
		edit = false;
	}}
	onkeydown={handleKeydown}
	{id}
	class:hidden={!edit}
	style="width: {inputWidth}px"
/><button
	bind:this={button}
	onclick={() => {
		edit = !edit;
		if (edit) {
			// Focus the input when entering edit mode
			setTimeout(() => {
				input?.focus();
				input?.setSelectionRange(0, value.length);
			}, 0);
		}
	}}
	class:hidden={edit}>{value}<PencilIcon style="margin-left: 0.3rem;" /></button
>

<style>
	button,
	input {
		all: unset;
	}

	input:focus {
		outline: 2px solid var(--ax-border-default);
		margin-right: 1.3rem;
	}

	button {
		display: inline-flex;
		align-items: center;
		color: var(--ax-text-brand-magenta);
		border-bottom: 1px dotted var(--ax-border-brand-magenta);
	}

	button:hover {
		cursor: pointer;
		background-color: var(--ax-bg-neutral-soft, rgba(175, 184, 193, 0.2));
		border-radius: 0.25rem;
	}

	.hidden {
		display: none;
	}
</style>
