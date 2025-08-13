
<script lang="ts">

	import { page } from "$app/state";
	import { slide } from "svelte/transition";
	import { Navitem } from "$lib/components/navigation";
	import { ChevronRight } from "@lucide/svelte";
    import { Permission } from "$lib/scripts/permissions";

	import type { NavitemData } from "$lib/components/navigation";

	type Props = { 
		data: NavitemData;
		permissions: Permission;
	};
	let { 
		data,
		permissions
	}: Props = $props();

	const current = $derived(page.url.pathname === data.path);
	let open = $state(false);

</script>

{#if !data.permissions || data.permissions <= permissions}
	{#if data.path}
		<a href={data.path} class="navitem" class:current> {data.label} </a>
	{:else if data.children}
		<button onclick={() => open = !open} class="navitem" class:open>
			<ChevronRight /> {data.label}
		</button>

		{#if open}
			<div class="children" transition:slide={{ duration: 200 }}>
				{#each data.children as child}
					<Navitem data={child} {permissions} />
				{/each}
			</div>
		{/if}
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

		text-align: left;
		font-size: $m-font;

		cursor: pointer;
		user-select: none;
		caret-color: transparent;

		:global(.lucide) {
			position: absolute;
			translate: 0 -50%;
			left: $icon-padding;
			top: 50%;

			width: $icon-size;
			height: $icon-size;
			pointer-events: none;
		}

		&.open :global(.lucide) {
			rotate: 90deg;
		}

		&:hover, &:focus {
			text-decoration: underline;
		}
	}

	.current::before {
		content: '';
		position: absolute;
		translate: 0 -50%;
		top: 50%;
		left: $icon-padding + math.div($icon-size, 2);

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
			border: 2px solid pick('accent');
			background-color: pick('accent');
		}

		.children {
			border-left: 1px solid pick('muted');
		}
	}

</style>
