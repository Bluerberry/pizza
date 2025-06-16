
<script lang="ts">

	import { registerSchema } from '$lib/schemas/authSchemas';
	import * as Form from '$lib/components/form';
    import Button from '$lib/components/Button.svelte';

	let { data } = $props();
	let registerSuccess = $state(true);

</script>

<div class="register">
	{#if registerSuccess}
		<h2> Just one more step... </h2>
		<p> You successfully registered! Before you can use your account, you need to verify your email. Check your inbox for a verification email. </p>
		<h3> Didn't recieve anything? </h3>
		<p> Make sure to check your spam folder! If you still can't find it, try to resend. </p>
		<Button> Resend Email </Button>
	{:else}
		<Form.Root 
			action="/auth/register" 
			form={data.registerForm} 
			schema={registerSchema}
			onSuccess={() => {
				registerSuccess = true;
			}}
			>
			<h2> Register </h2>
			<div class="fields">
				<Form.Field type="text" field="username" label="Username" />
				<Form.Field type="text" field="email" label="Email" />
				<Form.Field type="password" field="password" label="Password" />
				<Form.Field type="password" field="confirmPassword" label="Confirm Password" />
			</div>
			<div class="actions">
				<Form.Message class="message" />
				<Form.Submit> Register </Form.Submit>
			</div>
		</Form.Root>
	{/if}
</div>

<style lang="scss">

	@use '$lib/styles/variables' as *;

	.register {
		display: flex;
		flex-flow: column nowrap;
		justify-content: center;

		width: 100%;
		height: 100%;
		max-width: 450px;
	
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

		p:last-of-type {
			margin-bottom: 2rem;
		}
	}

</style>