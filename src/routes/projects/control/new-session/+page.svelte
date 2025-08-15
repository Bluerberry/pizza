
<script lang="ts">

	import Dropdown from '$lib/components/Dropdown.svelte';
	import * as Form from '$lib/components/forms';
    import { newControlSchema } from '$lib/schemas/controlSchemas';

	let { data } = $props();

	let maxReleaseType = $state('date');

</script>

<div>
	<h1> Control Session </h1>
	<p>
		Welcome to your new <b>Control session</b>. Choose how you want to play, and commit. Remember, you're here for your own pleasure, so don't pussy out.
	</p>

	<Form.Root
		class="new-control-form"
		schema={newControlSchema}
		form={data.newControlForm}
	>
	
		<section class="panel">
			<header>
				<h2> 1 </h2>
				<h2> Limits </h2>
			</header>
		
			<Dropdown
				bind:value={maxReleaseType}
				label="Maximum lockup"
				options={[
					{ label: 'Date',     value: 'date' },
					{ label: 'Duration', value: 'time' },
					{ label: 'No Limit', value: 'none' }
				]}
			/>
		</section>
	
		<Form.FileUpload field="files" />
	
		<div class="actions">
			<Form.Message class="message" />
			<Form.Submit> Lose Control </Form.Submit>
		</div>
	
	</Form.Root>
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

	.panel {
		width: 100%;
		padding: 1rem;
		border-radius: $border-radius;

		header {
			display: flex;
			flex-flow: row nowrap;
			align-items: center;
			gap: 0.7rem;

			margin-bottom: 2rem;

			h2:last-of-type {
				flex: 1;
				font-size: $xl-font * 0.8;
			}
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