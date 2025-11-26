<script lang="ts">
	import { InternalHeaderButton } from "@nais/ds-svelte-community/experimental";
	import { MoonIcon, SunIcon } from "@nais/ds-svelte-community/icons";

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

<InternalHeaderButton as="button" onclick={toggle} aria-label={label} title={label}>
	{#if theme === "dark"}
		<SunIcon aria-hidden="true" />
	{:else}
		<MoonIcon aria-hidden="true" />
	{/if}
</InternalHeaderButton>
