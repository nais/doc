<script lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLButtonAttributes } from "svelte/elements";

	interface Props extends HTMLButtonAttributes {
		children: Snippet;
	}

	let { children, class: className, ...rest }: Props = $props();
</script>

<button {...rest} type="button" class={["sh-internal-header-button", className]}>
	{@render children()}
</button>

<style>
	.sh-internal-header-button {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.5rem 0.625rem;
		border: 1px solid transparent;
		border-radius: var(--radius);
		background: transparent;
		color: var(--foreground);
		font: inherit;
		cursor: pointer;
	}
	.sh-internal-header-button:hover {
		background: var(--secondary);
	}
</style>
