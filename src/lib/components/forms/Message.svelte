
<script lang="ts">

	import { getContext } from "svelte";
	import type { SuperForm } from "sveltekit-superforms";

	let { ...others } = $props();
	
	const superform: SuperForm<any> = getContext("superform");
	const { message } = superform;

</script>

<span class="message" {...others}>
	{$message}
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