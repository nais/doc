<script lang="ts">
	import { browser } from "$app/env";
	import { CircleAlert, CircleCheck, Info, TriangleAlert } from "@lucide/svelte";
	import type { Token } from "marked";
	import ContentRenderer from "./ContentRenderer.svelte";

	interface AdmonitionToken {
		// type: "admonition";
		// raw: string;
		admonitionType: string;
		title: string;
		collapsible: boolean;
		open: boolean;
		tokens: Token[];
	}

	let { token }: { token: AdmonitionToken } = $props();

	// Map admonition types to Alert variants
	function getAlertStatus(type: string): "error" | "warning" | "success" | "info" {
		switch (type) {
			case "danger":
			case "error":
			case "bug":
			case "fail":
			case "failure":
			case "missing":
				return "error";
			case "warning":
			case "caution":
			case "attention":
			case "gcp-only":
				return "warning";
			case "success":
			case "check":
			case "done":
				return "success";
			case "info":
			case "note":
			case "tip":
			case "hint":
			case "important":
			case "example":
			case "quote":
			case "cite":
			case "abstract":
			case "summary":
			case "tldr":
			case "question":
			case "help":
			case "faq":
			default:
				return "info";
		}
	}

	const status = $derived(getAlertStatus(token.admonitionType));
</script>

{#if token.collapsible}
	<details class="admonition tone-{status}" open={!browser || token.open}>
		<summary>{token.title}</summary>
		<div class="admonition-content">
			<ContentRenderer tokens={token.tokens} />
		</div>
	</details>
{:else}
	<aside class="admonition tone-{status}" aria-label={token.title}>
		<div class="admonition-title">
			{#if status === "error"}
				<CircleAlert aria-hidden="true" />
			{:else if status === "warning"}
				<TriangleAlert aria-hidden="true" />
			{:else if status === "success"}
				<CircleCheck aria-hidden="true" />
			{:else}
				<Info aria-hidden="true" />
			{/if}
			<strong>{token.title}</strong>
		</div>
		<div class="admonition-content">
			<ContentRenderer tokens={token.tokens} />
		</div>
	</aside>
{/if}

<style>
	.admonition {
		margin: 1rem 0;
		border: 1px solid var(--tone-border);
		border-radius: var(--radius);
		background: var(--tone-background);
	}

	.tone-info {
		--tone-border: var(--info-border);
		--tone-background: var(--info-muted);
		--tone-foreground: var(--info);
	}
	.tone-warning {
		--tone-border: var(--warning-border);
		--tone-background: var(--warning-muted);
		--tone-foreground: var(--warning);
	}
	.tone-error {
		--tone-border: var(--destructive-border);
		--tone-background: var(--destructive-muted);
		--tone-foreground: var(--destructive);
	}
	.tone-success {
		--tone-border: var(--success-border);
		--tone-background: var(--success-muted);
		--tone-foreground: var(--success);
	}
	summary,
	.admonition-title {
		padding: 0.75rem 1rem;
		font-weight: 600;
		color: var(--tone-foreground);
	}
	summary {
		cursor: pointer;
	}
	.admonition-title {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.admonition-content {
		padding: 0 1rem 1rem;
		min-width: 0;
	}
	.admonition-content :global(p:first-child) {
		margin-top: 0;
	}
	.admonition-content :global(p:last-child) {
		margin-bottom: 0;
	}
</style>
