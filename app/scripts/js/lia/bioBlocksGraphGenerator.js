/**********************************************************************************************************/
/**********************************************************************************************************/
/***************************************TRANSLATION FUNCTIONS*****************************************/
/**********************************************************************************************************/
var ControlNodeColor = "#FF8000";
var ControlBranchColor = "#CCCCCC";

var WASTEDESTINATONCOLOR = "#FF0000";
var STOREDESTINATONCOLOR = "#00FF00"

Blockly.BioblocksGraphGenerator = new Blockly.Generator("BioblocksGraphGenerator");

Blockly.BioblocksGraphGenerator.workspaceToCode = function(workspace) {
    Blockly.BioblocksGraphGenerator.graphObj = {};
    Blockly.BioblocksGraphGenerator.graphObj.nodes = [];
    Blockly.BioblocksGraphGenerator.graphObj.edges = [];

    Blockly.BioblocksGraphGenerator.nextId = 0;

    var topBlocks = workspace.getTopBlocks();
    var experimentBlock = null;
    for(i = 0; (experimentBlock == null) && (i < topBlocks.length); i++) {
        if (topBlocks[i].type == "experiment") {
            experimentBlock = topBlocks[i];
        }
    }

    if (experimentBlock != null) {
        var nextDescendant = Blockly.BioblocksGraphGenerator.getFirstDescendant(experimentBlock);
        Blockly.BioblocksGraphGenerator.processOrganizationBlock(nextDescendant, [], null);
    }
    return Blockly.BioblocksGraphGenerator.graphObj;
};

Blockly.BioblocksGraphGenerator.blockToCode = function(block, lastBlocks, parent) {
    var buttomNodes = [];
    if (block != null) {
        if (block.type == "bioblocks_if" || block.type == "bioblocks_while") {
            var nodesDataObj = Blockly.BioblocksGraphGenerator[block.type](block, parent);
            if (Blockly.BioblocksGraphGenerator.checkLastBlockControl(lastBlocks)) {
                Blockly.BioblocksGraphGenerator.appendBlock(lastBlocks, nodesDataObj.top, "FALSE", true, false, parent);
            } else {
                Blockly.BioblocksGraphGenerator.appendBlock(lastBlocks, nodesDataObj.top, "", false, false, parent);
            }
            buttomNodes = nodesDataObj.buttom;
            
        } else if (Blockly.BioblocksGraphGenerator[block.type] != null) {
            var nodesDataObj = Blockly.BioblocksGraphGenerator[block.type](block);

            if (nodesDataObj != null &&
                nodesDataObj.timeOp != null &&
                nodesDataObj.timeOpUnits != null &&
                nodesDataObj.text != null &&
                nodesDataObj.top != null && nodesDataObj.top.length > 0 &&
                nodesDataObj.buttom != null && nodesDataObj.buttom.length > 0) 
            {
                if (nodesDataObj.timeOp < 0) { //linked
                    nodesDataObj.text += " upon last operation completion";
                } else {
                    nodesDataObj.text += " at time of operation " + nodesDataObj.timeOp.toString() + nodesDataObj.timeOpUnits;
                }

                if (Blockly.BioblocksGraphGenerator.checkLastBlockControl(lastBlocks)) {
                    Blockly.BioblocksGraphGenerator.appendBlocksLastBlockControl(lastBlocks, nodesDataObj, parent);       
                } else {
                    var commomNodes = Blockly.BioblocksGraphGenerator.getEqualNodes(lastBlocks, nodesDataObj.top);
                    if (commomNodes.same.length > 0) { //are common nodes, operations are appended
                        Blockly.BioblocksGraphGenerator.appendBlocksCommon(commomNodes, nodesDataObj, parent);
                    } else { // not commom nodes, make a gap between them
                        Blockly.BioblocksGraphGenerator.appendBlocksNotCommon(lastBlocks, nodesDataObj, parent);
                    }
                }
                buttomNodes = nodesDataObj.buttom;
            }
        } else {
            console.error("no graph translation function for block type: " + block.type);
        }
    } else {
        console.error("block is null");
    }
    return buttomNodes;
}

/**********************************************************************************************************/
/**********************************************************************************************************/
/***************************************MISCELANEOUS FUNCTIONS*********************************************/
/**********************************************************************************************************/

