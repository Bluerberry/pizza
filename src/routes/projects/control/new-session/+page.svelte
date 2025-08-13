
<script lang="ts">

	import * as Form from '$lib/components/forms';
    import { newControlSchema } from '$lib/schemas/controlSchemas';

	let { data } = $props();

</script>

<Form.Root
	class="new-control-form"
	schema={newControlSchema}
	form={data.newControlForm}
>

	<div class="panel">
		<header>
			<h2> 1 </h2>
			<h2> Limits </h2>
		</header>
	</div>

	<Form.FileUpload field="files" />

	<div class="actions">
		<Form.Message class="message" />
		<Form.Submit> Lose Control </Form.Submit>
	</div>

</Form.Root>

<style lang="scss">

	@use '$lib/styles/variables' as *;
	@use '$lib/styles/themes' as *;

	:global(.new-control-form) {
		display: flex;
		flex-flow: column nowrap;
		justify-content: center;
		gap: 1rem;
	
		width: 100%;
		height: 100%;
		max-width: 450px;

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

			h2:last-of-type {
				flex: 1;
				font-size: $xl-font * 0.8;
			}
		}
	}

	@include themed() {
		.panel {
			background: pick('panel');

			header {
				color: pick('muted');
			}
		}
	}

</style>