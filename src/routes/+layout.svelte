
<script lang="ts">

	import '$lib/styles/global.scss';
	
    import { enhance } from '$app/forms';
	import theme from '$lib/stores/theme.svelte';
	import { Permission } from '$lib/scripts/permissions';

    import Button from '$lib/components/Button.svelte';
    import Toggle from '$lib/components/Toggle.svelte';
	import { Navigation } from '$lib/components/navigation';

    import { 
		AnimatedLogin, 
		AnimatedLogout, 
		AnimatedRegister, 
		AnimatedUser 
	} from '$lib/components/anicons';

	let { data, children } = $props();

	const navigation = [
		{ label: 'Home', path: '/' },
		{ label: 'About', path: '/about' },
		{ label: 'Projects', children: [
			{ label: 'Control', path: '/projects/control', permissions: Permission.VerifiedAdmin },
			{ label: 'Shuffle', path: '/projects/shuffle' },
			{ label: 'Pizza', path: '/projects/pizza' }
		]},
		{ label: 'Admin Panel', path: '/admin', permissions: Permission.VerifiedAdmin },
	]

</script>

<div class="background theme-{theme.value}">
	<div class="layout">
		<div class="gutter">
			{@render account()}
			<Navigation tree={navigation} permissions={data.permissions} />
			{@render themeToggle()}
		</div>

		<main>
			{@render children()}
		</main>
	</div>
</div>

{#snippet account()}
	<div class="account">
		{#if data.user}
			<h3>Welcome {data.user.username}</h3>
			<Button href="/account" style="link">
				<AnimatedUser /> Account
			</Button>
			<form method="POST" action="/auth/logout" use:enhance>
				<Button type="submit" style="link">
					<AnimatedLogout /> Logout
				</Button>
			</form>
		{:else}
			<h3>Welcome stranger</h3>
			<Button href="/auth/register" style="link">
				<AnimatedRegister /> Register
			</Button>
			<Button href="/auth/login" style="link">
				<AnimatedLogin /> Login
			</Button>
		{/if}
	</div>
{/snippet}

{#snippet themeToggle()}
	<div class="theme-toggle">
		<Toggle active={theme.value === 'dark'} onclick={() => theme.value = theme.value === 'dark' ? 'light' : 'dark'}>
			{#if theme.value === 'dark'}
				Dark Mode
			{:else}
				Light Mode
			{/if}
		</Toggle>
	</div>
{/snippet}

<style lang="scss">

	@use '$lib/styles/variables' as *;
	@use '$lib/styles/themes' as *;

	.background {
		width: 100%;
		height: 100%;
	}

	.layout {
		display: flex;
		flex-flow: row nowrap;

		width: 100%;
		height: 100%;
		max-width: 1600px;
		margin: 0 auto;
		padding: 3rem;
	}

	main {
		display: flex;
		flex-flow: column nowrap;
		align-items: center;

		width: 100%;
		padding: 0 5rem;
	}

	.gutter {
		display: flex;
		flex-flow: column nowrap;
		gap: 1rem;

		height: 100%;
		min-width: 12rem;

		h3 {
			margin: 0 0 1rem;
			padding: $input-thin-padding 0;
			line-height: 1rem;
		}

		.account {
			display: flex;
			flex-flow: column nowrap;
		}

		.theme-toggle {
			margin-top: auto;
		}

		// Annoying little fix for the logout button
		:global(form button) {
			width: 100%;
		}
	}

	@include themed() {
		& {
			color: pick('foreground');
			background-color: pick('background');
		}

		.gutter h3 {
			border-bottom: $border-width solid pick('foreground');
		}
	}

</style>