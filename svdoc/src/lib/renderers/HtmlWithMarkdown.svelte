<script lang="ts">
	import type { Token } from "marked";
	import Renderer from "./Renderer.svelte";

	type HtmlWithMarkdownToken = {
		// type: "html_with_markdown";
		// raw: string;
		// text: string;
		openTag: string;
		// closeTag: string;
		innerTokens: Token[];
	};

	let { token }: { token: HtmlWithMarkdownToken } = $props();

	// Extract tag name from openTag (e.g., '<div class="grid cards">' -> 'div')
	const tagName = $derived.by(() => {
		const tagMatch = token.openTag.match(/^<(\w+)/);
		return tagMatch ? tagMatch[1] : "div";
	});

	// Extract class from openTag (e.g., '<div class="grid cards">' -> 'grid cards')
	const className = $derived.by(() => {
		const classMatch = token.openTag.match(/class="([^"]*)"/);
		return classMatch ? classMatch[1] : undefined;
	});

	// Extract id from openTag
	const id = $derived.by(() => {
		const idMatch = token.openTag.match(/id="([^"]*)"/);
		return idMatch ? idMatch[1] : undefined;
	});
</script>

<svelte:element this={tagName} class={className} {id}>
	<Renderer tokens={token.innerTokens} />
</svelte:element>
