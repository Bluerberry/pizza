
<script lang="ts">
	import { Search } from "@lucide/svelte";


	let {
		placeholder = "Search...",
		query = $bindable()
	} = $props();

</script>

<div class="searchbar">
	<input type="text" {placeholder} bind:value={query} />
	<Search />
</div>

<style lang="scss">

	@use '$lib/styles/variables' as *;
	@use '$lib/styles/themes' as *;

	.searchbar {
		position: relative;

		input {
			width: 100%;
			padding: $input-thin-padding 0;
			padding-right: 2 * $icon-padding + $icon-size;

			border: none;
			outline: none;

			font-size: $m-font;
			background: transparent;
		}

		:global(.lucide) {
			position: absolute;
			translate: 0 -50%;
			right: $icon-padding;
			top: 50%;

			width: $icon-size;
			height: $icon-size;

			pointer-events: none;
			transition: color $transition;
		}
	}

	@include themed() {
		.searchbar {
			border-bottom: $border-width solid pick('foreground');

			input {
				color: pick('foreground');

				&::placeholder {
					color: rgba(pick('foreground'), 50%);
				}

				&:focus, &:hover {
					& ~ :global(.lucide) {
						color: pick('foreground');
					}
				}
			}

			:global(.lucide) {
				color: rgba(pick('foreground'), 50%);
			}
		}
	}

</style>