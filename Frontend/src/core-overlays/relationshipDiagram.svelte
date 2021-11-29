<script>
    import { onMount } from 'svelte';
	import panzoom from "panzoom";

    import * as jsPlumbBrowserUI from "@jsplumb/browser-ui";
    import { FlowchartConnector } from "@jsplumb/connector-flowchart";

    onMount(() => {
		let zoomableElement = document.querySelector('.zoomable');
        panzoom(zoomableElement);

        const instance = jsPlumbBrowserUI.newInstance({
            container: document.querySelector('#diagram')
        })

        instance.addEndpoint(document.querySelector('#element1'), { endpoint:'Dot' });
        instance.addEndpoint(document.querySelector('#element2'), { endpoint:'Dot' })

        instance.connect({
            source: document.querySelector('#element1'),
            target: document.querySelector('#element2'),
            connector: {
                type: FlowchartConnector.type,
                options: {
                    alwaysRespectStubs: true,
                    cornerRadius: 5
                }
            }
        })
	});

</script>

<div class="zoomable-wrapper">
    
    <div class="zoomable" id="diagram">
        <div id="element1" class="node"> your element's content </div>
        <div id="element2" class="node"> your element's content </div>
    </div>

</div>

<style>

	.zoomable-wrapper {
        height: 100vh;
        width: 100vw;
        background: url(tile.png);
        background-blend-mode: darken;
    }

    .zoomable {
        min-height: 100vh;
        min-width: 100vw;
    }

    .node{
        position: absolute;
        width: 190px;
        height: 82px;
        left: 142px;
        top: 98px;

        background: rgba(244, 244, 244, 0.76);
        border: 1px solid #B0B0B0;
        box-sizing: border-box;
        box-shadow: 0px 0px 6px 5px rgba(191, 191, 191, 0.14);
        border-radius: 10px;
    }

</style>