
<script lang="ts">

	import { getContext } from 'svelte';
	import Button from '$lib/components/Button.svelte';

	import type { Snippet } from 'svelte';
	import type { SuperForm } from 'sveltekit-superforms';

	type Props = {
		children: Snippet;
		[key: string]: any;
	};

	let {
		children,
		...others
	}: Props = $props();

	const superform: SuperForm<any> = getContext("superform");
	const { submitting } = superform;

</script>

<Button type="submit" loading={$submitting} {...others}>
	{@render children()}
</Button>