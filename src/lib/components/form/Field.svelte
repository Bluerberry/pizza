
<script lang="ts">

	import { Eye, EyeOff } from "@lucide/svelte";
	import { getContext } from "svelte";

	import type {
		SuperFormData,
		SuperFormErrors
	} from "sveltekit-superforms/client";

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

	const formData: SuperFormData<any> = getContext("formData");
	const formErrors: SuperFormErrors<any> = getContext("formErrors");

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
			autocomplete="off"
			type={type === 'password' && showPassword ? 'text' : type}
			bind:value={$formData[field]}
			{...others}
		/>

		{#if type === 'password'}
			<button
				type="button"
				class="toggle-password"
				onclick={() => showPassword = !showPassword}
			>
				{#if showPassword}
					<EyeOff />
				{:else}
					<Eye />
				{/if}
			</button>
		{/if}
	</div>

	{#if $formErrors[field]}
		<span class="error">
			{$formErrors[field]}
		</span>
	{/if}
</div>

<style lang="scss">

	@use '$lib/styles/variables' as *;
	@use '$lib/styles/themes' as *;
	@use 'sass:math';

	.field {
		position: relative;

		width: 100%;
		padding-top: math.div($s-font, 2);
		padding-bottom: $xs-font * 1.5;
	}

	label {
		position: absolute;
		z-index: 1;
		top: 0;
		left: 10px;

		padding: 0 0.75rem;
		font-size: $s-font;
	}

	.wrapper {
		position: relative;
	}

	input {
		width: 100%;
		padding: $input-thin-padding $input-thick-padding;

		outline: none;
		border-radius: $border-radius;

		font-size: $m-font;
		background: transparent;
	}

	button {
		position: absolute;
		top: 50%;
		right: $input-thin-padding;
		translate: 0 -50%;

		display: flex;
		align-items: center;
		justify-content: center;

		outline: none;
		border: none;

		cursor: pointer;
		background: transparent;
	}

	.error {
		position: absolute;
		bottom: 0;
		left: calc( $input-thick-padding + $border-width );

		font-size: $xs-font;
	}

	@include themed() {
		label {
			background: pick('background');
		}

		input {
			color: pick('foreground');
			border: $border-width solid pick('foreground');
		}

		.error {
			color: pick('error');
		}

		.field :global(.lucide) {
			color: pick('foreground');
		}
	}

</style>