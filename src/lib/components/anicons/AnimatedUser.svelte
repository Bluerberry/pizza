
<script lang="ts">

	import * as d3 from  'd3';
	import { onMount } from  'svelte';
	import { getContext } from 'svelte';
	import { User } from  '@lucide/svelte';

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
	let head: d3.Selection<d3.BaseType, unknown, null, undefined>;

	let parentHover = getContext('parentHover') as Writable<boolean>;
	let hover = $derived( $parentHover || hoverProp );
	let parentFocus = getContext('parentFocus') as Writable<boolean>;
	let focus = $derived( $parentFocus || focusProp );

	onMount(() => {
		head = d3.select(wrapper)
				 .select('circle');
	});

	$effect(() => {
		if (!head) return;

		if (hover || focus) {
			head.interrupt()
				.transition()
				.duration(150)
				.ease(d3.easeCubicOut)
					.attr('transform', 'translate(0,-4)');
		} 
		
		else {
			head.interrupt()
				.transition()
				.duration(150)
				.ease(d3.easeCubicOut)
					.attr('transform', 'translate(0,0)');
		}
	});

</script>

<div class="anicon" {...other} bind:this={wrapper}>
	<User />
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