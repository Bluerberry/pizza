
<script lang="ts">

	import { setContext } from 'svelte';
	import { superForm } from 'sveltekit-superforms';
	import { zod } from 'sveltekit-superforms/adapters';

	import Modal from '$lib/components/Modal.svelte';
	import Button from '$lib/components/Button.svelte';

	import type { Snippet } from 'svelte';
	import type { SuperValidated } from 'sveltekit-superforms';

	type Props = {
		children: Snippet;
		schema: any;
		action?: string;
		confirm?: boolean;
		confirmation?: Snippet;
		form: SuperValidated<any>;
		[key: string]: any;
	};

	let {
		form,
		schema,
		action,
		children,
		confirmation,
		confirm = false,
		...others
	}: Props = $props();

	let confirmed = $state(false);

	const superform = superForm(form, {
		validators: zod(schema),
		onSubmit: async ({ cancel }) => {
			if (confirm && !confirmed) {
				const result = await validateForm();
				if (result.valid) {
					confirmed = true;
					cancel();
				}
			} else {
				confirmed = false;
			}
		}
	});

	const { submitting, validateForm } = superform;
	setContext('superform', superform)

</script>

<form 
	method="POST" 
	enctype="multipart/form-data"
	{action} 
	{...others} 
	use:superform.enhance
>
	<Modal bind:show={confirmed}>
		{#snippet header()}
			Are you sure about that?
		{/snippet}
		
		{#if confirmation}
			{@render confirmation()}
		{/if}
		
		{#snippet footer()}
			<Button style="underline" onclick={ () => confirmed = false }>
				Cancel
			</Button>
			<Button autofocus type="submit" loading={$submitting}>
				Confirm
			</Button>
		{/snippet}
	</Modal>

	{@render children()}
</form>
