
<script lang="ts">

	import { getContext } from "svelte";
	import type { Writable } from "svelte/store";

	let { ...others } = $props();
	const formMessage: Writable<any> = getContext("formMessage");

</script>

<span class="message" {...others}>
	{$formMessage}
</span>

<style lang="scss">

	@use '$lib/styles/variables' as *;
	@use '$lib/styles/themes' as *;

	.message {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		width: 100%;

		font-size: $s-font;
	}

	@include themed() {
		.message {
			color: pick('error');
		}
	}

</style>