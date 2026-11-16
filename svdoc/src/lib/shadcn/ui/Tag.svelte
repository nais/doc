<script lang="ts">
	import { Tag as SharedTag } from "@nais/ui";
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		children: Snippet;
	}

	let { children, class: className, ...rest }: Props = $props();
</script>

<SharedTag variant="info" class={["sh-tag", "doc-tag", className]} {children} {...rest} />

<style>
	:global(.sh-ui-tag.sh-tag.doc-tag) {
		border-radius: var(--radius);
		font-size: 0.8125rem;
		line-height: 1.5;
		white-space: normal;
		font-variant-numeric: normal;
		gap: normal;
	}
</style>
