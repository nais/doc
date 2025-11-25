<script lang="ts">
	import favicon from "$lib/assets/favicon.svg";
	import { Page, Spacer, Theme } from "@nais/ds-svelte-community";
	import { InternalHeader, InternalHeaderTitle } from "@nais/ds-svelte-community/experimental";
	import "../css/app.css";
	import "./layout.css";

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<Theme theme="dark">
	<InternalHeader>
		<InternalHeaderTitle href="#Home">Nais Docs</InternalHeaderTitle>
		<Spacer />
	</InternalHeader>

	<Page contentBlockPadding="none">
		<div class="full-wrapper">
			{@render children()}
		</div>
	</Page>
</Theme>

<style>
	:global(.page) {
		margin: 0 auto 0 auto;
		min-width: 1000px;
		max-width: 1432px;
	}

	@media (max-width: 1464px) {
		:global(.page) {
			padding: 0 2rem;
		}
	}

	.full-wrapper {
		padding-bottom: 1rem;
	}
</style>
