<script lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from "svelte/elements";

	type Props = {
		variant?: "primary" | "secondary";
		children: Snippet;
		icon?: Snippet;
	} & (({ as: "a" } & HTMLAnchorAttributes) | ({ as?: "button" } & HTMLButtonAttributes));

	let { variant = "primary", icon, children, ...rest }: Props = $props();
</script>

{#snippet content()}
	{@render icon?.()}
	{@render children()}
{/snippet}

{#if rest.as === "a"}
	{@const { as, class: className, ...attributes } = rest}
	<svelte:element this={as} {...attributes} class={["sh-button", `variant-${variant}`, className]}
		>{@render content()}</svelte:element
	>
{:else}
	{@const { as = "button", class: className, type = "button", ...attributes } = rest}
	<svelte:element
		this={as}
		{...attributes}
		{type}
		class={["sh-button", `variant-${variant}`, className]}>{@render content()}</svelte:element
	>
{/if}

<style>
	.sh-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		font: inherit;
		font-weight: 500;
		text-decoration: none;
		cursor: pointer;
	}
	.variant-primary {
		background: var(--primary);
		color: var(--primary-foreground);
	}
	.variant-primary:hover {
		background: var(--primary-hover);
	}
	.variant-secondary {
		background: var(--card);
		color: var(--foreground);
	}
	.variant-secondary:hover {
		background: var(--secondary);
	}
	.sh-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
