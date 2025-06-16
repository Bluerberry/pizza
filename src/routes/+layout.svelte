
<script lang="ts">

	import '$lib/styles/global.scss';

	import { Navigation } from '$lib/components/navigation';
    import Button from '$lib/components/Button.svelte';
    import Toggle from '$lib/components/Toggle.svelte';
	import { theme } from '$lib/stores/theme.svelte';
    import { enhance } from '$app/forms';

	let { data, children } = $props();

	const navigation = [
		{ label: 'Home', path: '/' },
		{ label: 'About', path: '/about' },
		{ label: 'Projects', children: [
			{ label: 'Project A', path: '/projects/a' },
			{ label: 'Project B', path: '/projects/b' },
			{ label: 'Project C', path: '/projects/c' }
		]}
	]

</script>

<div class="background theme-{theme.value}">
	<div class="layout">
		<Navigation tree={navigation} />

		<main>
			{@render children()}
		</main>

		<div class="gutter">
			{#if data.user}
				<h3>Welcome {data.user.username}</h3>
				<form method="POST" action="/auth/logout" use:enhance>
					<Button type="submit" style="link">
						Logout
					</Button>
				</form>
			{:else}
				<h3>Welcome stranger</h3>
				<Button href="/auth/login" style="link">
					Login
				</Button>
				<Button href="/auth/register" style="link">
					Register
				</Button>
			{/if}

			<div class="theme-toggle">
				<Toggle active={theme.value === 'dark'} onclick={() => theme.value = theme.value === 'dark' ? 'light' : 'dark'}>
					{#if theme.value === 'dark'}
						Dark Mode
					{:else}
						Light Mode
					{/if}
				</Toggle>
			</div>
		</div>
	</div>
</div>


<style lang="scss">

	@use '$lib/styles/variables' as *;
	@use '$lib/styles/themes' as *;

	.background {
		display: flex;
		justify-content: center;
		width: 100%;
		height: 100%;

		.layout {
			display: grid;
			grid-template-columns: 1fr 4fr 1fr;
			justify-content: center;

			max-width: 1600px;
			height: 100%;
			width: 100%;
			padding: 5rem;

			main {
				display: flex;
				flex-flow: column nowrap;
				align-items: center;
				
				padding: 0 5rem;
			}

			.gutter {
				display: flex;
				flex-flow: column nowrap;

				h3 {
					padding: $input-thin-padding 0;
					margin: 0 0 1rem;
					line-height: 1rem;
				}

				.theme-toggle {
					margin-top: auto;
				}
			}
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