Blockly.BioblocksGraphGenerator.appendBlocksLastBlockControl = function(lastBlocks, nodesDataObj, parent) {
    Blockly.BioblocksGraphGenerator.appendBlock(lastBlocks, nodesDataObj.top, "FALSE", true, false, parent);

    if (nodesDataObj.middle != null && nodesDataObj.middle.length > 0) {
        Blockly.BioblocksGraphGenerator.appendBlockSequence(nodesDataObj.top, nodesDataObj.middle, nodesDataObj.text, true, nodesDataObj.dotted, parent);

        var lastMiddleBlock = nodesDataObj.middle[nodesDataObj.middle.length - 1];
        Blockly.BioblocksGraphGenerator.appendBlock([lastMiddleBlock], nodesDataObj.buttom, nodesDataObj.text, true, nodesDataObj.dotted, parent);
    } else {
        Blockly.BioblocksGraphGenerator.appendBlock(nodesDataObj.top, nodesDataObj.buttom, nodesDataObj.text, true, nodesDataObj.dotted, parent); //op
    }
};

Blockly.BioblocksGraphGenerator.appendBlocksCommon = function(commomNodes, nodesDataObj, parent) {
    for(var i=0; i < commomNodes.diferrent.length; i++) {
        var elemI = commomNodes.diferrent[i];
        Blockly.BioblocksGraphGenerator.addNode(elemI.id, elemI.name, elemI.destinationColor, elemI.pictureId, parent);    
    }

    var topNodesTopAppend = commomNodes.same.concat(commomNodes.diferrent);
    if (nodesDataObj.middle != null && nodesDataObj.middle.length > 0) {
        Blockly.BioblocksGraphGenerator.appendBlockSequence(topNodesTopAppend, nodesDataObj.middle, nodesDataObj.text, true, nodesDataObj.dotted, parent);

        var lastMiddleBlock = nodesDataObj.middle[nodesDataObj.middle.length - 1];
        Blockly.BioblocksGraphGenerator.appendBlock([lastMiddleBlock], nodesDataObj.buttom, nodesDataObj.text, true, nodesDataObj.dotted, parent);
    } else {
        Blockly.BioblocksGraphGenerator.appendBlock(topNodesTopAppend, nodesDataObj.buttom, nodesDataObj.text, true, nodesDataObj.dotted, parent);
    }
};

Blockly.BioblocksGraphGenerator.appendBlocksNotCommon = function(lastBlocks, nodesDataObj, parent) {
    Blockly.BioblocksGraphGenerator.appendBlock(lastBlocks, nodesDataObj.top, "", false, false, parent); //gap

    if (nodesDataObj.middle != null && nodesDataObj.middle.length > 0) {
        Blockly.BioblocksGraphGenerator.appendBlockSequence(nodesDataObj.top, nodesDataObj.middle, nodesDataObj.text, true, nodesDataObj.dotted, parent);

        var lastMiddleBlock = nodesDataObj.middle[nodesDataObj.middle.length - 1];
        Blockly.BioblocksGraphGenerator.appendBlock([lastMiddleBlock], nodesDataObj.buttom, nodesDataObj.text, true, nodesDataObj.dotted, parent);
    } else {
        Blockly.BioblocksGraphGenerator.appendBlock(nodesDataObj.top, nodesDataObj.buttom, nodesDataObj.text, true, nodesDataObj.dotted, parent); //op
    }
};

Blockly.BioblocksGraphGenerator.checkLastBlockControl = function(lastBlocks) {
    var isControl = false;
    if (lastBlocks.length == 1) {
        var block = lastBlocks[0];
        isControl = (block.name.startsWith("IF") || block.name.startsWith("WHILE") || block.name.startsWith("ELSE"));
    }
    return isControl;
};

Blockly.BioblocksGraphGenerator.processOperationSingleSource = function(block, text) {
    var nodesDataObj = {};
    nodesDataObj.top = [];
    nodesDataObj.buttom = [];

    var timeObj = {};
    appendTimeSettings(timeObj, block);

    nodesDataObj.timeOp = timeObj.timeOfOperation;
    nodesDataObj.timeOpUnits = timeObj.timeOfOperation_units;

    if (timeObj.duration != null) {
        nodesDataObj.dotted = false;
    } else {
        nodesDataObj.dotted = true;
    }

    nodesDataObj.text = text;

    if (block.getInputTargetBlock("source") != null) {
        var sourceBlock = block.getInputTargetBlock("source");

        var translatedBlock = Blockly.BioblocksGraphGenerator.processContainer(sourceBlock);

        var topNopdeId = Blockly.BioblocksGraphGenerator.nextId;
        Blockly.BioblocksGraphGenerator.nextId++;

        var buttonNopdeId = Blockly.BioblocksGraphGenerator.nextId;
        Blockly.BioblocksGraphGenerator.nextId++;

        var topBlock = {};
        topBlock.id = topNopdeId;
        topBlock.name = translatedBlock.name;
        topBlock.destinationColor = translatedBlock.destinationColor;
        topBlock.pictureId = translatedBlock.pictureId;

        var buttomBlock = {};
        buttomBlock.id = buttonNopdeId;
        buttomBlock.name = translatedBlock.name;
        buttomBlock.destinationColor = translatedBlock.destinationColor;
        buttomBlock.pictureId = translatedBlock.pictureId;

        nodesDataObj.top.push(topBlock);
        nodesDataObj.buttom.push(buttomBlock);
    }
    return nodesDataObj;
};

