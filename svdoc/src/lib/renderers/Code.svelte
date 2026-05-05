<script lang="ts">
	import type { Token, Tokens } from "marked";
	import MermaidDiagram from "./MermaidDiagram.svelte";
	import ShikiCode from "./ShikiCode.svelte";

	// Extended code token type with optional annotations and pre-highlighted data
	type CodeToken = Tokens.Code & {
		annotations?: Token[][];
		highlighted?: {
			html: string;
			language: string;
			title: string | null;
			annotations: { id: string; line: number; stripComment: boolean }[];
			variables: { index: number; name: string; isReadOnly: boolean; placeholder: string }[];
		};
	};

	let { token }: { token: CodeToken } = $props();

	const isMermaid = $derived(token.lang === "mermaid");
</script>

{#if isMermaid}
	<MermaidDiagram text={token.text} />
{:else}
	<ShikiCode
		text={token.text}
		lang={token.lang || "text"}
		annotations={token.annotations}
		preHighlighted={token.highlighted}
	/>
{/if}
