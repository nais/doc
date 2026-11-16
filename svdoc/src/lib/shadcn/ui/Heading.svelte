<script lang="ts">
	import { Heading as SharedHeading } from "@nais/ui";
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
</script>

<SharedHeading
	{as}
	{level}
	{size}
	{spacing}
	{children}
	class={["doc-heading", { spacing }, className]}
	{...rest}
/>

<style>
	:global(.sh-heading.doc-heading:is(h1, h2, h3, h4, h5, h6)) {
		font-weight: 600;
		line-height: 1.3;
	}
	:global(.doc-heading.sh-heading.sh-heading--xlarge) {
		font-size: 2rem;
	}
	:global(.doc-heading.sh-heading.sh-heading--large) {
		font-size: 1.75rem;
	}
	:global(.doc-heading.sh-heading.sh-heading--medium) {
		font-size: 1.5rem;
	}
	:global(.doc-heading.sh-heading.sh-heading--small) {
		font-size: 1.25rem;
	}
	:global(.doc-heading.sh-heading.sh-heading--xsmall) {
		font-size: 1rem;
	}
</style>
