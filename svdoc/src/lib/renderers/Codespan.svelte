<script lang="ts">
	import type { Tokens } from "marked";

	let { token }: { token: Tokens.Codespan } = $props();
</script>

<code>{token.text}</code>

<style>
	code {
		padding: 0.125rem 0.375rem;
		background-color: var(--ax-bg-neutral-soft, rgba(175, 184, 193, 0.2));
		border-radius: 0.25rem;
		font-family: "Monaco", "Menlo", "Ubuntu Mono", "Consolas", "source-code-pro", monospace;
		font-size: 0.875em;
		color: var(--ax-text-default, inherit);
	}
</style>
