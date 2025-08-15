<script lang="ts">

	// Imports
    import { slide } from 'svelte/transition';
	import { clickoutside } from '$lib/scripts/actions';
	import { ChevronRight, Search } from '@lucide/svelte';

	// Types
	type Option = {
		label?: string;
		value: any;
	}

	// Props
	type Props = {
		label?: string;
		options: Option[];
		errors?: any;
		value?: any | null;
		placeholder?: string;
	}

	let {
		label,
		options,
		errors,
		value = $bindable(null),
		placeholder = 'Select an option'
	}: Props = $props()

	// Variables
	const slideDuration = 200;

	let query = $state('');
	let open = $state(false);
	let delayedOpen = $state(false); // During the slide transition, we want the dropdown to be styled as if it were open
	let styleTimeout: NodeJS.Timeout;

	// Reactivity
	let selected = $derived<Option | null>(
		options.find(option => option.value === value ) || null
	);

	let filtered_options = $derived(
		options.filter(option => {
			if (query === '') return true;
			return option.label?.toLowerCase().includes(query.toLowerCase());
		})
	);

	// Functions
	function setOpen(value: boolean) {
		open = value;
		clearTimeout(styleTimeout);

		if (value) {
			delayedOpen = true;
		} else {
			styleTimeout = setTimeout(() => delayedOpen = false, slideDuration);
			query = '';
		}
	}

	function setValue(new_value: any | null) {
		value = new_value;
		setOpen(false);
	}

</script>

<div class="dropdown">
	<div 
		class="wrapper" 
		class:delayedOpen
		use:clickoutside={ () => setOpen(false) }
	>
		{#if label}
			<span class="label">
				{label}
			</span>
		{/if}

		<button 
			type="button"
			class="header"
			class:open 
			class:grayed={ !selected }
			class:dashed={ options.length >= 5 }
			onclick={ () => setOpen(!open) }
		>
			<span class="selected">
				{#if selected?.label}
					{ selected.label }
				{:else if selected}
					<i> Unnamed option </i>
				{:else}
					{ placeholder }
				{/if}
			</span>

			{#if errors}
				<span class="error">
					{ errors }
				</span>
			{/if}

			<ChevronRight />
		</button>

		{#if open}	
			<div transition:slide={{ duration: slideDuration }}>

				{#if options.length >= 5}
					<div class="search">
						<input
							type="text"
							placeholder="Search"
							bind:value={ query }
						/>

						<Search />
					</div>
				{/if}

				<div class="options">
					{#if options.length === 0}
						<button disabled class="option">
							<i> No options available </i>
						</button>
					{:else}
						{#each filtered_options as option}
							{@render renderOption(option)}
						{/each}

						{#if filtered_options.length === 0}
							<button disabled class="option">
								<i> No results found </i>
							</button>
						{/if}

						{#if selected !== null}
							<button
								type="button"
								class="option"
								onclick={ () => setValue(null) }
							>
								<i> Remove choice </i>
							</button>
						{/if}
					{/if}
				</div>
			</div>
		{/if}
	</div>
</div>

{#snippet renderOption(option: Option)}
	<button 
		type="button" 
		class="option" 
		onclick={ () => setValue(option.value) }
	>
		{#if option.label}
			{ option.label }
		{:else}
			<i> Unnamed option </i>
		{/if}
	</button>
{/snippet}

<style lang="scss">

	@use '$lib/styles/variables' as *;
	@use '$lib/styles/themes' as *;

	// 1.1875 is linehight for medium fonts, I know I know this is not what one would call robust
	$dropdown-height: calc( 1.1875rem + 2 * $input-thin-padding + 2 * $border-width );

	.dropdown {
		position: relative;

		width: 100%;
		min-width: $input-thick-padding + 2 * $icon-padding + $icon-size;
		height: $dropdown-height;

		.wrapper {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;

			border-radius: $border-radius;

			&.delayedOpen {
				z-index: 1;

				.label {
					z-index: 2;
				}

				.header {
					border-radius: $border-radius $border-radius 0 0;
				}
			}

			.label {
				position: absolute;
				z-index: 1;
				top: calc( -0.5 * $s-font - $border-width );
				left: 10px;

				padding: 0 0.75rem;
				font-size: $s-font;
			}

			.header {
				display: flex;
				flex-flow: row nowrap;
				align-items: center;
				gap: $icon-padding;

				width: 100%;
				padding: $input-thin-padding $input-thick-padding;

				border-radius: $border-radius;

				& > * {
					pointer-events: none;
				}

				.selected {
					flex: 1;

					overflow: hidden;
					white-space: nowrap;
					text-overflow: ellipsis;

					text-align: left;
					font-size: $m-font;
				}

				.error{
					font-size: $s-font;
				}

				:global(.lucide) {
					width: $icon-size;
					height: $icon-size;
					transition: rotate $transition;
				}

				&.open :global(.lucide) {
					rotate: 90deg;
				}
			}

			.search {
				position: relative;

				input {
					width: 100%;
					padding: $input-thin-padding $input-thick-padding;
					padding-right: 2 * $icon-padding + $icon-size;

					text-align: left;
					font-size: $m-font;
				}

				:global(.lucide) {
					position: absolute;
					translate: 0 -50%;
					right: $icon-padding;
					top: 50%;

					width: $icon-size;
					height: $icon-size;

					pointer-events: none;
					transition: rotate $transition;
				}
			}

			.options {
				width: 100%;
				max-height: 15rem;
				overflow: auto;
				border-radius: 0 0 $border-radius $border-radius;

				.option {
					width: 100%;
					padding: $input-thin-padding $input-thick-padding;

					text-align: left;
					font-size: $m-font;
					
					cursor: pointer;

					&:last-child {
						border-radius: 0 0 $border-radius $border-radius
					}
				}
			}
		}
	}

	@include themed() {
		.wrapper {
			background: pick('background');
			border: $border-width solid pick('foreground');

			.label {
				background: pick('background');
			}

			.header {
				.selected {
					color: pick('foreground');
				}

				&.grayed .selected {
					color: pick('muted');
				}

				.error {
					color: pick('error');
				}

				:global(.lucide) {
					color: pick('foreground');
				}
			}

			&.delayedOpen .header {
				border-bottom: 1px solid pick('muted');

				&.dashed {
					border-bottom-style: dashed;
				}
			}

			.search input {
				color: pick('foreground');
				border-bottom: 1px solid pick('muted');

				&::placeholder {
					color: pick('muted');
				}
			}

			.options .option {
				color: pick('foreground');

				i {
					color: pick('muted');
				}

				&:not(:disabled):hover {
					color: pick('accent');
				}

				&:not(:last-child) {
					border-bottom: 1px dashed pick('muted');
				}
			}
		}
	}

</style>
