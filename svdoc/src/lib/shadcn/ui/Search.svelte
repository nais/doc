<script lang="ts">
	import { LoaderCircle, Search, X } from "@lucide/svelte";
	import type { HTMLInputAttributes } from "svelte/elements";

	interface Props extends Omit<HTMLInputAttributes, "value" | "type" | "size"> {
		label: string;
		value?: string;
		loading?: boolean;
	}

	const uid = $props.id();
	let {
		label,
		value = $bindable(""),
		loading = false,
		id = uid,
		class: className,
		...rest
	}: Props = $props();
</script>

<div class={["sh-search", className]}>
	<label for={id} class="sr-only">{label}</label>
	<span class="search-icon" aria-hidden="true">
		{#if loading}<LoaderCircle class="loading" />{:else}<Search />{/if}
	</span>
	<input {...rest} {id} type="search" bind:value aria-busy={loading} />
	{#if value}
		<button type="button" aria-label="Clear field" onclick={() => (value = "")}
			><X aria-hidden="true" /></button
		>
	{/if}
</div>

<style>
	.sh-search {
		position: relative;
		display: flex;
		align-items: center;
		width: 100%;
	}
	.search-icon {
		position: absolute;
		left: 0.625rem;
		display: inline-flex;
		color: var(--muted-foreground);
		pointer-events: none;
	}
	input {
		width: 100%;
		height: 2.5rem;
		padding: 0 2.25rem;
		border: 1px solid var(--input);
		border-radius: var(--radius);
		background: var(--card);
		color: var(--foreground);
		font: inherit;
	}
	button {
		position: absolute;
		right: 0.375rem;
		display: inline-flex;
		padding: 0.25rem;
		border: none;
		border-radius: var(--radius);
		background: transparent;
		color: var(--muted-foreground);
		font: inherit;
		cursor: pointer;
	}
	button:hover {
		background: var(--secondary);
	}
	.loading {
		animation: spin 1s linear infinite;
	}
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.loading {
			animation: none;
		}
	}
</style>