Blockly.BioblocksGraphGenerator.processContainer = function(block) {
    var containerBlock = {};
    if (block != null) {
        var fieldsObjects = block.createFieldsObject();

        containerBlock.name = fieldsObjects.containerName;
        containerBlock.pictureId = parseInt(fieldsObjects.type);

        var destiny = fieldsObjects.destiny;
        if (destiny == "Ambient" || destiny == "Minus80" || destiny == "minus20" || destiny == "Zero" || destiny == "Four") {
            containerBlock.destinationColor = STOREDESTINATONCOLOR;
        } else if (destiny == "Bio-Waste" || destiny == "Chemical-Waste" || destiny == "Regular-Waste") {
            containerBlock.destinationColor = WASTEDESTINATONCOLOR;
        } else {
            console.error("unknown destiny : " + destiny);
        }
    }
    return containerBlock;
};

Blockly.BioblocksGraphGenerator.processContainerList = function(block) {
    var containerBlockList = [];

    var numberContainers = parseInt(block.getFieldValue("contListOptionValue"));
    for(var i=1; i <= numberContainers; i++) {
        var name = "contListOptionValueNum" + i.toString();
        if (block.getInputTargetBlock(name) != null) {
            var containerBlock = block.getInputTargetBlock(name);
            containerBlockList.push(Blockly.BioblocksGraphGenerator.processContainer(containerBlock));
        }
    }

    return containerBlockList;
};

Blockly.BioblocksGraphGenerator.getFirstDescendant = function(block) {
    var firstDescendant = null;
    var descendants = block.getDescendants();
    if (descendants.length > 1) {
        firstDescendant = descendants[1];
    }
    return firstDescendant;
};

Blockly.BioblocksGraphGenerator.processOrganizationBlock = function(block, lastBlocks, parent) {
    var block2process = block;
    var actualLastBlocks = lastBlocks;

    while(block2process != null) {
        if (block2process.type == 'step') {
            var nextDescendant = Blockly.BioblocksGraphGenerator.getFirstDescendant(block2process);
            
            var dataToConcat = Blockly.BioblocksGraphGenerator.processOrganizationBlock(nextDescendant, actualLastBlocks, parent);
            actualLastBlocks = actualLastBlocks.concat(dataToConcat);
            
            block2process = block2process.getNextBlock();
        } else {
            var processedObj = Blockly.BioblocksGraphGenerator.blockToCode(block2process, actualLastBlocks, parent);

            block2process = block2process.getNextBlock();
            if (block2process != null){
                if (block2process.getFieldValue("linked_checkbox") == "FALSE") { 
                    actualLastBlocks = [];
                } else {
                    actualLastBlocks = processedObj;
                }
            }
        }
    }
    return actualLastBlocks;
};

Blockly.BioblocksGraphGenerator.appendBlock = function(topNodes, buttomNodes, text, visible, dotted, parent) {

    for(var i=0; i < buttomNodes.length; i++) {
        var actualNode = buttomNodes[i];

        Blockly.BioblocksGraphGenerator.addNode(actualNode.id, actualNode.name, actualNode.destinationColor, actualNode.pictureId, parent);
    }

    for(var i=0; i < topNodes.length; i++) {
        var source = topNodes[i].id;
        for(var j=0; j < buttomNodes.length; j++) {
            var target = buttomNodes[j].id;

            if (i == 0 && j == 0) {
                Blockly.BioblocksGraphGenerator.addEdge(source, target, dotted, visible, text, 10);
            } else {
                Blockly.BioblocksGraphGenerator.addEdge(source, target, dotted, visible, "...", 10);
            }
        }
    }
};

