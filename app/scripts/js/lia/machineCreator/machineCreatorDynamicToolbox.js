var createToolBox = function(categories) {
    var toolbox = '<xml id="toolbox" style="display: none">';
    toolbox = toolbox + createFixedToolBox();
    toolbox = toolbox + categories + "</xml>";
    return toolbox;
};

function createPluginToolBox(plugins) {
    var toolbox = '<category name="Plugins">'+ '<block type="functions_list"></block>';
    
    for(var i=0; i < plugins.length; i++) {
        var block = '<block type="' + plugins[i] + '"></block>';
        toolbox = toolbox + block;
    }
    toolbox = toolbox + '</category>';
    return toolbox;
}

function createFixedToolBox() {
    var toolbox =  '<category name="Machine Layout"><block type="hardware_layout"></block></category>'+ '<category name="Parts" custom="NODES"></category>'+ '<category name="Text/Number Inputs">' + '<block type="math_number"></block>'+ '<block type="number_list"></block>'+ '<block type="text"></block>'+ '<block type="text_list"></block>'+ '</category>';
    
    return toolbox; 
}