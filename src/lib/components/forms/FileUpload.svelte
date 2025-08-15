
<script lang="ts">

	import { getContext } from "svelte";
	import { CloudUpload, X } from "@lucide/svelte";
	
    import type { SuperForm } from "sveltekit-superforms";

	type Props = {
		field: string;
		label?: string;
	}

	let {
		field,
		label = "Click or drag files to upload",
	}: Props = $props();

	const superform: SuperForm<any> = getContext("superform");
	const { form: data, errors } = superform;

	let dropzone: HTMLLabelElement;
	let dragging = $state(false);

	let input: HTMLInputElement;
	let files: File[] = $state([]);

	$effect(() => {
		$data[field] = files;
	})

	function handleDragover(event: DragEvent) {
		event.preventDefault();
	}

	function handleDragenter(event: DragEvent) {
		event.preventDefault();
		dragging = true;
	}

	function handleDragleave(event: DragEvent) {
		event.preventDefault();
		dragging = false;
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		if (!event.dataTransfer?.files) return;
		files = [...files, ...event.dataTransfer.files]
		dragging = false;
	}

	function handleFileInput() {
		if (!input.files) return;
		files = [...files, ...input.files]
	}

	function openFile(file: File) {
		window.open(URL.createObjectURL(file), "filewin");
	}

	function deleteFile(file: File) {
		const index = files.findIndex(i => i === file);
		if (index >= 0) files.splice(index, 1);
	}

	function formatBytes(a: number, b = 2, k = 1024) {
		let d = Math.floor(Math.log(a) / Math.log(k));
		return 0 == a
			? "0 Bytes"
			: parseFloat((a / Math.pow(k, d)).toFixed(Math.max(0, b))) +
					" " +
					["Bytes", "KB", "MB", "GB", "TB"][d];
	}

	function splitExtention(filename: string) {
		const parts = filename.split('.');
  		const extension = '.' + parts.pop();
		const name = parts.join('.');
		return { name, extension };
	}

</script>

<label 
	role="region"
	class="dropzone"
	class:dragging
	ondragover={handleDragover}
	ondragenter={handleDragenter}
	ondragleave={handleDragleave}
	ondrop={handleDrop}
	bind:this={dropzone}
>

	<CloudUpload />
	{label}

	<input 
		hidden
		multiple
		type="file"
		name={field}
		oninput={handleFileInput}
		bind:this={input}
	>

	{#if $errors[field]}
		<span class="errors"> {$errors[field]} </span>
	{/if}

	{#if files.length > 0}
		<ul class="files">
			{#each files as file}
				{@const { name, extension } = splitExtention(file.name)}

				<li class="file">
					<button class="delete" onclick={() => deleteFile(file)}>
						<X />
					</button>
					<button class="info" onclick={() => openFile(file)}>
						<div class="name"> {name} </div>
						<div class="extension"> {extension} </div>
						<div class="size"> {formatBytes(file.size)} </div>
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</label>

<style lang="scss">

	@use '$lib/styles/variables' as *;
	@use '$lib/styles/themes' as *;

	.dropzone {
		display: flex;
		flex-flow: column nowrap;
		justify-content: center;
		align-items: center;

		width: 100%;
		min-height: 10rem;
		padding: 2rem;

		border-radius: $border-radius;

		cursor: pointer;
		user-select: none;
		caret-color: transparent;

		transition: all $transition;

		:global(.lucide) {
			width: $xl-font;
			height: $xl-font;
		}

		.errors {
			font-size: $s-font;
		}

		.files {
			margin-top: 1rem;
			list-style: none;

			.file {
				display: flex;
				flex-flow: row nowrap;
				justify-content: center;

				font-size: $s-font;

				.delete {
					display: flex;
					align-items: center;
					justify-content: center;
					margin-right: 0.5rem;

					cursor: pointer;

					:global(.lucide) {
						width: 1rem;
						height: 1rem;
						transition: all $transition;

						&:hover {
							rotate: 90deg;
						}
					}
				}

				.info {
					display: flex;
					flex-flow: row nowrap;

					cursor: pointer;
					transition: all $transition;

					.name {
						max-width: 8rem;
						overflow: hidden;
						white-space: nowrap;
						text-overflow: ellipsis " […]";
					}

					.size {
						margin-left: 0.5rem;
					}
				}
			}
		}
	}

	@include themed() {
		.dropzone {
			color: pick('muted');
			border: $border-width dashed pick('muted');

			&.dragging {
				color: pick('foreground');
				border: $border-width dashed pick('foreground');
			}
		}

		.errors {
			color: pick('error');
		}

		.delete :global(.lucide) {
			color: pick('foreground');
		}

		.name, .extension {
			color: pick('foreground');
		}

		.info:hover {
			.name, .extension {
				color: pick('accent');
			}
		}

		.size {
			color: pick('muted');
		}
	}

</style>