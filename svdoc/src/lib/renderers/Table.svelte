<script lang="ts">
	import { Table, Tbody, Td, Th, Thead, Tr } from "@nais/ds-svelte-community";
	import type { Tokens } from "marked";
	import Renderer from "./Renderer.svelte";

	let { token }: { token: Tokens.Table } = $props();
</script>

<Table zebraStripes>
	<Thead>
		<Tr>
			{#each token.header as cell, i (i)}
				<Th align={cell.align || undefined}>
					<Renderer tokens={cell.tokens} />
				</Th>
			{/each}
		</Tr>
	</Thead>
	<Tbody>
		{#each token.rows as row, rowIndex (rowIndex)}
			<Tr>
				{#each row as cell, cellIndex (cellIndex)}
					<Td align={cell.align || undefined}>
						<Renderer tokens={cell.tokens} />
					</Td>
				{/each}
			</Tr>
		{/each}
	</Tbody>
</Table>
