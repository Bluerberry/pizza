
<script lang="ts">

	import type { Snippet } from "svelte";

	type Props = {
		style?: 'default' | 'link';
		disabled?: boolean;
		children: Snippet;
		[key: string]: any;
	};

	let {
		style = 'default',
		disabled = false,
		children,
		...others
	}: Props = $props();

</script>

{#if others.href}
	<a class="button {style}" class:disabled {...others}>
		{@render children()}
	</a>
{:else}
	<button class="button {style}" class:disabled {...others}>
		{@render children()}
	</button>
{/if}

<style lang="scss">

	@use '$lib/styles/variables' as *;
	@use '$lib/styles/themes' as *;

	.button {
		position: relative;
		padding: $button-thin-padding $button-thick-padding;

		border-radius: $border-radius;

		cursor: pointer;
		font-size: $m-font;
		background: transparent;
		transition: all $transition;
	}

	.link {
		border: none;
		text-decoration: none;

		&:hover {
			text-decoration: underline;
		}
	}

	.disabled {
		opacity: 50%;
		pointer-events: none;
	}

	@include themed() {
		.button {
			color: pick('foreground');
		}

		.default {
			border: $border-width solid pick('foreground');

			&:hover {
				color: pick('background');
				border-color: pick('accent');
				background-color: pick('accent');
			}
		}
	}

</style>