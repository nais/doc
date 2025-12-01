<script lang="ts">
	import type { Token } from "marked";
	import ContentRenderer from "./ContentRenderer.svelte";
	import Renderer from "./Renderer.svelte";

	interface DefinitionToken {
		tokens: Token[];
	}

	interface DefinitionListItemToken {
		termTokens: Token[];
		definitions: DefinitionToken[];
	}

	interface Props {
		token: {
			items: DefinitionListItemToken[];
		};
	}

	let { token }: Props = $props();
</script>

<dl class="definition-list">
	{#each token.items as item, i (i)}
		<dt class="definition-term">
			<Renderer tokens={item.termTokens} />
		</dt>
		{#each item.definitions as definition, j (j)}
			<dd class="definition-description">
				<ContentRenderer tokens={definition.tokens} />
			</dd>
		{/each}
	{/each}
</dl>

<style>
	.definition-list {
		margin: 1rem 0;
	}

	.definition-term {
		font-weight: 600;
		margin-top: 1rem;
	}

	.definition-term:first-child {
		margin-top: 0;
	}

	/* Style inline code in terms */
	.definition-term :global(code) {
		font-size: 0.95em;
		padding: 0.15rem 0.4rem;
		background-color: var(--ax-bg-neutral-soft, rgba(175, 184, 193, 0.15));
		border-radius: 0.25rem;
		font-weight: 500;
	}

	.definition-description {
		margin-left: 1.5rem;
		margin-top: 0.25rem;
		color: var(--ax-text-neutral, inherit);
	}

	/* Remove margin from first paragraph in definition */
	.definition-description :global(p:first-child) {
		margin-top: 0;
	}

	/* Style for Required/Optional badges */
	.definition-description :global(strong) {
		color: var(--ax-text-neutral, inherit);
	}
</style>
