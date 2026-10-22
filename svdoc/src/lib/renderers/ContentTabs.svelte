<script lang="ts">
	import { replaceState } from "$app/navigation";
	import { page } from "$app/state";
	import { makeTabSlugs } from "$lib/helpers/tab-slug";
	import type { Token } from "marked";
	import { untrack } from "svelte";
	import ContentRenderer from "./ContentRenderer.svelte";

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

	const id = $props.id();
	const tabs = $derived(
		makeTabSlugs(token.tabs.map((tab) => tab.label)).map((slug, index) => ({
			...token.tabs[index],
			slug,
		})),
	);
	let selectedTab = $state(
		untrack(() => makeTabSlugs(token.tabs.map((tab) => tab.label))[0] ?? ""),
	);

	$effect(() => {
		const requestedTab = page.url.searchParams.get("tab");
		selectedTab =
			requestedTab && tabs.some((tab) => tab.slug === requestedTab)
				? requestedTab
				: (tabs[0]?.slug ?? "");
	});

	function selectTab(slug: string) {
		selectedTab = slug;

		const url = new URL(page.url);
		url.searchParams.set("tab", slug);
		replaceState(url, {});
	}
</script>

<div class="content-tabs">
	<div class="aksel-tabs aksel-tabs--small" data-orientation="horizontal">
		<div class="aksel-tabs__tablist-wrapper">
			<div
				class="aksel-tabs__tablist"
				data-orientation="horizontal"
				role="tablist"
				aria-orientation="horizontal"
			>
				{#each tabs as tab, i (tab.slug)}
					<input
						type="radio"
						name="tabs-{id}"
						id="tab-{id}-{i}"
						class="tab-radio tab-radio-{i}"
						value={tab.slug}
						bind:group={selectedTab}
						onchange={() => selectTab(tab.slug)}
					/>
					<label
						for="tab-{id}-{i}"
						class="aksel-tabs__tab aksel-tabs__tab--small aksel-tabs__tab-icon--left"
					>
						<span class="aksel-tabs__tab-inner aksel-body-short aksel-body-short--small">
							<span>{tab.label}</span>
						</span>
					</label>
				{/each}
			</div>
		</div>

		{#each tabs as tab, i (tab.slug)}
			<div class="tab-panel tab-panel-{i} aksel-tabs__tabpanel" id="panel-{id}-{i}">
				<div class="tab-content">
					<ContentRenderer tokens={tab.tokens} />
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.content-tabs {
		margin-top: 1rem !important;
	}

	/* Remove top margin from first element in tab content */
	.tab-content :global(> *:first-child) {
		margin-top: 0;
		padding-top: var(--ax-space-12);
	}

	/* Remove bottom margin from last element in tab content */
	.tab-content :global(> *:last-child) {
		margin-bottom: 0;
	}

	/* Hide radio inputs visually but keep them accessible */
	.tab-radio {
		position: absolute;
		opacity: 0;
		pointer-events: none;
	}

	/* Style labels as tabs */
	label.aksel-tabs__tab {
		cursor: pointer;
	}

	/* Default: hide all panels */
	.tab-panel {
		display: none;
	}

	/* Show panel when corresponding radio is checked */
	.content-tabs:has(.tab-radio-0:checked) .tab-panel-0 {
		display: block;
	}

	.content-tabs:has(.tab-radio-1:checked) .tab-panel-1 {
		display: block;
	}

	.content-tabs:has(.tab-radio-2:checked) .tab-panel-2 {
		display: block;
	}

	.content-tabs:has(.tab-radio-3:checked) .tab-panel-3 {
		display: block;
	}

	.content-tabs:has(.tab-radio-4:checked) .tab-panel-4 {
		display: block;
	}

	/* Active tab styling */
	.tab-radio:checked + label {
		box-shadow: inset 0 -4px var(--ax-border-strong);
		color: var(--ax-text-action);
	}

	/* Hover state for tabs */
	label.aksel-tabs__tab:hover {
		box-shadow: inset 0 -4px var(--ax-border-strong);
		background-color: var(--ax-surface-action-subtle-hover);
	}
</style>