Blockly.BioblocksGraphGenerator.appendBlockSequence = function(topNodes, middleNodes, text, visible, dotted, parent) {

    for(var i=0; i < middleNodes.length; i++) {
        var actualNode = middleNodes[i];

        Blockly.BioblocksGraphGenerator.addNode(actualNode.id, actualNode.name, actualNode.destinationColor, actualNode.pictureId, parent);
    }

    if (middleNodes.length > 0) {
        var firstMiddleNode = middleNodes[0];
        for(var i=0; i < topNodes.length; i++) {
            var source = topNodes[i].id;
            Blockly.BioblocksGraphGenerator.addEdge(source, firstMiddleNode.id, dotted, visible, text, 10);
        }

        for(var i=1; i < middleNodes.length; i++) {
            Blockly.BioblocksGraphGenerator.addEdge(middleNodes[i-1].id, middleNodes[i].id, dotted, visible, text, 10);
        }
    }
};

Blockly.BioblocksGraphGenerator.getEqualNodes = function(nodes1, nodes2) {
    var equalNodes = {};
    equalNodes.same = [];
    equalNodes.diferrent = [];

    for(var i=0; i < nodes2.length; i++) {
        var node2 = nodes2[i];

        var finded = false;
        for(var j=0; !finded && j < nodes1.length; j++) {
            var node1 = nodes1[j];
            if (node1.name == node2.name) {
                equalNodes.same.push(node1);
                finded = true;
            }
        }
        if (!finded) {
            equalNodes.diferrent.push(node2);
        }
    }
    return equalNodes;
};

Blockly.BioblocksGraphGenerator.addNode = function(id, name, destinationColour, containerPictureId, parent) {
    var node = {
        data : {
            id : id,
            name : name,
            weight : 45,
            faveColor : destinationColour,
            faveShape : 'rectangle',
            backgroundImage : containerPicture[containerPictureId],
            backgroundOpacity : 0,
            borderOpacity : 1
        }
    };

    if (parent != null) {
        node.data.parent = parent;
    }

    Blockly.BioblocksGraphGenerator.graphObj.nodes.push(node);
};

Blockly.BioblocksGraphGenerator.addControlNode = function(id, name, parent) {
    var node = {
        data : {
            id : id,
            name : name,
            weight : 45,
            faveColor : ControlNodeColor,
            faveShape : 'diamond',
            backgroundImage : containerPicture[0],
            backgroundOpacity : 1,
            borderOpacity : 1
        }
    };

    if (parent != null) {
        node.data.parent = parent;
    }

    Blockly.BioblocksGraphGenerator.graphObj.nodes.push(node);
};

Blockly.BioblocksGraphGenerator.addBranchNode = function(id, name, parent) {
    var node = {
        data : {
            id : id,
            name : name,
            weight : 45,
            faveColor : ControlBranchColor,
            faveShape : 'rectangle',
            backgroundImage : containerPicture[0],
            backgroundOpacity : 1,
            borderOpacity : 1
        }
    };

    if (parent != null) {
        node.data.parent = parent;
    }

    Blockly.BioblocksGraphGenerator.graphObj.nodes.push(node);
};

Blockly.BioblocksGraphGenerator.addEdge = function(source, target, dotted, visible, text, strength) {
    Blockly.BioblocksGraphGenerator.graphObj.edges.push(
        {
            data : {
                name : text,
                source : source,
                target : target,
                faveColor : '#9dbaea',
                strength : strength,
                lineStyle : (dotted ? "dashed" : "solid"),
                visible : (visible ? "element" : "none")
            }    
        }
    );
};

/**********************************************************************************************************/
/**********************************************************************************************************/
/***************************************LOGIC BLOCKS*****************************************/
/**********************************************************************************************************/

