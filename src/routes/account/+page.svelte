
<script lang="ts">

	import { slide } from 'svelte/transition';
    import { changeUsernameSchema, changeEmailSchema, changePasswordSchema } from '$lib/schemas/authSchemas.js';

	import * as Form from '$lib/components/forms';
	import Button from '$lib/components/Button.svelte';

    import { Crown, ShieldCheck, ShieldQuestion } from '@lucide/svelte';
    import { UserRole } from '@prisma/client';

	let { data } = $props();

	type AccordionType = null | 'username' | 'email' | 'password'
	let accordion: AccordionType = $state(null);

	function setAccordion(value: AccordionType) {
		accordion = accordion === value ? null : value
	}

</script>

<div>
	<h1>Account Settings</h1>

	<section>
		<h3> Personalia </h3>
		<div class="personalia-grid">

			<!-- Username -->
			<span class="title"> Username </span>
			
			{#if data.user?.role === UserRole.ADMIN}
				<span> {data.user?.username} </span>
				<span class="verified"> <Crown /> Admin </span>
			{:else}
				<span class="colspan-2"> {data.user?.username} </span>
			{/if}

			<div class="actions">
				<Button style="underline" onclick={ () => setAccordion('username') }>
					change
				</Button>
			</div>

			{#if accordion === 'username'}
				<div class="accordion colspan-full" transition:slide={{ duration: 200 }}>
					<Form.Root 
						action="?/change-username" 
						form={data.changeUsernameForm} 
						schema={changeUsernameSchema}
						confirm={true}
					>
						<div class="fields">
							<Form.Field
								type="text"
								field="username"
								label="New Username"
							/>
						</div>

						<div class="form-actions">
							<Form.Submit> Update </Form.Submit>
							<Form.Message />
						</div>

						{#snippet confirmation()}
							This will publicly update your username accross the site. Are you sure you want to continue?
						{/snippet}
					</Form.Root>
				</div>
			{/if}

			<!-- Email -->
			<span class="title"> Email </span>
			<span> {data.user?.email} </span>

			{#if data.user?.verified}
				<span class="verified"> 
					<ShieldCheck />
					verified 
				</span>
			{:else}
				<span class="unverified"> 
					<ShieldQuestion />
					unverified 
				</span>
			{/if}

			<div class="actions">
				{#if data.user?.verified === false}
					<Button style="underline" href='/auth/verify'> verify </Button>
				{/if}

				<Button style="underline" onclick={ () => setAccordion('email') }>
					change
				</Button>
			</div>

			{#if accordion === 'email'}
				<div class="accordion colspan-full" transition:slide={{ duration: 200 }}>
					<Form.Root 
						action="?/change-email" 
						form={data.changeEmailForm} 
						schema={changeEmailSchema}
						confirm={true}
					>
						<div class="fields">
							<Form.Field
								type="text"
								field="email"
								label="New Email"
							/>
							
							<Form.Field
								type="password"
								field="password"
								label="Password"
							/>
						</div>	
						
						<div class="form-actions">
							<Form.Submit> Update </Form.Submit>
							<Form.Message />
						</div>

						{#snippet confirmation()}
							Until you verify your new email, <b>you will lose access to most of your account.</b>
							Are you sure you want to continue?
						{/snippet}
					</Form.Root>
				</div>
			{/if}

			<!-- Password -->
			<span class="title"> Password </span>
			<span class="colspan-2"> •••••••• </span>
			<div class="actions">
				<Button style="underline">
					recover
				</Button>
				<Button style="underline" onclick={ () => setAccordion('password') }>
					change
				</Button>
			</div>

			{#if accordion === 'password'}
				<div class="accordion colspan-full" transition:slide={{ duration: 200 }}>
					<Form.Root 
						action="?/change-password" 
						schema={changePasswordSchema}
						form={data.changePasswordForm} 
						confirm={true}
					>
						<div class="fields">
							<Form.Field
								type="password"
								field="oldPassword"
								label="Current Password"
							/>
							
							<Form.Field
								type="password"
								field="newPassword"
								label="New Password"
							/>

							<Form.Field
								type="password"
								field="confirmPassword"
								label="Confirm New Password"
							/>
						</div>	
						
						<div class="form-actions">
							<Form.Submit> Update </Form.Submit>
							<Form.Message />
						</div>

						{#snippet confirmation()}
							This will immediately change your password. Are you sure you want to continue?
						{/snippet}
					</Form.Root>
				</div>
			{/if}
		</div>
	</section>
</div>

<style lang="scss">

	@use '$lib/styles/variables' as *;
	@use '$lib/styles/themes' as *;
	@use 'sass:math';

	h1 {
		font-size: $xxl-font;
		font-family: $stylized-fontstack;
	}

	.personalia-grid {
		display: grid;
		grid-template: auto / auto 1fr 1fr auto;
		column-gap: 2rem;
		row-gap: 0.5rem;

		span {
			display: flex;
			align-items: center;

			:global(.lucide) {
				width: $icon-size;
				height: $icon-size;
				margin-right: $icon-padding;
			}
		}

		.actions {
			display: flex;
			flex-flow: row nowrap;
			justify-content: end;

			width: 100%;
		}

		.accordion {
			padding: 1rem 1rem 2rem 2rem;
			margin-left: $icon-padding + math.div($icon-size, 2);

			.fields {
				display: flex;
				flex-flow: column nowrap;
				gap: 0.5rem;
			}

			.form-actions {
				display: flex;
				flex-flow: row nowrap;
				align-items: center;
				gap: 1rem;

				margin-top: 1rem;
			}
		}

		.colspan-2 {
			grid-column-end: span 2;
		}

		.colspan-full {
			grid-column-end: span 4;
		}
	}

	@include themed() {
		h1, b {
			color: pick('accent');
		}

		.title {
			color: pick('muted');
		}

		.verified {
			color: pick('success');
		}

		.unverified {
			color: pick('error');
		}

		.accordion {
			border-left: 1px solid pick('muted');
		}
	}

</style>