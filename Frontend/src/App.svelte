<script>
	import RelDiagram from "./core-overlays/relationshipDiagram.svelte";
	export let name;
</script>

<main>
	<RelDiagram/>
</main>

<style>

@import "https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma-rtl.min.css";

	main {
		position: relative;

		height: 100%;
		width: 100%;
		padding: 0 !important;
	}
	
</style>