<script lang="ts">
	interface DefToken {
		type: "def";
		tag: string;
		raw: string;
		href: string;
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	let { token }: { token: DefToken } = $props();

	// Link reference definitions don't render any visible content
	// They are used as metadata for reference-style links [text][tag]
</script>
