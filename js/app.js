(function () {

    jsPlumbToolkitBrowserUI.ready(function () {

        // get a new jsPlumb Toolkit instance to use.
        var toolkit = jsPlumbToolkitBrowserUI.newInstance({
            beforeStartDetach:function() { return false; }
        });

        var mainElement = document.querySelector("#jtk-demo-multiple-hierarchy"),
            canvasElement = mainElement.querySelector(".jtk-demo-canvas"),
            miniviewElement = mainElement.querySelector(".miniview"),
            controls = document.querySelector(".controls");

        // render the data using a hierarchical layout
        var renderer = toolkit.render(canvasElement, {
            consumeRightClick: false,
            layout: {
                type: "Hierarchical",
                options: {
                    orientation: "horizontal",
                    padding: {x:60, y:60}
                }
            },
            events: {
                canvasClick: function (e) {
                    toolkit.clearSelection();
                },
                modeChanged: function (mode) {
                    renderer.removeClass(controls.querySelectorAll("[mode]"), "selected-mode");
                    renderer.addClass(controls.querySelectorAll("[mode='" + mode + "']"), "selected-mode");
                }
            },
            refreshLayoutOnEdgeConnect:true,
            elementsDraggable: false,
            defaults:{
                anchors: ["Bottom", "Top"],
                connector: { type:"StateMachine", options:{ curviness: 10 } },
                endpoints: [
                    { type:"Dot", options:{ radius: 2 } },
                    "Blank"
                ],
                endpointStyle: { fill: "#89bcde" },
                endpointHoverStyle: { fill: "#FF6600" }
            },
            plugins:[
                 {
                     type:"miniview",
                     options: {
                        container: miniviewElement
                    }
                },
                {
                    type:"lasso",
                    options:{
                        filter: ".controls, .controls *, .miniview, .miniview *",
                        invert:true
                    }
                }

            ]
        });

        //
        // use event delegation to attach event handlers to
        // remove buttons. This callback finds the related Node and
        // then tells the toolkit to delete it and all of its descendants.
        //
        renderer.bindModelEvent("tap", ".delete", function (event, target, info) {
            var selection = toolkit.selectDescendants(info.obj, true);
            toolkit.remove(selection);
        });

        //
        // use event delegation to attach event handlers to
        // add buttons. This callback adds an edge from the given node
        // to a newly created node, and then the layout is refreshed automatically.
        //
        renderer.bindModelEvent("tap", ".add", function (event, target, info) {
            // get data for a random node.
            var n = jsPlumbToolkitDemoSupport.randomNode();
            // add the node to the toolkit
            var newNode = toolkit.addNode(n);
            // and add an edge for it from the current node.
            toolkit.addEdge({source: info.obj, target: newNode});
        });

        // pan mode/select mode
        renderer.on(controls, "tap", "[mode]", function () {
            renderer.setMode(this.getAttribute("mode"));
        });

        // on home button click, zoom content to fit.
        renderer.on(controls, "tap", "[reset]", function () {
            toolkit.clearSelection();
            renderer.zoomToFit();
        });

        var hierarchy = jsPlumbToolkitDemoSupport.randomHierarchy(3, 2);
        var hierarchy2 = jsPlumbToolkitDemoSupport.randomHierarchy(3, 2);
        var hierarchy3 = jsPlumbToolkitDemoSupport.randomHierarchy(2, 4);

        function mergeHierarchy(h, h2, prefix) {
            h2.edges.forEach(function(e) {
                e.data.id = prefix + e.data.id;
                e.source = prefix + e.source;
                e.target = prefix + e.target;
                h.edges.push(e);
            });

            h2.nodes.forEach(function(e) {
                e.id = prefix + e.id;
                e.name = prefix + e.name;
                h.nodes.push(e);
            });
        }

        mergeHierarchy(hierarchy, hierarchy2, "2:");
        mergeHierarchy(hierarchy, hierarchy3, "3:");

        toolkit.load({
            data: hierarchy,
            onload:function() { renderer.zoomToFit(); }
        });

        var datasetView = jsPlumbToolkitSyntaxHighlighter.newInstance(toolkit, ".jtk-demo-dataset");

    });

})();
