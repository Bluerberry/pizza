
<script lang="ts">

	import { getContext } from "svelte";
    import Dropdown from "$lib/components/Dropdown.svelte";

	import type { SuperForm } from "sveltekit-superforms";

	// Types
	type Option = {
		label?: string;
		value: any;
	}

	// Props
	type Props = {
        field: string;
		label?: string;
		options: Option[];
		value?: any | null;
		placeholder?: string;
	}

	let {
        field,
		label,
		options,
		value = $bindable(null),
		placeholder = 'Select an option'
	}: Props = $props()

	const superform: SuperForm<any> = getContext("superform");
	const { form: data, errors } = superform;

    $effect(() => {
        $data[field] = value;
    })

</script>

<Dropdown {label} {options} {placeholder} bind:value errors={$errors[field]} />