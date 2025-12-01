<script lang="ts">
	import type { Token, TokensList } from "marked";
	import Renderer from "./Renderer.svelte";

	interface Props {
		tokens: TokensList | Token[];
	}

	let { tokens }: Props = $props();
</script>

<div class="content-flow">
	<Renderer {tokens} />
</div>
