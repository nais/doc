<script lang="ts">
	import { InternalHeaderButton } from "#lib/shadcn/ui/index.ts";
	import { Moon as MoonIcon, Sun as SunIcon } from "@lucide/svelte";

	type Theme = "light" | "dark";

	interface Props {
		theme: Theme;
		onchange: (theme: Theme) => void;
	}

	let { theme, onchange }: Props = $props();

	function toggle() {
		const newTheme: Theme = theme === "dark" ? "light" : "dark";
		onchange(newTheme);
	}

	const label = $derived(theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
</script>

<InternalHeaderButton onclick={toggle} aria-label={label} title={label}>
	{#if theme === "dark"}
		<SunIcon aria-hidden="true" />
	{:else}
		<MoonIcon aria-hidden="true" />
	{/if}
</InternalHeaderButton>
