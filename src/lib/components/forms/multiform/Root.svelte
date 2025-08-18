
<script lang="ts">

    import { setContext, type Snippet } from "svelte";

    type Step = {
        schema: any;
        snippet: Snippet;
        active:
    }

    let steps: Step[] = $state([]);
    setContext('register', (step: Step) => {
        steps.push(step);
    }) 

</script>