<script lang="ts">
	import type { Token } from "marked";
	import Footnote from "./Footnote.svelte";

	type FootnoteItem = {
		// type: "footnote";
		// raw: string;
		id: string;
		label: string;
		tokens: Token[];
	};

	type FootnotesToken = {
		// type: "footnotes";
		// raw: string;
		items: FootnoteItem[];
	};

	let { token }: { token: FootnotesToken } = $props();
</script>

<section class="footnotes" data-footnotes>
	<hr />
	<ol>
		{#each token.items as item (item.id)}
			<Footnote token={item} />
		{/each}
	</ol>
</section>

<style>
	.footnotes {
		margin-top: 2rem;
		font-size: 0.875rem;
	}

	hr {
		border: none;
		border-top: 1px solid var(--ax-border-neutral-subtle, rgba(175, 184, 193, 0.3));
		margin-bottom: 1rem;
	}

	ol {
		padding-left: 1.5rem;
		margin: 0;
		list-style-type: decimal;
	}
</style>
