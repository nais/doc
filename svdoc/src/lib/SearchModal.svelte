<script lang="ts">
	import { goto } from "$app/navigation";
	import { Modal, Search } from "@nais/ds-svelte-community";
	import MiniSearch, { type SearchResult } from "minisearch";
	import { onMount } from "svelte";

	interface SearchDocument {
		id: string;
		title: string;
		path: string;
		headings: { text: string; id: string; level: number }[];
		content: string;
	}

	interface Props {
		open: boolean;
	}

	let { open = $bindable(false) }: Props = $props();

	let searchQuery = $state("");
	let documents = $state<SearchDocument[]>([]);
	let miniSearch = $state<MiniSearch<SearchDocument> | null>(null);
	let isLoading = $state(false);
	let selectedIndex = $state(0);

	// Derive search results from query and miniSearch instance
	let results = $derived.by(() => {
		if (!miniSearch || !searchQuery.trim()) {
			return [];
		}
		return miniSearch.search(searchQuery).slice(0, 10);
	});

	// Reset selected index when results change
	$effect(() => {
		// Access results to track it
		if (results) {
			selectedIndex = 0;
		}
	});

	// Load search index
	async function loadSearchIndex() {
		if (documents.length > 0) return; // Already loaded

		isLoading = true;
		try {
			const response = await fetch("/data/search-index.json");
			documents = await response.json();

			miniSearch = new MiniSearch<SearchDocument>({
				fields: ["title", "content", "headings.text"],
				storeFields: ["title", "path", "headings"],
				extractField: (document, fieldName) => {
					if (fieldName === "headings.text") {
						return document.headings.map((h) => h.text).join(" ");
					}
					return document[fieldName as keyof SearchDocument] as string;
				},
				searchOptions: {
					boost: { title: 3, "headings.text": 2 },
					fuzzy: 0.2,
					prefix: true,
				},
			});

			miniSearch.addAll(documents);
		} catch (error) {
			console.error("Failed to load search index:", error);
		} finally {
			isLoading = false;
		}
	}

	// Get document by ID - use a Map for O(1) lookup
	let documentsById = $derived(new Map(documents.map((d) => [d.id, d])));

	function getDocument(id: string): SearchDocument | undefined {
		return documentsById.get(id);
	}

	// Navigate to result
	function navigateToResult(result: SearchResult) {
		const doc = getDocument(result.id);
		if (doc) {
			open = false;
			searchQuery = "";
			goto(doc.path);
		}
	}

	// Handle keyboard navigation
	function handleKeydown(event: KeyboardEvent) {
		if (!open) return;

		switch (event.key) {
			case "ArrowDown":
				event.preventDefault();
				selectedIndex = Math.min(selectedIndex + 1, results.length - 1);
				break;
			case "ArrowUp":
				event.preventDefault();
				selectedIndex = Math.max(selectedIndex - 1, 0);
				break;
			case "Enter":
				event.preventDefault();
				if (results[selectedIndex]) {
					navigateToResult(results[selectedIndex]);
				}
				break;
		}
	}

	// Highlight matching text
	// Note: We control both the source content (our docs) and the regex,
	// so XSS is not a concern here
	function highlightMatch(text: string, query: string): string {
		if (!query.trim()) return escapeHtml(text);

		const words = query
			.trim()
			.toLowerCase()
			.split(/\s+/)
			.filter((w) => w.length > 1);
		if (words.length === 0) return escapeHtml(text);

		const escapedWords = words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
		const regex = new RegExp(`(${escapedWords.join("|")})`, "gi");

		// Split text by matches and rebuild with escaped text + mark tags
		const parts = text.split(regex);
		return parts
			.map((part) => {
				if (words.some((w) => part.toLowerCase() === w)) {
					return `<mark>${escapeHtml(part)}</mark>`;
				}
				return escapeHtml(part);
			})
			.join("");
	}

	function escapeHtml(text: string): string {
		return text
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#039;");
	}

	// Get content snippet around match
	function getSnippet(doc: SearchDocument, query: string): string {
		const content = doc.content;
		const words = query
			.trim()
			.toLowerCase()
			.split(/\s+/)
			.filter((w) => w.length > 1);

		if (words.length === 0) return content.slice(0, 150) + "...";

		// Find first occurrence of any search term
		const lowerContent = content.toLowerCase();
		let firstMatch = content.length;

		for (const word of words) {
			const index = lowerContent.indexOf(word);
			if (index !== -1 && index < firstMatch) {
				firstMatch = index;
			}
		}

		// Extract snippet around the match
		const start = Math.max(0, firstMatch - 50);
		const end = Math.min(content.length, firstMatch + 150);

		let snippet = content.slice(start, end);
		if (start > 0) snippet = "..." + snippet;
		if (end < content.length) snippet = snippet + "...";

		return snippet;
	}

	let searchContainer: HTMLDivElement;

	// Load index and focus input when modal opens
	$effect(() => {
		if (open) {
			loadSearchIndex();
			// Focus the search input after modal opens
			setTimeout(() => {
				const input = searchContainer?.querySelector('input[type="search"]');
				if (input instanceof HTMLInputElement) {
					input.focus();
				}
			}, 50);
		}
	});

	// Global keyboard shortcut
	onMount(() => {
		function handleGlobalKeydown(event: KeyboardEvent) {
			// Cmd+K or Ctrl+K to open search
			if ((event.metaKey || event.ctrlKey) && event.key === "k") {
				event.preventDefault();
				open = !open;
			}
		}

		window.addEventListener("keydown", handleGlobalKeydown);
		return () => window.removeEventListener("keydown", handleGlobalKeydown);
	});
