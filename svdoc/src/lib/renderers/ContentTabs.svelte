<script lang="ts">
	import { Tab, TabList, TabPanel, Tabs } from "@nais/ds-svelte-community";
	import type { Token } from "marked";
	import Renderer from "./Renderer.svelte";

	interface ContentTab {
		label: string;
		tokens: Token[];
	}

	interface Props {
		token: {
			tabs: ContentTab[];
		};
	}

	let { token }: Props = $props();

	// Default to first tab
	let activeTab = $state(token.tabs[0]?.label ?? "");
</script>

<div class="content-tabs">
	<Tabs bind:value={activeTab} size="small">
		<TabList>
			{#each token.tabs as tab, i (i)}
				<Tab value={tab.label}>{tab.label}</Tab>
			{/each}
		</TabList>
		{#each token.tabs as tab, i (i)}
			<TabPanel value={tab.label}>
				<div class="tab-content">
					<Renderer tokens={tab.tokens} />
				</div>
			</TabPanel>
		{/each}
	</Tabs>
</div>

<style>
	.content-tabs {
		margin: 1rem 0;
	}

	.tab-content {
		padding: 1rem 0;
	}

	/* Remove top margin from first element in tab content */
	.tab-content :global(> *:first-child) {
		margin-top: 0;
	}

	/* Remove bottom margin from last element in tab content */
	.tab-content :global(> *:last-child) {
		margin-bottom: 0;
	}
</style>
