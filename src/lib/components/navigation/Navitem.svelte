
<script lang="ts">

	import { ChevronDown, ChevronRight } from "@lucide/svelte";
	import { Navitem } from "$lib/components/navigation";
	import { slide } from "svelte/transition";
	import { page } from "$app/state";

	import type { NavitemData } from "$lib/components/navigation";

	type Props = { data: NavitemData};
	let { data }: Props = $props();

	const current = $derived(page.url.pathname === data.path);
	let open = $state(true);

</script>

{#if data.path}
	<a href={data.path} class="navitem" class:current> {data.label} </a>
{:else if data.children}
	<button onclick={() => open = !open} class="navitem" >
		{#if open}
			<ChevronDown />
		{:else}
			<ChevronRight />
		{/if}

		{data.label}
	</button>

	{#if open}
		<div class="children" transition:slide={{ duration: 150 }}>
			{#each data.children as child}
				<Navitem data={child} />
			{/each}
		</div>
	{/if}
{/if}

<style lang="scss">

	@use '$lib/styles/variables' as *;
	@use '$lib/styles/themes' as *;
	@use 'sass:math';

	.navitem {
		position: relative;
		display: flex;
		flex-direction: row;

		width: 100%;
		padding: 0.25rem;
		padding-left: 2 * $icon-padding + $icon-size;

		border: none;

		cursor: pointer;
		text-align: left;
		text-decoration: none;
		font-size: $m-font;
		background: transparent;

		:global(.lucide) {
			position: absolute;
			translate: 0 -50%;
			left: $icon-padding;
			top: 50%;

			width: $icon-size;
			height: $icon-size;
			pointer-events: none;
		}
	}

	a:hover, a:focus {
		text-decoration: underline;
	}

	.current::before {
		content: '';
		position: absolute;
		translate: 0 -50%;
		left: $icon-padding + math.div($icon-size, 2);
		top: 50%;

		width: 0px;
		height: 0px;
		border-radius: 100%;
	}

	.children {
		margin-left: $icon-padding + math.div($icon-size, 2);
	}

	@include themed() {
		.navitem {
			color: pick('foreground');
		}

		.current::before {
			border: 2px solid pick('foreground');
			background-color: pick('foreground');
		}

		.children {
			border-left: 1px solid rgba(pick('foreground'), 50%);
		}
	}

</style>
