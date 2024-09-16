<script lang="ts">
	import { page } from '$app/stores';
</script>

{#if $page.error}
	<main>
		<h1><pre>Error &lt;{$page.status}&gt;</pre></h1>
		<p>{$page.error.message}</p>
	</main>
{/if}

<style>
	main {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100svh;
		text-align: center;
		background: #ff5050;
        flex-direction: column;
        padding-bottom: 10%;
    }

    h1 {
        font-size: 4em;
        color: #ffffff;
        margin: 0;
    }
    
    p {
        font-size: 1.5em;
        color: #2c2c2c;
        font-weight: bold;
        margin: 0;
    }
</style>
