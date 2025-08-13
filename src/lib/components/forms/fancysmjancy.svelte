
<script lang="ts">

	import { Trash } from "@lucide/svelte";

	let dropzone: HTMLDivElement;
	let input: HTMLInputElement;
	let files: any[] = $state([]);

	function handleDragover(event: DragEvent){
		event.preventDefault();
	}

	function handleDragenter(event: DragEvent){
		event.preventDefault();
		dropzone.classList.add("dragging");
	}

	function handleDragleave(event: DragEvent){
		event.preventDefault();
		dropzone.classList.remove("dragging");
	}

	function handleDrop(event: DragEvent){
		event.preventDefault();
		dropzone.classList.remove("dragging");
		files.concat(event.dataTransfer?.files)
	}

	function handleFileInput() {
		files.push(input.files)
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

</script>

<div
	role="region"
	class="dropzone"
	ondragenter={handleDragenter}
	ondragleave={handleDragleave}
	ondragover={handleDragover}
	ondrop={handleDrop}
	bind:this={dropzone}
>
	<label>
		Upload File

		<input hidden
			type="file"
			onchange={handleFileInput}
			bind:this={input}
		>
	</label>

	<ul class="files">
		{#each files as file}
			<li class="file">
				<button class="delete" onclick={() => deleteFile(file)}>
					<Trash />
				</button>
				<button onclick={() => openFile(file)}>
					<span class="filename"> {file.name} </span>
					<span class="filesize"> {formatBytes(file.size)} </span>
				</button>
			</li>
		{/each}
	</ul>
</div>