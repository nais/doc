<script lang="ts">
	import type { Snippet } from "svelte";

	let { theme, children }: { theme: "light" | "dark"; children: Snippet } = $props();
</script>

<div class={["sh-theme-root", theme]} data-theme={theme}>
	{@render children()}
</div>

<style>
	.sh-theme-root {
		min-height: 100vh;
		background: var(--background);
		color: var(--foreground);
	}
</style>
