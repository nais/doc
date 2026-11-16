<script lang="ts">
	import { Button, Theme } from "@nais/ui";
	import { untrack } from "svelte";
	import Modal from "../../src/lib/shadcn/ui/Modal.svelte";
	import Search from "../../src/lib/shadcn/ui/Search.svelte";
	import Heading from "../../src/lib/shadcn/ui/Heading.svelte";
	import Tag from "../../src/lib/shadcn/ui/Tag.svelte";
	import "../../src/css/app.css";

	let open = $state(false);
	let query = $state("");
	let theme = $state<"light" | "dark">("light");
	let mounts = $state(0);
	const headings = [
		{ level: "1", size: "xlarge" },
		{ level: "2", size: "large" },
		{ level: "3", size: "medium" },
		{ level: "4", size: "small" },
		{ level: "5", size: "xsmall" },
		{ level: "6", size: "xsmall" },
	] as const;
</script>

<main data-ready="true">
	<Theme theme="dark" data-testid="outer-theme">
		<Button>Outer button</Button>
		<Theme {theme} data-testid="inner-theme">
			<section aria-label="Typography">
				{#each headings as { level, size } (level)}
					<Heading {level} {size} spacing id={`pilot-heading-${level}`}>
						Heading {level}
					</Heading>
				{/each}
				<Heading as="h3" level="1" class="custom-heading" data-testid="override-heading">
					Explicit heading element
				</Heading>
				<a href="#pilot-heading-1" aria-label="Pilot tag link">
					<Tag class="custom-tag" data-testid="pilot-tag">Reference 123</Tag>
				</a>
				<div style="width: 100px">
					<Tag data-testid="wrapping-tag">Several words that wrap across multiple lines</Tag>
				</div>
			</section>
			<Button onclick={() => (theme = theme === "light" ? "dark" : "light")}>
				Toggle nested theme
			</Button>
			<Button onclick={() => (open = true)}>Open pilot</Button>
			<Modal bind:open title="Pilot dialog">
				{#snippet header()}
					<Search label="Pilot search" bind:value={query} />
				{/snippet}
				<div
					{@attach () => {
						untrack(() => (mounts += 1));
					}}
				>
					<label>Uncontrolled draft <input aria-label="Uncontrolled draft" /></label>
					<button type="button" onclick={() => (theme = theme === "light" ? "dark" : "light")}>
						Toggle dialog theme
					</button>
					<button type="button" onclick={() => (open = false)}>Finish</button>
				</div>
			</Modal>
			<output aria-label="Mount count">{mounts}</output>
			<Theme theme="dark" data-testid="deep-theme">
				<Button>Deep button</Button>
			</Theme>
		</Theme>
	</Theme>
</main>
