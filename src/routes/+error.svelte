
<script lang="ts">

	import { page } from '$app/state';

</script>

<div class="error">
	<h1>{page.status}</h1>
	<p>{page.error?.message}</p>
</div>

<style lang="scss">

	@use '$lib/styles/variables' as *;

	.error {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;

		width: 100%;
		height: 100%;

		h1 {
			margin: 0;
			font-size: $xl-font;
		}

		p {
			margin: 0;
			font-size: $l-font;
		}
	}

</style>