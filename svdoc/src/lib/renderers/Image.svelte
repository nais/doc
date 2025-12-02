<script lang="ts">
	import type { Tokens } from "marked";

	let { token }: { token: Tokens.Image } = $props();
</script>

<img src={token.href} alt={token.text} title={token.title} />

<style>
	img {
		max-width: 100%;
		height: auto;
	}
</style>
