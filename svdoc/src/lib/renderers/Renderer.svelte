<script lang="ts">
	import { type Token, type TokensList } from "marked";
	import type { Component } from "svelte";
	import Blockquote from "./Blockquote.svelte";
	import Br from "./Br.svelte";
	import Code from "./Code.svelte";
	import Codespan from "./Codespan.svelte";
	import Del from "./Del.svelte";
	import Em from "./Em.svelte";
	import Escape from "./Escape.svelte";
	import Footnote from "./Footnote.svelte";
	import FootnoteRef from "./FootnoteRef.svelte";
	import Footnotes from "./Footnotes.svelte";
	import Heading from "./Heading.svelte";
	import HR from "./HR.svelte";
	import HTML from "./HTML.svelte";
	import HtmlWithMarkdown from "./HtmlWithMarkdown.svelte";
	import Image from "./Image.svelte";
	import Link from "./Link.svelte";
	import List from "./List.svelte";
	import ListItem from "./ListItem.svelte";

	import Paragraph from "./Paragraph.svelte";
	import Space from "./Space.svelte";
	import Strong from "./Strong.svelte";
	import Table from "./Table.svelte";
	import Text from "./Text.svelte";

	let {
		tokens,
	}: {
		tokens: TokensList | Token[];
	} = $props();

	const components: {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		[key: Token["type"]]: Component<any>;
	} = {
		blockquote: Blockquote as never,
		br: Br as never,
		code: Code as never,
		codespan: Codespan as never,
		del: Del as never,
		em: Em as never,
		escape: Escape as never,
		footnote: Footnote as never,
		footnoteRef: FootnoteRef as never,
		footnotes: Footnotes as never,
		heading: Heading as never,
		hr: HR,
		html: HTML as never,
		html_with_markdown: HtmlWithMarkdown as never,
		image: Image as never,
		link: Link as never,
		list: List as never,
		list_item: ListItem as never,

		paragraph: Paragraph as never,
		space: Space as never,
		strong: Strong as never,
		table: Table as never,
		text: Text as never,
	};

	// $inspect(tokens);
</script>

{#each tokens as token, i (i)}
	{#if components[token.type]}
		{@const Component = components[token.type]}
		<Component {token} />
	{:else}
		<div class="error">Unknown token type: {token.type}</div>
	{/if}
{/each}

<style>
	.error {
		color: red;
		font-weight: bold;
	}
</style>
