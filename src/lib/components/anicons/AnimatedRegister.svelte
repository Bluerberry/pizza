
<script lang="ts">

	import * as d3 from  'd3';
	import { onMount } from  'svelte';
	import { getContext } from 'svelte';
	import { UserPlus } from  '@lucide/svelte';

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
	let plus: d3.Selection<d3.BaseType, unknown, HTMLElement, undefined>;

	let parentHover = getContext('parentHover') as Writable<boolean>;
	let hover = $derived( $parentHover || hoverProp );
	let parentFocus = getContext('parentFocus') as Writable<boolean>;
	let focus = $derived( $parentFocus || focusProp );

	onMount(() => {
		plus = d3.select(wrapper)
				 .selectAll('line')
				 .attr('transform-origin', '19 11');
	});

	$effect(() => {
		if (!plus) return;

		if (hover || focus) {
			plus.interrupt()
				.transition()
				.duration(150)
				.ease(d3.easeCubicOut)
					.attr('transform', 'rotate(90)');
		} 
		
		else {
			plus.interrupt()
				.transition()
				.duration(150)
				.ease(d3.easeCubicOut)
					.attr('transform', 'rotate(0)');
		}
	});

</script>

<div class="anicon" {...other} bind:this={wrapper}>
	<UserPlus />
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