</script>

<Modal bind:open width="medium" closeButton={true}>
	{#snippet header()}
		<div class="search-header" bind:this={searchContainer}>
			<Search
				label="Search documentation"
				hideLabel={true}
				variant="simple"
				bind:value={searchQuery}
				placeholder="Search documentation..."
				onkeydown={handleKeydown}
				loading={isLoading}
			/>
		</div>
	{/snippet}

	<div class="search-results" role="listbox" aria-label="Search results">
		{#if searchQuery.trim() && results.length === 0 && !isLoading}
			<div class="no-results">
				<p>No results found for "{searchQuery}"</p>
			</div>
		{:else if results.length > 0}
			{#each results as result, i (result.id)}
				{@const doc = getDocument(result.id)}
				{#if doc}
					<button
						class="search-result"
						class:selected={i === selectedIndex}
						role="option"
						aria-selected={i === selectedIndex}
						onclick={() => navigateToResult(result)}
						onmouseenter={() => (selectedIndex = i)}
					>
						<div class="result-title">
							{@html highlightMatch(doc.title, searchQuery)}
						</div>
						<div class="result-path">{doc.path}</div>
						<div class="result-snippet">
							{@html highlightMatch(getSnippet(doc, searchQuery), searchQuery)}
						</div>
					</button>
				{/if}
			{/each}
		{:else if !searchQuery.trim()}
			<div class="search-hint">
				<p>Type to search the documentation</p>
				<div class="keyboard-hints">
					<span><kbd>↑</kbd><kbd>↓</kbd> to navigate</span>
					<span><kbd>Enter</kbd> to select</span>
					<span><kbd>Esc</kbd> to close</span>
				</div>
			</div>
		{/if}
	</div>
</Modal>

<style>
	.search-header {
		width: 100%;
		padding-right: 2.5rem;
	}

	.search-header :global(.aksel-search) {
		width: 100%;
	}

	.search-results {
		min-height: 200px;
		max-height: 400px;
		overflow-y: auto;
	}

	.no-results,
	.search-hint {
		padding: 2rem;
		text-align: center;
		color: var(--ax-text-neutral-subtle, #6a7280);
	}

	.keyboard-hints {
		display: flex;
		gap: 1rem;
		justify-content: center;
		margin-top: 1rem;
		font-size: 0.875rem;
	}

	.keyboard-hints kbd {
		display: inline-block;
		padding: 0.125rem 0.375rem;
		font-family: monospace;
		font-size: 0.75rem;
		background: var(--ax-bg-neutral-soft, rgba(0, 0, 0, 0.2));
		border: 1px solid var(--ax-border-neutral-subtle, rgba(175, 184, 193, 0.2));
		border-radius: 4px;
	}

	.search-result {
		display: block;
		width: 100%;
		padding: 0.75rem 1rem;
		text-align: left;
		background: transparent;
		border: none;
		border-bottom: 1px solid var(--ax-border-neutral-subtle, rgba(175, 184, 193, 0.2));
		cursor: pointer;
		transition: background-color 0.1s;
	}

	.search-result:hover,
	.search-result.selected {
		background: var(--ax-bg-neutral-soft, rgba(0, 0, 0, 0.2));
	}

	.search-result:last-child {
		border-bottom: none;
	}

	.result-title {
		font-weight: 600;
		color: var(--ax-text-default, #fff);
		margin-bottom: 0.25rem;
	}

	.result-path {
		font-size: 0.75rem;
		color: var(--ax-text-neutral-subtle, #6a7280);
		margin-bottom: 0.25rem;
	}

	.result-snippet {
		font-size: 0.875rem;
		color: var(--ax-text-neutral, #9ca3af);
		line-height: 1.4;
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
	}

	.search-result :global(mark) {
		background: var(--ax-bg-warning-moderate, rgba(251, 191, 36, 0.3));
		color: inherit;
		padding: 0 0.125rem;
		border-radius: 2px;
	}
</style>
