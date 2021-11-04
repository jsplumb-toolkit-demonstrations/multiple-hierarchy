import {
    EVENT_CANVAS_CLICK, EVENT_SURFACE_MODE_CHANGED,
    EVENT_TAP, SurfaceMode,
    BlankEndpoint, DotEndpoint,
    AnchorLocations,
    newInstance,
    ready
} from "@jsplumbtoolkit/browser-ui-vanilla"

import {HierarchicalLayout} from "@jsplumbtoolkit/layout-hierarchical"
import { StateMachineConnector } from "@jsplumb/connector-bezier"
import {randomHierarchy, randomNode} from "jsplumbtoolkit-demo-support"
import { LassoPlugin } from "@jsplumbtoolkit/browser-ui-plugin-lasso"
import { MiniviewPlugin } from "@jsplumbtoolkit/browser-ui-plugin-miniview"

import {ObjectInfo, Node} from "@jsplumbtoolkit/core"

ready(function () {

    // get a new jsPlumb Toolkit instance to use.
    const toolkit = newInstance({
        beforeStartDetach:() => { return false }
    })

    const mainElement = document.querySelector("#jtk-demo-multiple-hierarchy"),
        canvasElement = mainElement.querySelector(".jtk-demo-canvas"),
        miniviewElement = mainElement.querySelector(".miniview"),
        controls = document.querySelector(".controls")

    // render the data using a hierarchical layout
    const renderer = toolkit.render(canvasElement, {
        consumeRightClick: false,
        layout: {
            type: HierarchicalLayout.type,
            options: {
                orientation: "horizontal",
                padding: {x:60, y:60}
            }
        },
        events: {
            [EVENT_CANVAS_CLICK]: (e:Event) => {
                toolkit.clearSelection()
            },
            [EVENT_SURFACE_MODE_CHANGED]: (mode:SurfaceMode) => {
                renderer.removeClass(controls.querySelectorAll("[mode]"), "selected-mode")
                renderer.addClass(controls.querySelectorAll("[mode='" + mode + "']"), "selected-mode")
            }
        },
        refreshLayoutOnEdgeConnect:true,
        elementsDraggable: false,
        defaults:{
            anchors: [ AnchorLocations.Bottom, AnchorLocations.Top ],
            connector: { type:StateMachineConnector.type, options:{ curviness: 10 } },
            endpoints: [
                { type:DotEndpoint.type, options:{ radius: 2 } },
                BlankEndpoint.type
            ],
            endpointStyle: { fill: "#89bcde" },
            endpointHoverStyle: { fill: "#FF6600" }
        },
        plugins:[
             {
                 type:MiniviewPlugin.type,
                 options: {
                    container: miniviewElement
                }
            },
            {
                type:LassoPlugin.type,
                options:{
                    filter: ".controls, .controls *, .miniview, .miniview *",
                    invert:true
                }
            }

        ]
    })

    //
    // use event delegation to attach event handlers to
    // remove buttons. This callback finds the related Node and
    // then tells the toolkit to delete it and all of its descendants.
    //
    renderer.bindModelEvent<Node>(EVENT_TAP, ".delete", (event:Event, target:Element, info:ObjectInfo<Node>) => {
        const selection = toolkit.selectDescendants(info.obj, true)
        toolkit.remove(selection)
    })

    //
    // use event delegation to attach event handlers to
    // add buttons. This callback adds an edge from the given node
    // to a newly created node, and then the layout is refreshed automatically.
    //
    renderer.bindModelEvent<Node>(EVENT_TAP, ".add", (event:Event, target:Element, info:ObjectInfo<Node>) => {
        // get data for a random node.
        const n = randomNode("node")
        // add the node to the toolkit
        const newNode = toolkit.addNode(n)
        // and add an edge for it from the current node.
        toolkit.addEdge({source: info.obj, target: newNode})
    })

    // pan mode/select mode
    renderer.on(controls, EVENT_TAP, "[mode]", (e:Event) => {
        renderer.setMode((e.target as any).getAttribute("mode"))
    })

    // on home button click, zoom content to fit.
    renderer.on(controls, EVENT_TAP, "[reset]", function () {
        toolkit.clearSelection()
        renderer.zoomToFit()
    })

    const hierarchy = randomHierarchy(3, 2)
    const hierarchy2 = randomHierarchy(3, 2)
    const hierarchy3 = randomHierarchy(2, 4)

    function mergeHierarchy(h:any, h2:any, prefix:string) {
        h2.edges.forEach((e:any) => {
            e.data.id = prefix + e.data.id
            e.source = prefix + e.source
            e.target = prefix + e.target
            h.edges.push(e)
        })

        h2.nodes.forEach((e:any) => {
            e.id = prefix + e.id
            e.name = prefix + e.name
            h.nodes.push(e)
        })
    }

    mergeHierarchy(hierarchy, hierarchy2, "2:")
    mergeHierarchy(hierarchy, hierarchy3, "3:")

    toolkit.load({
        data: hierarchy,
        onload:() => { renderer.zoomToFit() }
    })

})
