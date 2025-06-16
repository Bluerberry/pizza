
<script lang="ts">

	import * as d3 from 'd3';

	async function loadSvgPaths() {
		const response = await fetch('/signature.svg');
		if (!response.ok) {
			throw new Error('Failed to load SVG');
		}

		// Parse the SVG and extract path data
		const svgText = await response.text();
		const parser = new DOMParser();
		const doc = parser.parseFromString(svgText, 'image/svg+xml');
		const paths = Array.from(doc.querySelectorAll('path'))
						   .map(path => path.getAttribute('d'))
						   .filter(d => d !== null);

		return paths;
	}

	function random(min: number, max: number) {
		return Math.random() * (max - min) + min;
	}

	function flicker(selection: any, iterations: number, n: number = 0) {
		// Happy Pride!

		const selectionSize = selection.size();
		let index = selectionSize;

		// Flicker off
		selection
			.transition()
			.duration(55)
			.ease(d3.easePoly.exponent(7))
			.style('opacity', 0.3)
			.on('end', function() {

				// This event is called for every element in the selection,
				// so we need to keep track if ALL elements have been processed.
				index--;
				if (index > 0) return;
				index = selectionSize;

				// Remove the glow filter
				selection.attr('filter', null);

				// Flicker on
				selection
					.transition()
					.duration(55)
					.ease(d3.easePoly.exponent(7))
					.style('opacity', 1)
					.on('end', () => {

						// This event is called for every element in the selection,
						// so we need to keep track if ALL elements have been processed.
						index--;
						if (index > 0) return;
						index = selectionSize;

						// Reapply the glow filter
						selection.attr('filter', 'url(#glow)');

						// Repeat flicker until iterations are reached
						if (n >= iterations) return;
						setTimeout(
							() => flicker(selection, iterations, n + 1),
							(iterations - n) * random(50, 150)
						);
					});
			});
	}

	function neon(node: SVGElement, paths: string[]) {
		let flickerTimer: NodeJS.Timeout | undefined = undefined;

		const svg = d3.select(node)
			.attr('viewBox', '0 0 1024 1024')
			.attr('transform', 'scale(4, 4)')
			.style('overflow', 'visible');

		// Create gaussian blur filter
		const filter = svg.append('defs')
			.append('filter')
				.attr('id', 'glow')
				.attr('x', '-50%')
				.attr('y', '-50%')
				.attr('width', '200%')
				.attr('height', '200%');
		
		filter.append('feGaussianBlur')
			.attr('stdDeviation', '3')
			.attr('result', 'blur');

		const feMerge = filter.append('feMerge');
		feMerge.append('feMergeNode')
			.attr('in', 'blur');
		feMerge.append('feMergeNode')
			.attr('in', 'SourceGraphic');

		// Create paths
		const pathSelection = svg.selectAll('path')
			.data(paths)
			.enter()
			.append('path')
				.attr('d', d => d)
				.style('stroke-width', 3)
				.style('opacity', 0.3)

		// Flicker a random path at random intervals
		function flickerRandomPath() {
			const index = Math.floor(Math.random() * paths.length);
			pathSelection
				.filter((_, i) => i === index)
				.call(flicker, Math.floor(random(2, 6)));

			flickerTimer = setTimeout(flickerRandomPath, random(4000, 10000));
		}

		// Start animating
		setTimeout(() => flicker(pathSelection, 4), 1000);
		flickerTimer = setTimeout(flickerRandomPath, 8000);

		// Cleanup
		return {
			destroy() {
				clearTimeout(flickerTimer);
				pathSelection.remove();
			}
		};
	}

	let { ...others } = $props();

</script>

{#await loadSvgPaths() then paths}
	<svg {...others} use:neon={paths}></svg>
{:catch error}
	<div class="failed">
		<p> Failed to load brain.svg </p>
		<p> {error} </p>
	</div>
{/await}

<style lang="scss">
	
	@use '$lib/styles/themes' as *;

	svg {
		display: block;
		width: 100%;
		height: 100%;
	}

	@include themed() {
		svg :global(path) {
			stroke: pick('accent');
			fill: none;
		}
	}

</style>