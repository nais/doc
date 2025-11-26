<script module lang="ts">
	export function textAndVariables(text: string) {
		// Look for variables somewhere in the text
		const variablePattern = /<([A-Z_-]+)(:readonly)?>/g;

		const variableMatch = text.matchAll(variablePattern);

		const matches = variableMatch.map((match) => {
			const [fullMatch, variableName, readOnlyTag] = match;

			return {
				// The index of the first character of the full match (<)
				startPosition: match.index,
				// The index of the character *after* the full match (>)
				endPosition: match.index + fullMatch.length,
				// Group 1: The variable name
				variableName: variableName,
				// Check if Group 2 (readOnlyTag) was captured (it's defined if present)
				isReadOnly: !!readOnlyTag,
			};
		});

		// Create an array of segments to render
		const segments: (
			| { type: "variable"; variableName: string; isReadOnly: boolean }
			| { type: "text"; content: string }
		)[] = [];
		let lastIndex = 0;
		for (const match of matches) {
			// Add text before the variable
			if (match.startPosition! > lastIndex) {
				segments.push({
					type: "text",
					content: text.slice(lastIndex, match.startPosition),
				});
			}

			// Add the variable segment
			segments.push({
				type: "variable",
				variableName: match.variableName,
				isReadOnly: match.isReadOnly,
			});

			// Update lastIndex to the end of the current match
			lastIndex = match.endPosition!;
		}
		// Add any remaining text after the last variable
		if (lastIndex < text.length) {
			segments.push({
				type: "text",
				content: text.slice(lastIndex),
			});
		}
		return segments;
	}
</script>

<script lang="ts">
	import Variable from "$lib/components/Variable.svelte";
	import type { Tokens } from "marked";

	let { token }: { token: Tokens.Codespan } = $props();

	const variables = $derived(textAndVariables(token.text));

	const hasVariables = $derived(variables.some((segment) => segment.type === "variable"));
</script>

{#if !hasVariables}
	<code>{token.text}</code>
{:else}
	<code>
		{#each variables as segment, i (i)}
			{#if segment.type === "text"}
				{segment.content}
			{:else if segment.type === "variable"}
				<Variable name={segment.variableName} readonly={segment.isReadOnly} />
			{/if}
		{/each}
	</code>
{/if}

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
