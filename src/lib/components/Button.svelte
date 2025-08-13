
<script lang="ts">

	import { setContext } from 'svelte';
    import { writable } from 'svelte/store';

	import type { Snippet } from 'svelte';

	type Props = {
		children: Snippet;
		type?: 'button' | 'submit';
		style?: 'default' | 'link' | 'underline';
		disabled?: boolean;
		loading?: boolean;
		[key: string]: any;
	};

	let {
		children,
		type = 'button',
		style = 'default',
		disabled = false,
		loading = false,
		...others
	}: Props = $props();

	let hover = writable(false);
	setContext('parentHover', hover);
	let focus = writable(false);
	setContext('parentFocus', focus);

</script>

{#if others.href}
	<a 
		class="button {style}" 
		class:disabled={ disabled || loading }
		onblur={ () => $focus = false }
		onfocus={ () => $focus = true }
		onmouseenter={ () => $hover = true }
		onmouseleave={ () => $hover = false }
		{...others}
	>
		<div class="children" class:hide={ loading }>
			{@render children()}
		</div>

		{#if loading}
			<div class="spinner"></div>
		{/if}
	</a>
{:else}
	<button
		type={type}
		class="button {style}" 
		class:disabled={ disabled || loading }
		onblur={ () => $focus = false }
		onfocus={ () => $focus = true }
		onmouseenter={ () => $hover = true }
		onmouseleave={ () => $hover = false }
		{...others}
	>
		<div class="children" class:hide={ loading }>
			{@render children()}
		</div>

		{#if loading}
			<div class="spinner"></div>
		{/if}
	</button>
{/if}

<style lang="scss">

	@use '$lib/styles/variables' as *;
	@use '$lib/styles/themes' as *;

	.button {
		position: relative;
		padding: $button-thin-padding $button-thick-padding;
		border-radius: $border-radius;

		font-size: $m-font;
		text-wrap: nowrap;

		cursor: pointer;
		user-select: none;
		caret-color: transparent;

		transition: all $transition;

		.children {
			display: flex;
			flex-flow: row nowrap;
			gap: $icon-padding;
		}

		.spinner {
			position: absolute;
			translate: -50% -50%;
			top: 50%;
			left: 50%;

			width: $m-font;
			height: $m-font;
			border-radius: 50%;

			animation: spin 1s linear infinite;
		}
	}

	.link {
		padding: 0.25rem;

		&:hover {
			text-decoration: underline;
		}
	}

	.underline {
		padding: 0.25rem;
		text-decoration: underline;
	}

	.disabled {
		opacity: 50%;
		pointer-events: none;
	}

	.hide {
		opacity: 0;
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

		.underline {
			&:hover {
				color: pick('accent');
			}
		}

		.spinner {
			border: $border-width solid pick('foreground');
			border-top-color: transparent;
		}
	}

	@keyframes spin {
		from { transform: rotate(0deg); }
		to { transform: rotate(360deg); }
	}

</style>