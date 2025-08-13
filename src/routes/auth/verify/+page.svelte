<script lang="ts">
	
	import { onDestroy } from 'svelte';
	import { enhance } from '$app/forms';
	import Button from '$lib/components/Button.svelte';

	let { data } = $props();

	let interval: ReturnType<typeof setInterval>;
	let now = $state(Date.now());

	interval = setInterval(() => {
		now = Date.now();
	}, 1000);

	onDestroy(() => {
		clearInterval(interval);
	});

	let timedOut = $derived(
		!!data.nextAllowedRequest && 
		now < data.nextAllowedRequest
	);

	let timeLeft = $derived.by(() => {
		if (!data.nextAllowedRequest) return '';
		const remaining = Math.ceil((data.nextAllowedRequest - now) / 1000);
		const minutes = Math.floor(remaining / 60);
		const seconds = remaining % 60;

		return `${minutes > 0 ? minutes + ' min ' : ''}${seconds} sec`
	});

</script>

<form method="POST" action="/auth/verify" use:enhance>
	<h2> Just one more step... </h2>
	<p> Before you can use your account, you need to verify your email. Check your inbox for a verification email. </p>
	<h3> Didn't receive anything? </h3>
	<p> Make sure to check your spam folder! If you still can't find it, try to resend. </p>

	<Button type="submit" disabled={timedOut}> 
		{#if timedOut}
			Wait {timeLeft}
		{:else}
			Resend Email 
		{/if}
	</Button>
</form>

<style lang="scss">

	form {
		display: flex;
		flex-flow: column nowrap;
		justify-content: center;
		align-items: flex-start;

		width: 100%;
		height: 100%;
		max-width: 450px;

		p {
			margin-bottom: 1rem;

			&:last-of-type {
				margin-bottom: 2rem;
			}
		}
	}

</style>