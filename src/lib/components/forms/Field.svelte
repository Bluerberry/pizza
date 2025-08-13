
<script lang="ts">

	import { getContext } from "svelte";
	import { Eye, EyeOff } from "@lucide/svelte";

	import type { SuperForm } from "sveltekit-superforms";

	type Props = {
		type: 'text' | 'password';
		field: string;
		label?: string;
		[key: string]: any;
	}

	let {
		type,
		label,
		field,
		...others
	}: Props = $props();

	const superform: SuperForm<any> = getContext("superform");
	const { form: data, errors } = superform;

	const fieldID = `${field}-${crypto.randomUUID()}`;
	let showPassword = $state(false);

</script>

<div class="field">
    {#if label}
		<label for={fieldID}>
			{label}
		</label>
	{/if}

    <div class="wrapper">
        <input
			id={fieldID}
			name={field}
			type={type === 'password' && showPassword ? 'text' : type}
			bind:value={$data[field]}
			{...others}
		/>

        {#if $errors[field]}
			<span class="error">
				{$errors[field]}
			</span>
		{/if}
    </div>

    {#if type === 'password'}
		<button type="button" onclick={() => showPassword = !showPassword}>
			{#if showPassword}
				<EyeOff />
			{:else}
				<Eye />
			{/if}
		</button>
	{/if}
</div>

<style lang="scss">

	@use '$lib/styles/variables' as *;
	@use '$lib/styles/themes' as *;
	@use 'sass:math';

	.field {
		position: relative;

		width: 100%;
		margin-top: calc( 0.5 * ($s-font + $border-width) );
		border-radius: $border-radius;

		&:has(button) .wrapper {
			padding-right: calc( 2 * $input-thin-padding + $icon-size )
		}
	}

    label {
		position: absolute;
		z-index: 1;
		top: calc( -0.5 * $s-font - $border-width );
		left: 10px;

		padding: 0 0.75rem;
		font-size: $s-font;
	}

	.wrapper {
		display: flex;
		flex-flow: row nowrap;
		align-items: center;
		gap: 0.5rem;

		padding: $input-thin-padding $input-thick-padding;
	}

	input {
		flex: 1;
		font-size: $m-font;
	}

	.error {
		font-size: $xs-font;
	}

	button {
        position: absolute;
		translate: 0 -50%;
		top: 50%;
		right: calc( $input-thick-padding - $icon-padding );
        
		display: flex;
		align-items: center;
		justify-content: center;

        padding: $icon-padding;
		border-radius: $border-radius;

		cursor: pointer;

		:global(.lucide) {
			width: $icon-size;
		}
	}

	@include themed() {

		.field {
			border: $border-width solid pick('foreground');
		}

		label {
			background: pick('background');
		}

		input {
			color: pick('foreground');
		}

		.error {
			color: pick('error');
		}

		button {
			&:focus {
				outline: 2px solid pick('accent');
			}

			:global(.lucide) {
				color: pick('foreground');
			}
		}
	}

</style>
