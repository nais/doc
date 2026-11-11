<script lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	interface Props extends HTMLAttributes<HTMLElement> {
		as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
		level?: "1" | "2" | "3" | "4" | "5" | "6";
		size?: "xlarge" | "large" | "medium" | "small" | "xsmall";
		spacing?: boolean;
		children?: Snippet;
	}

	let {
		as,
		level = "1",
		size = "large",
		spacing = false,
		class: className,
		children,
		...rest
	}: Props = $props();
	const tag = $derived(as ?? `h${level}`);
</script>

<svelte:element
	this={tag}
	class={["sh-heading", `sh-heading--${size}`, { spacing }, className]}
	{...rest}
>
	{@render children?.()}
</svelte:element>

<style>
	.sh-heading {
		margin: 0;
		color: var(--foreground);
		font-weight: 600;
		line-height: 1.3;
		letter-spacing: -0.02em;
	}
	.sh-heading--xlarge {
		font-size: 2rem;
	}
	.sh-heading--large {
		font-size: 1.75rem;
	}
	.sh-heading--medium {
		font-size: 1.5rem;
	}
	.sh-heading--small {
		font-size: 1.25rem;
	}
	.sh-heading--xsmall {
		font-size: 1rem;
	}
	.spacing {
		margin-bottom: 0.5em;
	}
</style>
