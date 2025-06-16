
<script lang="ts">

	import { loginSchema } from '$lib/schemas/authSchemas';
	import * as Form from '$lib/components/form';

	let { data } = $props();

</script>

<Form.Root 
	class="login-form"
	action="/auth/login" 
	form={data.loginForm} 
	schema={loginSchema}
>
	<h2> Login </h2>
	<div class="fields">
		<Form.Field type="text" field="email" label="Email" />
		<Form.Field type="password" field="password" label="Password" />
	</div>
	<div class="actions">
		<Form.Message class="message" />
		<Form.Submit> Login </Form.Submit>
	</div>
</Form.Root>

<style lang="scss">

	@use '$lib/styles/variables' as *;
	@use '$lib/styles/themes' as *;

	h2 {
		font-size: $xxl-font;
		font-family: 'Brittany', 'Noto Sans', sans-serif;
	}

	.fields {
		display: flex;
		flex-flow: column nowrap;
		gap: 0.5rem;
	}

	.actions {
		display: flex;
		flex-flow: row nowrap;
		align-items: center;
		gap: 1rem;
	}

	:global(.login-form) {
		display: flex;
		flex-flow: column nowrap;
		justify-content: center;

		width: 100%;
		height: 100%;
		max-width: 450px;
	}

	@include themed() {
		h2 {
			color: pick('accent');
		}
	}

</style>