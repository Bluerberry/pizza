
<script lang="ts">

	import { X } from "@lucide/svelte";

	let { 
		header,
		footer,
		children,
		show = $bindable(false)
	} = $props();

	let dialog: HTMLDialogElement;

	$effect(() => {
		if (show) dialog.showModal();
		else dialog.close();
	})

</script>

<dialog bind:this={dialog}>
	<button type="button" onclick={ () => show = false }> 
		<X />
	</button>

	<h3 class="header"> {@render header()} </h3>
	<div class="body"> {@render children()} </div>
	<div class="footer"> {@render footer()} </div>
</dialog>

<style lang="scss">

	@use '$lib/styles/variables' as *;
	@use '$lib/styles/themes' as *;

	dialog {
		position: fixed;
		translate: -50% -50%;
		top: 50%;
		left: 50%;

		padding: 1rem;

		border-radius: $border-radius;

		&::backdrop {
			opacity: 50%;
		}
	}

	button {
		position: absolute;
		right: 1rem;

		:global(.lucide) {
			transition: all $transition;
		}
	}

	.header, .body {
		margin-bottom: 1rem;
		padding-right: 3rem;
	}

	.footer {
		display: flex;
		flex-flow: row nowrap;
		justify-content: flex-end;
		align-items: center;
		gap: 1rem;
	}

	@include themed() {
		dialog {
			background: pick('background');
			color: pick('foreground');

			&::backdrop {
				background: pick('muted');
			}
		}

		button {
			:global(.lucide) {
				color: pick('muted');
			}

			&:hover :global(.lucide) {
				color: pick('foreground');
			}
		}
	}

</style>