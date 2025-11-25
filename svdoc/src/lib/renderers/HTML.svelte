<script lang="ts">
	import type { Tokens } from "marked";

	let { token }: { token: Tokens.HTML } = $props();

	// Strip invalid HTML attributes that cause hydration mismatches
	// The 'markdown' attribute is used by Material for MkDocs but not valid HTML
	const cleanedHtml = token.text.replace(/\s+markdown(?:="[^"]*")?/gi, "");
</script>

<!-- eslint-disable-next-line svelte/no-at-html-tags -->
{@html cleanedHtml}
