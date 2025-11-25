<script lang="ts">
	import type { Tokens } from "marked";

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	let { token }: { token: Tokens.Hr } = $props();
</script>

<hr />

<style>
	hr {
		margin: 2rem 0;
		border: none;
		border-top: 1px solid var(--ax-border-neutral-subtle, rgba(175, 184, 193, 0.3));
	}
</style>
