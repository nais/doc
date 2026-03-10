<script lang="ts">
	import { type Token, type TokensList } from "marked";
	import type { Component } from "svelte";
	import Admonition from "./Admonition.svelte";
	import Blockquote from "./Blockquote.svelte";
	import Br from "./Br.svelte";
	import Checkbox from "./Checkbox.svelte";
	import Code from "./Code.svelte";
	import Codespan from "./Codespan.svelte";
	import ContentTabs from "./ContentTabs.svelte";
	import Def from "./Def.svelte";
	import DefinitionList from "./DefinitionList.svelte";
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

	interface Props {
		tokens: TokensList | Token[];
	}

	let { tokens }: Props = $props();

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const components: Record<string, Component<any>> = {
		admonition: Admonition,
		blockquote: Blockquote,
		br: Br,
		checkbox: Checkbox,
		code: Code,
		codespan: Codespan,
		content_tabs: ContentTabs,
		def: Def,
		def_list: DefinitionList,
		del: Del,
		em: Em,
		escape: Escape,
		footnote: Footnote,
		footnoteRef: FootnoteRef,
		footnotes: Footnotes,
		heading: Heading,
		hr: HR,
		html: HTML,
		html_with_markdown: HtmlWithMarkdown,
		image: Image,
		link: Link,
		list: List,
		list_item: ListItem,
		paragraph: Paragraph,
		space: Space,
		strong: Strong,
		table: Table,
		text: Text,
	};
</script>

{#each tokens as token, i (i)}
	{#if components[token.type]}
		{@const Component = components[token.type]}
		<Component {token} />
	{:else}
		<div class="unknown-token">Unknown token type: {token.type}</div>
	{/if}
{/each}

<style>
	.unknown-token {
		color: var(--ax-text-danger, #ec526e);
		font-weight: bold;
		padding: 0.5rem;
		background: var(--ax-bg-danger-soft, rgba(236, 82, 110, 0.1));
		border-radius: 4px;
		margin: 0.5rem 0;
	}
</style>
