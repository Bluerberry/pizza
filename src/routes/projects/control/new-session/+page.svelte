
<script lang="ts">

	import {
		NCSLimitsSchema,
		NCSBehaviourSchema
	} from '$lib/schemas/controlSchemas';

	let steps = [
		
	];

	const { form, errors, message, enhance, validateForm, options } = superForm(data.form, {
		// No need for hidden fields with dataType: 'json'
		dataType: 'json',
		async onSubmit({ cancel }) {
			// If on last step, make a normal request
			if (step == steps.length) return;
			else cancel();

			// Make a manual client-side validation, since we have cancelled
			const result = await validateForm({ update: true });
			if (result.valid) step = step + 1;
		},

		async onUpdated({ form }) {
			if (form.valid) step = 1;
		}
	});

</script>

<div>
	<h1> Control Session </h1>
	<p>
		Welcome to your new <b>Control session</b>. Choose how you want to play, and commit. Remember, you're here for your own pleasure, so don't pussy out.
	</p>

	

</div>

<style lang="scss">

	@use '$lib/styles/variables' as *;
	@use '$lib/styles/themes' as *;

	h1 {
		font-size: $xxl-font;
		font-family: $stylized-fontstack;
	}

	p {
		margin: 0.5rem 3rem 3rem 1.5rem;
		padding-left: 1.5rem;
		text-align: justify;
	}

	:global(.new-control-form) {
		display: flex;
		flex-flow: column nowrap;
		gap: 1rem;
	
		width: 100%;

		.actions {
			display: flex;
			flex-flow: row nowrap;
			align-items: center;
			gap: 1rem;

			margin-top: 1rem;
		}
	}

	@include themed() {
		h1 {
			color: pick('accent');
		}

		p {
			border-left: $border-width solid pick('muted');
		}

		.panel {
			border: 2px solid pick('muted');

			header {
				color: pick('muted');
			}
		}
	}

</style>