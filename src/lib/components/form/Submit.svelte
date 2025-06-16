
<script lang="ts">

	import Button from '$lib/components/Button.svelte';
	import { getContext, type Snippet } from 'svelte';

	import type { Readable } from 'svelte/store';

	type Props = {
		children: Snippet;
		[key: string]: any;
	};

	let {
		children,
		...others
	}: Props = $props();

	const submitting: Readable<boolean> = getContext("submitting");

</script>

<Button type="submit" disabled={$submitting} {...others}>
	<div class:hide={$submitting}>
		{@render children()}
	</div>

	{#if $submitting}
		<div class="spinner"></div>
	{/if}
</Button>

<style lang="scss">

	@use '$lib/styles/variables' as *;
	@use '$lib/styles/themes' as *;

	.hide {
		opacity: 0;
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

	@include themed() {
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