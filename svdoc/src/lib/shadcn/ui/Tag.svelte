<script lang="ts">
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		children: Snippet;
	}

	let { children, class: className, ...rest }: Props = $props();
</script>

<span class={["sh-tag", className]} {...rest}>{@render children()}</span>

<style>
	.sh-tag {
		display: inline-flex;
		align-items: center;
		padding: 0.125rem 0.5rem;
		border: 1px solid var(--info-border);
		border-radius: var(--radius);
		background: var(--info-muted);
		color: var(--info);
		font-size: 0.8125rem;
		font-weight: 500;
		line-height: 1.5;
	}
</style>
