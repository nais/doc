<script lang="ts">
	import type { Token, Tokens } from "marked";
	import MermaidDiagram from "./MermaidDiagram.svelte";
	import ShikiCode from "./ShikiCode.svelte";

	// Extended code token type with optional annotations
	type CodeToken = Tokens.Code & { annotations?: Token[][] };

	let { token }: { token: CodeToken } = $props();

	const isMermaid = $derived(token.lang === "mermaid");
</script>

{#if isMermaid}
	<MermaidDiagram text={token.text} />
{:else}
	<ShikiCode text={token.text} lang={token.lang || "text"} annotations={token.annotations} />
{/if}
