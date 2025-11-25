<script lang="ts">
	type FootnoteRefToken = {
		// type: "footnoteRef";
		// raw: string;
		// index: number;
		id: string;
		label: string;
	};

	let { token }: { token: FootnoteRefToken } = $props();
</script>

<sup class="footnote-ref"
	><a
		id="footnote-ref-{token.id}"
		href="#footnote-{token.id}"
		data-footnote-ref
		aria-describedby="footnote-label">{token.label}</a
	></sup
>

<style>
	.footnote-ref {
		font-size: 0.75em;
		line-height: 1;
		vertical-align: super;
	}

	.footnote-ref a {
		text-decoration: none;
		color: var(--ax-text-action, #0067c5);
	}

	.footnote-ref a:hover {
		text-decoration: underline;
	}
</style>
