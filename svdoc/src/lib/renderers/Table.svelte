<script lang="ts">
	import type { Tokens } from "marked";
	import Renderer from "./Renderer.svelte";

	let { token }: { token: Tokens.Table } = $props();
</script>

<div class="table-wrapper">
	<table>
		<thead>
			<tr>
				{#each token.header as cell, i (i)}
					<th style:text-align={cell.align || undefined} scope="col">
						<Renderer tokens={cell.tokens} />
					</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each token.rows as row, rowIndex (rowIndex)}
				<tr>
					{#each row as cell, cellIndex (cellIndex)}
						<td style:text-align={cell.align || undefined}>
							<Renderer tokens={cell.tokens} />
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	.table-wrapper {
		overflow-x: auto;
		margin-bottom: var(--ax-space-28);
	}

	table {
		width: 100%;
		border-collapse: collapse;
		text-align: left;
	}
	th,
	td {
		padding: 0.75rem;
		border-bottom: 1px solid var(--border);
	}
	th {
		font-weight: 600;
	}
	tbody tr:nth-child(even) {
		background: var(--secondary);
	}
</style>
