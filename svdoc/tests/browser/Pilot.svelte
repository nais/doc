<script lang="ts">
	import { Button, Theme } from "@nais/ui";
	import { untrack } from "svelte";
	import Modal from "../../src/lib/shadcn/ui/Modal.svelte";
	import Search from "../../src/lib/shadcn/ui/Search.svelte";
	import "../../src/css/app.css";

	let open = $state(false);
	let query = $state("");
	let theme = $state<"light" | "dark">("light");
	let mounts = $state(0);
</script>

<main data-ready="true">
	<Theme theme="dark" data-testid="outer-theme">
		<Button>Outer button</Button>
		<Theme {theme} data-testid="inner-theme">
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
