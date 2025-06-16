
<script lang="ts">

	import Searchbar from "$lib/components/Searchbar.svelte";
	import { Navitem } from "$lib/components/navigation";

	import type { NavitemData } from "$lib/components/navigation";

	function cullTree(tree: NavitemData[], query: string): NavitemData[] {
		return tree
			.map(item => cullItem(item, query))
			.filter(item => item !== null);
	}

	function cullItem(item: NavitemData, query: string): NavitemData | null {
		if (!query) return item;
		const formattedQuery = query.toLowerCase().trim();

		if (item.path) {
			const formattedLabel = item.label.toLowerCase().trim();
			if (formattedLabel.includes(formattedQuery)) {
				return item;
			}
		}

		else if (item.children) {
			const children = cullTree(item.children, query)
			if (children.length > 0) {
				return { ...item, children };
			}
		}

		return null;
	}

	function countTree(tree: NavitemData[]): number {
		return tree.reduce((sum, item) => sum + countItem(item), 0);
	}

	function countItem(item: NavitemData): number {
		if (item.path) return 1;
		if (item.children) return countTree(item.children);
		return 0;
	}

	type Props = { tree: NavitemData[]; }
	let { tree }: Props = $props();

	let query = $state('');

	const culledTree = $derived(cullTree(tree, query));
	const culledSize = $derived(countTree(culledTree));
	const treeSize = $derived(countTree(tree));
	const hiddenItems = $derived(treeSize - culledSize);

</script>

<div class="navigation">
	<Searchbar bind:query />

	{#if culledSize}
		<nav>
			{#each culledTree as item}
				<Navitem data={item} />
			{/each}
		</nav>

		{#if hiddenItems > 0}
			<span class="hidden-items">
				{hiddenItems} items hidden by search
			</span>
		{/if}
	{:else}
		<span class="hidden-items">
			No items match your search
		</span>
	{/if}
</div>

<style lang="scss">

	@use '$lib/styles/variables' as *;
	@use '$lib/styles/themes' as *;

	.navigation {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	
		.hidden-items {
			font-size: $s-font;
		}
	}

	@include themed() {
		.hidden-items {
			color: rgba(pick('foreground'), 50%);
		}
	}

</style>