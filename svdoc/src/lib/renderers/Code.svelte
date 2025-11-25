<script lang="ts">
	import { CopyButton } from "@nais/ds-svelte-community";
	import type { Tokens } from "marked";

	let { token }: { token: Tokens.Code } = $props();
</script>

<div class="code-block">
	<div class="code-header">
		{#if token.lang}
			<span class="language">{token.lang}</span>
		{/if}
		<CopyButton size="small" variant="neutral" copyText={token.text} />
	</div>
	<pre><code class="language-{token.lang || 'text'}">{token.text}</code></pre>
</div>

<style>
	.code-block {
		margin: 1rem 0;
		border-radius: 0.5rem;
		overflow: hidden;
		background-color: var(--ax-bg-neutral-soft, rgba(175, 184, 193, 0.1));
		border: 1px solid var(--ax-border-neutral-subtle, rgba(175, 184, 193, 0.2));
	}

	.code-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 1rem;
		background-color: var(--ax-bg-neutral-moderate, rgba(175, 184, 193, 0.15));
		border-bottom: 1px solid var(--ax-border-neutral-subtle, rgba(175, 184, 193, 0.2));
	}

	.language {
		font-size: 0.75rem;
		font-weight: 500;
		text-transform: uppercase;
		color: var(--ax-text-neutral, inherit);
		opacity: 0.7;
	}

	pre {
		margin: 0;
		padding: 1rem;
		overflow-x: auto;
	}

	code {
		font-family: "Monaco", "Menlo", "Ubuntu Mono", "Consolas", "source-code-pro", monospace;
		font-size: 0.875rem;
		line-height: 1.5;
	}
</style>
