<script lang="ts">
	import type { Token } from "marked";
	import Renderer from "./Renderer.svelte";

	type HtmlWithMarkdownToken = {
		type: "html_with_markdown";
		raw: string;
		text: string;
		openTag: string;
		closeTag: string;
		innerTokens: Token[];
	};

	let { token }: { token: HtmlWithMarkdownToken } = $props();

	// Extract tag name from openTag (e.g., '<div class="grid cards">' -> 'div')
	const tagMatch = token.openTag.match(/^<(\w+)/);
	const tagName = tagMatch ? tagMatch[1] : "div";

	// Extract class from openTag (e.g., '<div class="grid cards">' -> 'grid cards')
	const classMatch = token.openTag.match(/class="([^"]*)"/);
	const className = classMatch ? classMatch[1] : undefined;

	// Extract id from openTag
	const idMatch = token.openTag.match(/id="([^"]*)"/);
	const id = idMatch ? idMatch[1] : undefined;
</script>

<svelte:element this={tagName} class={className} {id}>
	<Renderer tokens={token.innerTokens} />
</svelte:element>
