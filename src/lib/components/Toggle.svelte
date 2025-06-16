
<script lang="ts">
    import type { Snippet } from "svelte";

	type Props = {
		children: Snippet;
		active?: boolean;
		onclick?: (event: MouseEvent) => void;
		[key: string]: any;
	};

	let { 
		children,
		active = $bindable(false),
		onclick = () => {},
		...others
	}: Props = $props();

	const toggleID = 'toggle-' + crypto.randomUUID();

	function handleClick(event: MouseEvent) {
		active = !active;
		onclick(event);
	}

</script>

<div class="toggle" {...others}>
	<button
		id={toggleID}
		role="switch"
		class:active
		aria-checked={active}
		aria-labelledby={toggleID}
		onclick={event => handleClick(event)}>
	</button>

	<label for={toggleID}>
		{@render children()}
	</label>
</div>

<style lang="scss">

	@use '$lib/styles/variables' as *;
	@use '$lib/styles/themes' as *;

	$dot-size: calc( 2rem - 6 * $border-width );

	.toggle {
		display: flex;
		flex-flow: row nowrap;
		align-items: center;
		gap: 1rem;

		button {
			position: relative;
			width: 3rem;
			height: 2rem;

			border-radius: 2rem;

			cursor: pointer;
			background: transparent;

			&::before {
				content: '';
				position: absolute;
				top: 2 * $border-width;
				left: 2 * $border-width;

				width: $dot-size;
				height: $dot-size;
				border-radius: 50%;

				transition: translate $transition;
			}

			&.active::before {
				translate: calc(100% - 2 * $border-width) 0;
			}
		}
	}

	@include themed() {
		button {
			border: $border-width solid pick('foreground');

			&::before {
				background: pick('foreground');
			}
		}
	}

</style>