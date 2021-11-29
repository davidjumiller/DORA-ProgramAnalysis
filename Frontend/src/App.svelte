<script>
	import RelDiagram from "./core-overlays/relationshipDiagram.svelte";
	export let name;
</script>

<main>
	<RelDiagram/>
</main>

<style>
	main {
		position: relative;

		height: 100%;
		width: 100%;
		padding: 0 !important;
	}
</style>