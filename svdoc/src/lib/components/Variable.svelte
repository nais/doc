<script lang="ts">
	import { getContext } from "$lib/state/page_context.svelte";
	import { PencilBoardIcon } from "@nais/ds-svelte-community/icons";

	let { name, readonly }: { name: string; readonly: boolean } = $props();

	const ctx = getContext();

	const id = $props.id();

	let edit = $state(false);
	let value = $derived.by(() => {
		return ctx.variables.get(name) ?? `<${name}>`;
	});

	let button: HTMLButtonElement | null = $state(null);
	let input: HTMLInputElement | null = $state(null);

	let width = $state(0);
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
	{id}
	class:hidden={!edit}
	style="width: {width}px"
/><button
	bind:this={button}
	onclick={() => {
		edit = !edit;
		width = button?.offsetWidth || 0;
		if (edit) {
			// Focus the input when entering edit mode
			setTimeout(() => {
				input?.focus();
				input?.setSelectionRange(0, value.length);
			}, 0);
		}
	}}
	class:hidden={edit}
	>{value}<PencilBoardIcon style="margin-left: 0.3rem; color: var(--ax-text-neutral);" /></button
>

<style>
	button,
	input {
		all: unset;
	}

	input:focus {
		outline: 2px solid var(--ax-border-default);
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
