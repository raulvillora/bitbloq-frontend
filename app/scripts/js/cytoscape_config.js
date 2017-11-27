'use strict';
function makeCytoscapeConfig() {//defined but never used
    var config = {
        style: [
            {
                'selector' : 'node',
                'style' : {
                    'content' : 'data(name)',
                    'shape' : 'data(faveShape)',
                    'background-color' : 'data(faveColor)',
                    'text-valign' : 'center',
                    'text-halign' : 'left',
                    'text-outline-color': 'data(faveColor)',
                    'color' : '#000',
                    'background-image' : 'data(backgroundImage)',
                    'background-fit' : 'contain',
                    'border-color' : 'data(faveColor)',
                    'border-width' : '1px',
                    'background-opacity' : 'data(backgroundOpacity)',
                    'border-opacity' : 'data(borderOpacity)'
                }
            },
            {
                'selector' : 'edge',
                'style': {
                    'content': 'data(name)',
                    'text-opacity': 1,
                    'text-valign': 'center',
                    'text-halign': 'left',
                    'text-max-width': 0.1,
                    'background-color': '#CCCCCC',
                    'line-color': 'data(faveColor)',
                    'target-arrow-color': '#9dbaea',
                    'curve-style': 'bezier',
                    'opacity': 0.666,
                    'width': 'mapData(strength,70,100,2,6)',
                    'target-arrow-shape': 'triangle',
                    'source-arrow-shape': 'circle',
                    'line-style': 'data(lineStyle)',
                    'display' : 'data(visible)',
                    'font-size' : 9
                }
            },
            {
                'selector': 'edge.questionable',
                'style': {
                    'line-style': 'dotted',
                    'target-arrow-shape': 'diamond'
                }
            },
            {
                'selector': ':selected',
                'style': {
                    'background-color': 'black',
                    'line-color': 'black',
                    'target-arrow-color': 'black',
                    'source-arrow-color': 'black'
                }
            }
        ]
    }
    return config;
}
