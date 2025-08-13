
<script lang="ts">

    let { data } = $props();

</script>

{#if data.session}
    {#each data.session.images as image (image.id)}
        <img src="/projects/control/vault/{image.id}" alt="Session img">
    {/each}
{/if}