Blockly.BioblocksGraphGenerator['bioblocks_if'] = function(block, parent) {
    var nodesDataObj = {};
    nodesDataObj.top = [];
    nodesDataObj.buttom = [];
    nodesDataObj.text = "";
    nodesDataObj.dotted = false;

    var timeObj = {};
    appendTimeSettings(timeObj, block);

    nodesDataObj.timeOp = timeObj.timeOfOperation;
    nodesDataObj.timeOpUnits = timeObj.timeOfOperation_units;

    var n = 0;
    var lastBlock = null;
    var lasControl = null;
    while (block.getInputTargetBlock("IF" + n)) {
        var condition = block.getInputTargetBlock("IF" + n);
        var conditionText = "?";
        if (condition != null) {
            conditionText = condition.toString();
        }

        var controlName = "IF(" + conditionText + ")";
        var controlNameId = Blockly.BioblocksGraphGenerator.nextId;
        Blockly.BioblocksGraphGenerator.nextId++;

        Blockly.BioblocksGraphGenerator.addControlNode(controlNameId, controlName, parent);

        var actualBlock = {};
        actualBlock.id = controlNameId;
        actualBlock.name = controlName;
        actualBlock.destinationColor = "";
        actualBlock.pictureId = 0;

        if (n==0) {
            nodesDataObj.top.push(actualBlock);
        } 
        lastBlock = actualBlock;

        var branchName = "";
        var branchNameId = Blockly.BioblocksGraphGenerator.nextId;
        Blockly.BioblocksGraphGenerator.nextId++;

        Blockly.BioblocksGraphGenerator.addBranchNode(branchNameId, branchName, parent);

        var block2process = block.getInputTargetBlock("DO" + n);
        Blockly.BioblocksGraphGenerator.processOrganizationBlock(block2process, [], branchNameId);

        Blockly.BioblocksGraphGenerator.addEdge(controlNameId, branchNameId, false, true, "TRUE", 10);

        if (lasControl != null) {
            Blockly.BioblocksGraphGenerator.addEdge(lasControl, controlNameId, false, true, "FALSE", 10);    
        }
        lasControl = controlNameId;

        n++;
    }

    if (block.getInputTargetBlock("ELSE")) {
        var controlName = "ELSE";
        var controlNameId = Blockly.BioblocksGraphGenerator.nextId;
        Blockly.BioblocksGraphGenerator.nextId++;

        var actualBlock = {};
        actualBlock.id = controlNameId;
        actualBlock.name = controlName;
        actualBlock.destinationColor = "";
        actualBlock.pictureId = 0;

        lastBlock = actualBlock;

        Blockly.BioblocksGraphGenerator.addControlNode(controlNameId, controlName, parent);

        var branchName = "";
        var branchNameId = Blockly.BioblocksGraphGenerator.nextId;
        Blockly.BioblocksGraphGenerator.nextId++;

        Blockly.BioblocksGraphGenerator.addBranchNode(branchNameId, branchName, parent);

        var block2process = block.getInputTargetBlock("ELSE");
        Blockly.BioblocksGraphGenerator.processOrganizationBlock(block2process, [], branchNameId);

        Blockly.BioblocksGraphGenerator.addEdge(controlNameId, branchNameId, false, true, "TRUE", 10);
    }

    nodesDataObj.buttom.push(lastBlock);
    return nodesDataObj;
};

Blockly.BioblocksGraphGenerator['bioblocks_while'] = function(block) {
    var nodesDataObj = {};
    nodesDataObj.top = [];
    nodesDataObj.buttom = [];
    nodesDataObj.text = "";
    nodesDataObj.dotted = false;

    var timeObj = {};
    appendTimeSettings(timeObj, block);

    nodesDataObj.timeOp = timeObj.timeOfOperation;
    nodesDataObj.timeOpUnits = timeObj.timeOfOperation_units;

    var boolBlock = block.getInputTargetBlock("BOOL");
    var condition = boolBlock ? boolBlock.toString() : "?";

    var controlNameId = Blockly.BioblocksGraphGenerator.nextId;
    Blockly.BioblocksGraphGenerator.nextId++;

    var actualBlock = {};
    actualBlock.id = controlNameId;
    actualBlock.name = "WHILE(" + condition + ")";
    actualBlock.destinationColor = "";
    actualBlock.pictureId = 0;

    nodesDataObj.top.push(actualBlock);
    nodesDataObj.buttom.push(actualBlock);

    Blockly.BioblocksGraphGenerator.addControlNode(actualBlock.id, actualBlock.name, parent);

    var branchName = "";
    var branchNameId = Blockly.BioblocksGraphGenerator.nextId;
    Blockly.BioblocksGraphGenerator.nextId++;

    Blockly.BioblocksGraphGenerator.addBranchNode(branchNameId, branchName, parent);

    var block2process = block.getInputTargetBlock("DO");
    Blockly.BioblocksGraphGenerator.processOrganizationBlock(block2process, [], branchNameId);

    Blockly.BioblocksGraphGenerator.addEdge(controlNameId, branchNameId, false, true, "TRUE", 10);
    Blockly.BioblocksGraphGenerator.addEdge(branchNameId, controlNameId, false, true, "", 10);

    return nodesDataObj;
};

/**********************************************************************************************************/
/**********************************************************************************************************/
/***************************************OPERATIONAL REGULAR BLOCKS*****************************************/
/**********************************************************************************************************/

