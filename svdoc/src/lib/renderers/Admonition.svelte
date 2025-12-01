<script lang="ts">
	import { browser } from "$app/environment";
	import { Alert, ExpansionCard } from "@nais/ds-svelte-community";
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
	function getAlertVariant(type: string): "error" | "warning" | "info" | "success" {
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

	const variant = $derived(getAlertVariant(token.admonitionType));
</script>

{#if token.collapsible}
	<div class="admonition admonition--collapsible admonition--{token.admonitionType}">
		<ExpansionCard header={token.title} open={!browser || token.open} size="small">
			<div class="admonition-content">
				<ContentRenderer tokens={token.tokens} />
			</div>
		</ExpansionCard>
	</div>
{:else}
	<div class="admonition admonition--{token.admonitionType}">
		<Alert {variant} size="small">
			{#if token.title}
				<strong class="admonition-title">{token.title}</strong>
			{/if}
			<div class="admonition-content">
				<ContentRenderer tokens={token.tokens} />
			</div>
		</Alert>
	</div>
{/if}

<style>
	.admonition {
		margin: 1rem 0;
	}

	.admonition-title {
		display: block;
		margin-bottom: 0.5rem;
	}

	.admonition-content {
		font-size: 0.9375rem;
	}

	/* Remove default margins from nested elements */
	.admonition-content :global(p:first-child) {
		margin-top: 0;
	}

	.admonition-content :global(p:last-child) {
		margin-bottom: 0;
	}

	/* Truncate expansion card title if too wide */
	.admonition--collapsible :global(.aksel-expansioncard__header-content) {
		overflow: hidden;
		min-width: 0;
	}

	.admonition--collapsible :global(.aksel-expansioncard__title) {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	/* Override overflow:hidden on expansion card content to allow code block scrolling */
	.admonition--collapsible :global(.aksel-expansioncard__content[data-open="true"]) {
		overflow: unset;
	}

	/* Style collapsible admonitions based on type */
	.admonition--collapsible.admonition--warning :global(.navds-expansioncard),
	.admonition--collapsible.admonition--caution :global(.navds-expansioncard),
	.admonition--collapsible.admonition--attention :global(.navds-expansioncard),
	.admonition--collapsible.admonition--gcp-only :global(.navds-expansioncard) {
		border-color: var(--ax-border-warning, #e75e01);
		background-color: var(--ax-bg-warning-soft, rgba(231, 94, 1, 0.1));
	}

	.admonition--collapsible.admonition--danger :global(.navds-expansioncard),
	.admonition--collapsible.admonition--error :global(.navds-expansioncard),
	.admonition--collapsible.admonition--bug :global(.navds-expansioncard),
	.admonition--collapsible.admonition--fail :global(.navds-expansioncard),
	.admonition--collapsible.admonition--failure :global(.navds-expansioncard),
	.admonition--collapsible.admonition--missing :global(.navds-expansioncard) {
		border-color: var(--ax-border-danger, #ec526e);
		background-color: var(--ax-bg-danger-soft, rgba(236, 82, 110, 0.1));
	}

	.admonition--collapsible.admonition--success :global(.navds-expansioncard),
	.admonition--collapsible.admonition--check :global(.navds-expansioncard),
	.admonition--collapsible.admonition--done :global(.navds-expansioncard) {
		border-color: var(--ax-border-success, #207c41);
		background-color: var(--ax-bg-success-soft, rgba(32, 124, 65, 0.1));
	}

	.admonition--collapsible.admonition--info :global(.navds-expansioncard),
	.admonition--collapsible.admonition--note :global(.navds-expansioncard),
	.admonition--collapsible.admonition--tip :global(.navds-expansioncard),
	.admonition--collapsible.admonition--hint :global(.navds-expansioncard),
	.admonition--collapsible.admonition--important :global(.navds-expansioncard),
	.admonition--collapsible.admonition--example :global(.navds-expansioncard),
	.admonition--collapsible.admonition--quote :global(.navds-expansioncard),
	.admonition--collapsible.admonition--cite :global(.navds-expansioncard),
	.admonition--collapsible.admonition--abstract :global(.navds-expansioncard),
	.admonition--collapsible.admonition--summary :global(.navds-expansioncard),
	.admonition--collapsible.admonition--tldr :global(.navds-expansioncard),
	.admonition--collapsible.admonition--question :global(.navds-expansioncard),
	.admonition--collapsible.admonition--help :global(.navds-expansioncard),
	.admonition--collapsible.admonition--faq :global(.navds-expansioncard) {
		border-color: var(--ax-border-info, #5a8fae);
		background-color: var(--ax-bg-info-soft, rgba(90, 143, 174, 0.1));
	}
</style>
