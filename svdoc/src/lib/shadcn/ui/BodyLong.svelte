<script lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	interface Props extends HTMLAttributes<HTMLParagraphElement> {
		size?: "large" | "medium" | "small";
		spacing?: boolean;
		children?: Snippet;
	}

	let { size = "medium", spacing = false, class: className, children, ...rest }: Props = $props();
</script>

<p class={["sh-body-long", `size-${size}`, { spacing }, className]} {...rest}>
	{@render children?.()}
</p>

<style>
	.sh-body-long {
		margin: 0;
		line-height: 1.6;
	}
	.size-large {
		font-size: 1.125rem;
	}
	.size-medium {
		font-size: 1rem;
	}
	.size-small {
		font-size: 0.875rem;
	}
	.spacing {
		margin-bottom: 1rem;
	}
</style>
