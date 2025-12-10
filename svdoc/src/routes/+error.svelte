<script lang="ts">
	import { resolve } from "$app/paths";
	import { page } from "$app/state";
	import { BodyLong, Button, Heading } from "@nais/ds-svelte-community";
	import { HouseIcon } from "@nais/ds-svelte-community/icons";
</script>

<div class="error-page">
	<div class="error-content">
		<span class="error-code">{page.status}</span>

		<Heading level="1" size="xlarge" spacing>
			{#if page.status === 404}
				Page not found
			{:else}
				Something went wrong
			{/if}
		</Heading>

		<BodyLong size="large" spacing>
			{#if page.status === 404}
				The page you're looking for doesn't exist or has been moved.
			{:else if page.error?.message}
				{page.error.message}
			{:else}
				An unexpected error occurred.
			{/if}
		</BodyLong>

		<div class="error-actions">
			<Button as="a" variant="primary" href={resolve("/")}>
				{#snippet icon()}
					<HouseIcon aria-hidden="true" />
				{/snippet}
				Go to homepage
			</Button>

			<Button variant="secondary" onclick={() => history.back()}>Go back</Button>
		</div>

		<div class="error-suggestions">
			<Heading level="2" size="small" spacing>Suggestions</Heading>
			<ul>
				<li>Check that the URL is spelled correctly</li>
				<li>Use the search to find what you're looking for</li>
				<li>Browse the navigation menu on the left</li>
			</ul>
		</div>
	</div>
</div>

<style>
	.error-page {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 60vh;
		padding: 2rem;
		text-align: center;
	}

	.error-content {
		max-width: 500px;
	}

	.error-code {
		display: block;
		font-size: 8rem;
		font-weight: 700;
		line-height: 1;
		color: var(--ax-text-neutral-subtle, #6a7280);
		opacity: 0.3;
		margin-bottom: 1rem;
	}

	.error-actions {
		display: flex;
		gap: 1rem;
		justify-content: center;
		margin-top: 2rem;
		flex-wrap: wrap;
	}

	.error-suggestions {
		margin-top: 3rem;
		padding-top: 2rem;
		border-top: 1px solid var(--ax-border-neutral-subtle, rgba(175, 184, 193, 0.2));
		text-align: left;
	}

	.error-suggestions ul {
		margin: 0;
		padding-left: 1.5rem;
		color: var(--ax-text-neutral-subtle, #6a7280);
	}

	.error-suggestions li {
		margin-bottom: 0.5rem;
	}
</style>
