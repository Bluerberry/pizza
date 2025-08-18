
<script lang="ts">

    import { getContext, type Snippet } from "svelte";

    type Props = {
        schema: any;
        children: Snippet;
    }

    let {
        schema,
        children: snippet
    }: Props = $props();

    const register: (step: any) => void = getContext('register');
    register({
        schema,
        snippet
    })

</script>