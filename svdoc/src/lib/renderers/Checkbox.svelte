<script lang="ts">
	import { CheckmarkCircleFillIcon, CircleIcon } from "@nais/ds-svelte-community/icons";

	interface CheckboxToken {
		type: "checkbox";
		raw: string;
		checked: boolean;
	}

	let { token }: { token: CheckboxToken } = $props();
</script>

<span class="checkbox" class:checkbox--checked={token.checked}>
	{#if token.checked}
		<CheckmarkCircleFillIcon aria-hidden="true" />
	{:else}
		<CircleIcon aria-hidden="true" />
	{/if}
</span>

<style>
	.checkbox {
		display: inline-flex;
		align-items: center;
		vertical-align: middle;
		margin-right: 0.375rem;
		color: var(--ax-text-subtle, #8b949e);
	}

	.checkbox--checked {
		color: var(--ax-text-success, #207c41);
	}

	.checkbox :global(svg) {
		display: block;
		width: 1.125rem;
		height: 1.125rem;
	}
</style>
