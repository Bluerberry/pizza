
<script lang="ts">

	import * as d3 from  'd3';
	import { onMount } from  'svelte';
	import { getContext } from 'svelte';
	import { LogOut } from  '@lucide/svelte';

    import type { Writable } from 'svelte/store';

	type Props = {
		hoverProp?: boolean,
		focusProp?: boolean,
		[key: string]: any
	}

	let {
		hoverProp = false,
		focusProp = false,
		...other
	}: Props = $props();

	let wrapper: HTMLElement;
	let arrow: d3.Selection<d3.BaseType, unknown, HTMLElement, undefined>;

	let parentHover = getContext('parentHover') as Writable<boolean>;
	let hover = $derived( $parentHover || hoverProp );
	let parentFocus = getContext('parentFocus') as Writable<boolean>;
	let focus = $derived( $parentFocus || focusProp );

	onMount(() => {
		arrow = d3.select(wrapper)
				 .selectAll('path')
				 .filter((_, index) => index < 2);
	});

	$effect(() => {
		if (!arrow) return;

		if (hover || focus) {
			arrow.interrupt()
				.transition()
				.duration(150)
				.ease(d3.easeCubicOut)
					.attr('transform', 'translate(4,0)');
		} 
		
		else {
			arrow.interrupt()
				.transition()
				.duration(150)
				.ease(d3.easeCubicOut)
					.attr('transform', 'translate(0,0)');
		}
	});

</script>

<div class="anicon" {...other} bind:this={wrapper}>
	<LogOut />
</div>

<style lang="scss">

	.anicon {
		display: flex;
		align-items: center;
		justify-content: center;

		:global(*) {
			overflow: visible;
		}
	} 

</style>