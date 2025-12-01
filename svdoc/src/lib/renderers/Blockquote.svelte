<script lang="ts">
	import { Alert } from "@nais/ds-svelte-community";
	import type { Tokens } from "marked";
	import ContentRenderer from "./ContentRenderer.svelte";

	let { token }: { token: Tokens.Blockquote } = $props();
</script>

<Alert variant="info" size="small">
	{#if (token.tokens?.length || 0) > 0}
		<ContentRenderer tokens={token.tokens!} />
	{:else}
		{token.text}
	{/if}
</Alert>
