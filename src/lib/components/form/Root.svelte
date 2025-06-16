
<script lang="ts">
	import {  setContext } from "svelte";
	import { superForm } from "sveltekit-superforms";
	import { zod } from "sveltekit-superforms/adapters";

	import type { SuperValidated, FormOptions } from "sveltekit-superforms";
	import type { Snippet } from "svelte";

	type Props = {
		action: string;
		form: SuperValidated<any>;
		schema: any;
		children: Snippet;
		onSubmit?: FormOptions["onSubmit"];
		onResult?: FormOptions["onResult"];
		onSuccess?: FormOptions["onResult"];
		onFailure?: FormOptions["onResult"];
		onUpdate?: FormOptions["onUpdate"];
		onUpdated?: FormOptions["onUpdated"];
		onChange?: FormOptions["onChange"];
		onError?: FormOptions["onError"];
		[key: string]: any;
	};

	let {
		action,
		form,
		schema,
		children,
		onSubmit = () => {},
		onResult = () => {},
		onSuccess = () => {},
		onFailure = () => {},
		onUpdate = () => {},
		onUpdated = () => {},
		onChange = () => {},
		onError = () => {},
		...others
	}: Props = $props();

	const handleOnResult: FormOptions["onResult"] = (event) => {
		onResult(event);
		if (event.result.type === "success") {
			onSuccess(event);
		} else if (event.result.type === "failure") {
			onFailure(event);
		} 
	}

	const {
		enhance,
		submitting,
		form: formData,
		errors: formErrors,
		message: formMessage
	} = superForm(form, {
		validators: zod(schema),
		onSubmit,
		onResult: handleOnResult,
		onUpdate,
		onUpdated,
		onChange,
		onError
	});

	setContext("formData", formData);
	setContext("formErrors", formErrors);
	setContext("formMessage", formMessage);
	setContext("submitting", submitting);

</script>

<form method="POST" {action} {...others} use:enhance>
	{@render children()}
</form>