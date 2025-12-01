<script lang="ts">
	import type { Token } from "marked";
	import ContentRenderer from "./ContentRenderer.svelte";

	type FootnoteToken = {
		// type: "footnote";
		// raw: string;
		id: string;
		label: string;
		tokens: Token[];
	};

	let { token }: { token: FootnoteToken } = $props();
</script>

<li id="footnote-{token.id}">
	<ContentRenderer tokens={token.tokens} />
	<a
		href="#footnote-ref-{token.id}"
		data-footnote-backref
		aria-label="Back to reference {token.label}"
		class="footnote-backref"
	>
		↩
	</a>
</li>

<style>
	li {
		margin: 0.5rem 0;
	}

	.footnote-backref {
		margin-left: 0.25rem;
		text-decoration: none;
		font-size: 0.875em;
	}

	.footnote-backref:hover {
		text-decoration: underline;
	}
</style>
