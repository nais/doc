<script lang="ts">
	import type { Tokens } from "marked";

	let { token }: { token: Tokens.Escape } = $props();
</script>

{token.text}