Blockly.BioblocksGraphGenerator['centrifugation'] = function(block) {
    return Blockly.BioblocksGraphGenerator.processOperationSingleSource(block, "centrifugation");   
};

Blockly.BioblocksGraphGenerator['electrophoresis'] = function(block) {
    return Blockly.BioblocksGraphGenerator.processOperationSingleSource(block, "electrophoresis");   
};

Blockly.BioblocksGraphGenerator['flashFreeze'] = function(block) {
    return Blockly.BioblocksGraphGenerator.processOperationSingleSource(block, "flashFreeze");   
};

Blockly.BioblocksGraphGenerator['flowCitometry'] = function(block) {
    return Blockly.BioblocksGraphGenerator.processOperationSingleSource(block, "flowCitometry");
};

Blockly.BioblocksGraphGenerator['incubate'] = function(block) {	
    return Blockly.BioblocksGraphGenerator.processOperationSingleSource(block, "incubate");
};

Blockly.BioblocksGraphGenerator['mix'] = function(block) {
    return Blockly.BioblocksGraphGenerator.processOperationSingleSource(block, "mix");
};

Blockly.BioblocksGraphGenerator['oligosynthesize'] = function(block) {
    return Blockly.BioblocksGraphGenerator.processOperationSingleSource(block, "oligosynthesize");
};

Blockly.BioblocksGraphGenerator['sangerSequencing'] = function(block) {
    return Blockly.BioblocksGraphGenerator.processOperationSingleSource(block, "sangerSequencing");
};		

Blockly.BioblocksGraphGenerator['thermocycling'] = function(block) {
    return Blockly.BioblocksGraphGenerator.processOperationSingleSource(block, "thermocycling");
};	

Blockly.BioblocksGraphGenerator['measurement'] = function(block) {
    return Blockly.BioblocksGraphGenerator.processOperationSingleSource(block, "measurement");
};

Blockly.BioblocksGraphGenerator['cellSpreading'] = function(block) {
    return Blockly.BioblocksGraphGenerator.processOperationSingleSource(block, "cellSpreading");
};

Blockly.BioblocksGraphGenerator['colonyPicking'] = function(block) {
    return Blockly.BioblocksGraphGenerator.processOperationSingleSource(block, "colonyPicking");
};

Blockly.BioblocksGraphGenerator['pipette'] = function(block) {
    var nodesDataObj = {};
    nodesDataObj.top = [];
    nodesDataObj.buttom = [];
    nodesDataObj.text = "pipette";
    nodesDataObj.dotted = false;

    var timeObj = {};
    appendTimeSettings(timeObj, block);

    nodesDataObj.timeOp = timeObj.timeOfOperation;
    nodesDataObj.timeOpUnits = timeObj.timeOfOperation_units;

    var fieldsValue = block.createFieldsObject();

    if (fieldsValue.source != null && fieldsValue.destination != null) {
        var pipetteType = fieldsValue.pipetteTypeName;
        if (pipetteType == "1") { //one to one
            var topNopdeId = Blockly.BioblocksGraphGenerator.nextId;
            Blockly.BioblocksGraphGenerator.nextId++;

            var buttonNopdeId = Blockly.BioblocksGraphGenerator.nextId;
            Blockly.BioblocksGraphGenerator.nextId++;

            var sourceBlock = Blockly.BioblocksGraphGenerator.processContainer(block.getInputTargetBlock("source"));
            var destinationBlock = Blockly.BioblocksGraphGenerator.processContainer(block.getInputTargetBlock("destination"));

            var topBlock = {};
            topBlock.id = topNopdeId;
            topBlock.name = sourceBlock.name;
            topBlock.destinationColor = sourceBlock.destinationColor;
            topBlock.pictureId = sourceBlock.pictureId;

            var buttomBlock = {};
            buttomBlock.id = buttonNopdeId;
            buttomBlock.name = destinationBlock.name;
            buttomBlock.destinationColor = destinationBlock.destinationColor;
            buttomBlock.pictureId = destinationBlock.pictureId;

            nodesDataObj.top.push(topBlock);
            nodesDataObj.buttom.push(buttomBlock);    
        } else if (pipetteType == "2") { //one to many
            var sourceBlock = Blockly.BioblocksGraphGenerator.processContainer(block.getInputTargetBlock("source"));

            var topNopdeId = Blockly.BioblocksGraphGenerator.nextId;
            Blockly.BioblocksGraphGenerator.nextId++;

            var topBlock = {};
            topBlock.id = topNopdeId;
            topBlock.name = sourceBlock.name;
            topBlock.destinationColor = sourceBlock.destinationColor;
            topBlock.pictureId = sourceBlock.pictureId;

            nodesDataObj.top.push(topBlock);

            var destinationBlocks = Blockly.BioblocksGraphGenerator.processContainerList(block.getInputTargetBlock("destination"));
            for(var i=0; i < destinationBlocks.length; i++) {
                var buttomNopdeId = Blockly.BioblocksGraphGenerator.nextId;
                Blockly.BioblocksGraphGenerator.nextId++;

                var actualBlock = destinationBlocks[i];

                var buttomBlock = {};
                buttomBlock.id = buttomNopdeId;
                buttomBlock.name = actualBlock.name;
                buttomBlock.destinationColor = actualBlock.destinationColor;
                buttomBlock.pictureId = actualBlock.pictureId;

                nodesDataObj.buttom.push(buttomBlock);
            }

        } else if (pipetteType == "3") { //many to one
            var destinationBlock = Blockly.BioblocksGraphGenerator.processContainer(block.getInputTargetBlock("destination"));

            var buttomNopdeId = Blockly.BioblocksGraphGenerator.nextId;
            Blockly.BioblocksGraphGenerator.nextId++;

            var buttomBlock = {};
            buttomBlock.id = buttomNopdeId;
            buttomBlock.name = destinationBlock.name;
            buttomBlock.destinationColor = destinationBlock.destinationColor;
            buttomBlock.pictureId = destinationBlock.pictureId;

            nodesDataObj.buttom.push(buttomBlock);

            var sourceBlocks = Blockly.BioblocksGraphGenerator.processContainerList(block.getInputTargetBlock("source"));
            for(var i=0; i < sourceBlocks.length; i++) {
                var topNopdeId = Blockly.BioblocksGraphGenerator.nextId;
                Blockly.BioblocksGraphGenerator.nextId++;

                var actualBlock = sourceBlocks[i];

                var topBlock = {};
                topBlock.id = topNopdeId;
                topBlock.name = actualBlock.name;
                topBlock.destinationColor = actualBlock.destinationColor;
                topBlock.pictureId = actualBlock.pictureId;

                nodesDataObj.top.push(topBlock);
            }
        } else {
            console.error("unknow pipette type: " + pipetteType);
        }
    }
    return nodesDataObj;
};

