<script lang="ts">
	import { BodyLong } from "#lib/shadcn/ui/index.ts";
	import type { Tokens } from "marked";
	import Renderer from "./Renderer.svelte";

	let { token }: { token: Tokens.Paragraph } = $props();
</script>

<BodyLong spacing>
	{#if (token.tokens?.length || 0) > 0}
		<Renderer tokens={token.tokens!} />
	{:else}
		{token.text}
	{/if}
</BodyLong>
