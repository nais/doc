<script lang="ts">
	import type { Tokens } from "marked";

	let { token }: { token: Tokens.HTML } = $props();
</script>

<!-- eslint-disable-next-line svelte/no-at-html-tags -->
{@html token.text}