Blockly.BioblocksGraphGenerator['turbidostat'] = function(block) {

};

Blockly.BioblocksGraphGenerator['variables_set'] = function(block) {

};

Blockly.BioblocksGraphGenerator['continuous_flow'] = function(block) {
    var nodesDataObj = {};
    nodesDataObj.top = [];
    nodesDataObj.buttom = [];
    nodesDataObj.middle = [];
    nodesDataObj.text = "continuous_flow";
    nodesDataObj.dotted = true;

    var timeObj = {};
    appendTimeSettings(timeObj, block);

    nodesDataObj.timeOp = timeObj.timeOfOperation;
    nodesDataObj.timeOpUnits = timeObj.timeOfOperation_units;

    var fieldsValue = block.createFieldsObject();
    var continuosflowType = fieldsValue.continuosflow_type;

    if (fieldsValue.source != null && (continuosflowType == "4" || fieldsValue.destination != null)) {
        if (continuosflowType == "1") { //one to one
            var topNopdeId = Blockly.BioblocksGraphGenerator.nextId;
            Blockly.BioblocksGraphGenerator.nextId++;

            var buttonNopdeId = Blockly.BioblocksGraphGenerator.nextId;
            Blockly.BioblocksGraphGenerator.nextId++;

            var sourceBlock = Blockly.BioblocksGraphGenerator.processContainer(block.getInputTargetBlock("source"));
            var destinationBlock = Blockly.BioblocksGraphGenerator.processContainer(block.getInputTargetBlock("destination"));

            var topBlock = {};
            topBlock.id = topNopdeId;
            topBlock.name = sourceBlock.name;
            topBlock.destinationColor = sourceBlock.destinationColor;
            topBlock.pictureId = sourceBlock.pictureId;

            var buttomBlock = {};
            buttomBlock.id = buttonNopdeId;
            buttomBlock.name = destinationBlock.name;
            buttomBlock.destinationColor = destinationBlock.destinationColor;
            buttomBlock.pictureId = destinationBlock.pictureId;

            nodesDataObj.top.push(topBlock);
            nodesDataObj.buttom.push(buttomBlock);    
        } else if (continuosflowType == "2") { //one to many
            var sourceBlock = Blockly.BioblocksGraphGenerator.processContainer(block.getInputTargetBlock("source"));

            var topNopdeId = Blockly.BioblocksGraphGenerator.nextId;
            Blockly.BioblocksGraphGenerator.nextId++;

            var topBlock = {};
            topBlock.id = topNopdeId;
            topBlock.name = sourceBlock.name;
            topBlock.destinationColor = sourceBlock.destinationColor;
            topBlock.pictureId = sourceBlock.pictureId;

            nodesDataObj.top.push(topBlock);

            var destinationBlocks = Blockly.BioblocksGraphGenerator.processContainerList(block.getInputTargetBlock("destination"));
            for(var i=0; i < destinationBlocks.length; i++) {
                var buttomNopdeId = Blockly.BioblocksGraphGenerator.nextId;
                Blockly.BioblocksGraphGenerator.nextId++;

                var actualBlock = destinationBlocks[i];

                var buttomBlock = {};
                buttomBlock.id = buttomNopdeId;
                buttomBlock.name = actualBlock.name;
                buttomBlock.destinationColor = actualBlock.destinationColor;
                buttomBlock.pictureId = actualBlock.pictureId;

                nodesDataObj.buttom.push(buttomBlock);
            }

        } else if (continuosflowType == "3") { //many to one
            var destinationBlock = Blockly.BioblocksGraphGenerator.processContainer(block.getInputTargetBlock("destination"));

            var buttomNopdeId = Blockly.BioblocksGraphGenerator.nextId;
            Blockly.BioblocksGraphGenerator.nextId++;

            var buttomBlock = {};
            buttomBlock.id = buttomNopdeId;
            buttomBlock.name = destinationBlock.name;
            buttomBlock.destinationColor = destinationBlock.destinationColor;
            buttomBlock.pictureId = destinationBlock.pictureId;

            nodesDataObj.buttom.push(buttomBlock);

            var sourceBlocks = Blockly.BioblocksGraphGenerator.processContainerList(block.getInputTargetBlock("source"));
            for(var i=0; i < sourceBlocks.length; i++) {
                var topNopdeId = Blockly.BioblocksGraphGenerator.nextId;
                Blockly.BioblocksGraphGenerator.nextId++;

                var actualBlock = sourceBlocks[i];

                var topBlock = {};
                topBlock.id = topNopdeId;
                topBlock.name = actualBlock.name;
                topBlock.destinationColor = actualBlock.destinationColor;
                topBlock.pictureId = actualBlock.pictureId;

                nodesDataObj.top.push(topBlock);
            }
        } else if (continuosflowType == "4") { //sequence
            var sourceBlocks = Blockly.BioblocksGraphGenerator.processContainerList(block.getInputTargetBlock("source"));

            if (sourceBlocks.length > 2) {
                var topNopdeId = Blockly.BioblocksGraphGenerator.nextId;
                Blockly.BioblocksGraphGenerator.nextId++;

                var topBlock = {};
                topBlock.id = topNopdeId;
                topBlock.name = sourceBlocks[0].name;
                topBlock.destinationColor = sourceBlocks[0].destinationColor;
                topBlock.pictureId = sourceBlocks[0].pictureId;

                nodesDataObj.top.push(topBlock);

                var buttomNopdeId = Blockly.BioblocksGraphGenerator.nextId;
                Blockly.BioblocksGraphGenerator.nextId++;

                var actualBlock = sourceBlocks[sourceBlocks.length - 1];

                var buttomBlock = {};
                buttomBlock.id = buttomNopdeId;
                buttomBlock.name = actualBlock.name;
                buttomBlock.destinationColor = actualBlock.destinationColor;
                buttomBlock.pictureId = actualBlock.pictureId;

                nodesDataObj.buttom.push(buttomBlock);

                var lastBlock = topBlock.id;
                for(var i=1 ; i < sourceBlocks.length - 1; i++) {
                    var actualNodeId = Blockly.BioblocksGraphGenerator.nextId;
                    Blockly.BioblocksGraphGenerator.nextId++;

                    var actualMiddelBlock = sourceBlocks[i];

                    var actualBlock = {};
                    actualBlock.id = actualNodeId;
                    actualBlock.name = actualMiddelBlock.name;
                    actualBlock.destinationColor = actualMiddelBlock.destinationColor;
                    actualBlock.pictureId = actualMiddelBlock.pictureId; 

                    nodesDataObj.middle.push(actualBlock)
                }
            }
        } else {
            console.error("unknow pipette type: " + pipetteType);
        }
    }
    return nodesDataObj;
};


















