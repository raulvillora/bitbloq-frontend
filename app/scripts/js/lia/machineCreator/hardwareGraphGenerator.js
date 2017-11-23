var PATH_MEDIA = "../../../media/";
var IMAGE_PATH_OBJ = {
    OPEN_CONTAINER : PATH_MEDIA + "open_container.png",
    CLOSE_CONTAINER : PATH_MEDIA + "close_container.png",
    PUMP_UNIDIRECTIONAL : PATH_MEDIA + "unidirectional_pump.png",
    PUMP_BIDIRECTIONAL : PATH_MEDIA + "bidirectional_pump.png",
    VALVE : PATH_MEDIA + "valve.png"
};

function getFirstDescendant(block) {
    var firstDescendant = null;
    var descendants = block.getDescendants();
    if (descendants.length > 1) {
        firstDescendant = descendants[1];
    }
    return firstDescendant;
};

Blockly.GraphGenerator = new Blockly.Generator("GraphGenerator");

Blockly.GraphGenerator.workspaceToGraph = function (workspace) 
{
    var elements = {};
    var nodes = [];
    var edges = [];

    var variableList = workspace.variableList;
    var connections = makeConnectionsObj(variableList);

    var topBlocks = workspace.getTopBlocks();
    var experimentBlock = null;
    for(i = 0; (experimentBlock == null) && (i < topBlocks.length); i++) {
        if (topBlocks[i].type == "hardware_layout") {
            experimentBlock = topBlocks[i];
        }
    }

    if (experimentBlock != null) {      
        var descendant = getFirstDescendant(experimentBlock);
        while(descendant != null) {
            nodes.push(makeNode(descendant));
            addEdges(descendant, edges, connections);

            descendant = descendant.getNextBlock();
        }
    }

    elements.nodes = nodes;
    elements.edges = edges;
    return elements;
};

function makeConnectionsObj(variableList) {
    var connections = {};
    for(var i=0; i < variableList.length; i++) {
        connections[variableList[i]] = [];
    }
    return connections;
};

function makeNode(block) 
{
    var nodeObj = {};
    nodeObj.data = {};

    var fieldsObj = block.createFieldsObject();
    nodeObj.data.id = fieldsObj.reference;

    if (fieldsObj.type == "PUMP") {
        nodeObj.data.image = IMAGE_PATH_OBJ["PUMP_UNIDIRECTIONAL"];

        if (fieldsObj.functions && 
            fieldsObj.functions.internalValues != null &&
            fieldsObj.functions.internalValues.reversible != null && 
            fieldsObj.functions.internalValues.reversible == true) 
        {
            nodeObj.data.image = IMAGE_PATH_OBJ["PUMP_BIDIRECTIONAL"];
        }
        
    } else {
        nodeObj.data.image = IMAGE_PATH_OBJ[fieldsObj.type];
    }
    return nodeObj;
};

function addEdges(block, edges, connections) {
    var fieldsObj = block.createFieldsObject();

    var source = fieldsObj.reference;
    for(var i=0; i < fieldsObj.number_pins; i++) {
        var name = "port" + (i+1).toString();
        if (fieldsObj[name] != null) {
            var targetObj = fieldsObj[name].createFieldsObject();
            var target = getReference(targetObj);

            if (target != null && !checkConnected(source, target, connections)) {
                edges.push(makeEdge(source, target));
                addConnected(source, target, connections);
            }
        }    
    }
};

function getReference(targetBlock) {
    if (targetBlock.type == "part_copy") {
        return getReference(targetBlock.reference);
    } else {
        return targetBlock.reference; 
    }
}

function checkConnected(source, target, connections) {
    if (target != null && source != null) {
        return (connections[source].indexOf(target) != -1);
    } else {
        return false;
    }
};

function makeEdge(source, target) {
    var edgeObj = {
        data : {
            id : source + target,
            source : source,
            target : target
        }
    };

    return edgeObj;
};

function addConnected(source, target, connections) {
    connections[source].push(target);
    connections[target].push(source);
};























