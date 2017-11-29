/*
The MIT License (MIT)

Copyright (c) 2016 Universidad Polit�cnica de Madrid

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/



/**********************************************************************************************************/
/**********************************************************************************************************/
/***************************************MISCELANEOUS FUNCTIONS*****************************************/
/**********************************************************************************************************/

function getMathOperations() {
    var operations = [];
    var xml = document.getElementById('toolbox');
    if (xml != null) {
        var x = xml.children;
        var finded = null;
        for(i=0 ;  finded == null && i < x.length; i++) {
            if(x[i].attributes["name"].value == "Math") {
                finded = x[i];
            }
        }

        if (finded != null) {
            var customBlocks = finded.children;
            for(i = 0; i < customBlocks.length; i++) {
                operations.push(customBlocks[i].attributes["type"].value);
            }
        } else {
            console.error("no 'Operations' category on the toolbox");	
        }
    } else {
        console.error("no 'toolbox' element on the document");
    }
    return operations;
};

function appendBlockFields(objToAppend, block) {
    if (block.createFieldsObject != null ) {
        var blockFields = block.createFieldsObject();
        for (var keys in blockFields) {
            if (blockFields[keys] instanceof Blockly.Block) {
                objToAppend[keys] = Blockly.CompilerGenerator.blockToCode(blockFields[keys]);
            } else {
                objToAppend[keys] = blockFields[keys];
            }
        }
    } else {
        console.error(block.type + " has no createFieldsObject() function");
    }
}

function getFirstDescendant(block) {
    var firstDescendant = null;
    var descendants = block.getDescendants();
    if (descendants.length > 1) {
        firstDescendant = descendants[1];
    }
    return firstDescendant;
};

function processOrganizationBlock(translationObj, block) {
    var actualLinkedBlocks = [];

    var block2process = block;
    while(block2process != null) {
        if (block2process.type == 'step') {
            if(actualLinkedBlocks.length > 0) {
                translationObj.linkedBlocks.push(actualLinkedBlocks);
                actualLinkedBlocks = [];
            }
            var blockInsideStep = block2process.getInputTargetBlock("inputOfExperiment");
            processOrganizationBlock(translationObj, blockInsideStep);

            block2process = block2process.getNextBlock();
        } else {
            translatedObj = Blockly.CompilerGenerator.blockToCode(block2process);
            actualLinkedBlocks.push(translatedObj);

            block2process = block2process.getNextBlock();

            if (block2process != null && block2process.getFieldValue("linked_checkbox") == "FALSE") { 
                translationObj.linkedBlocks.push(actualLinkedBlocks);
                actualLinkedBlocks = [];
            }
        }
    }
    if (actualLinkedBlocks.length > 0) {
        translationObj.linkedBlocks.push(actualLinkedBlocks);
    }
};

/**********************************************************************************************************/
/**********************************************************************************************************/
/***************************************TRANSLATION FUNCTIONS*****************************************/
/**********************************************************************************************************/
Blockly.CompilerGenerator = new Blockly.Generator("CompilerGenerator");

Blockly.CompilerGenerator.workspaceToCode = function(workspace) {
    var translationObj = null;

    var topBlocks = workspace.getTopBlocks();
    var experimentBlock = null;
    for(i = 0; (experimentBlock == null) && (i < topBlocks.length); i++) {
        if (topBlocks[i].type == "experiment") {
            experimentBlock = topBlocks[i];
        }
    }

    if (experimentBlock != null) {
        translationObj = Blockly.CompilerGenerator['experiment'](experimentBlock);
        translationObj.linkedBlocks = [];
        processOrganizationBlock(translationObj, getFirstDescendant(experimentBlock));
    }
    return JSON.stringify(translationObj, null, 2);
};

Blockly.CompilerGenerator.blockToCode = function(block) {
    var translatedObj = null;
    if (block != null) {
        if (Blockly.CompilerGenerator[block.type] != null) {
            translatedObj = Blockly.CompilerGenerator[block.type](block);
        } else {
            console.error("no translation function for block type: " + block.type);
        }
    }
    return translatedObj;
}

/**********************************************************************************************************/
/**********************************************************************************************************/
/***************************************LOGIC BLOCKS*****************************************/
/**********************************************************************************************************/

Blockly.CompilerGenerator['controls_if'] = function (block) {
    var translatedObj = {};
    translatedObj.block_type = 'controls_if';
    translatedObj.branches = [];

    n = 0;
    while (block.getInputTargetBlock("IF" + n)) {
        var branchObj = {};
        branchObj.condition = Blockly.CompilerGenerator.blockToCode(block.getInputTargetBlock("IF" + n));
        branchObj.nestedOp = [];

        var block2process = block.getInputTargetBlock("DO" + n);
        while(block2process != null) {
            branchObj.nestedOp.push(Blockly.CompilerGenerator.blockToCode(block2process));
            block2process = block2process.getNextBlock();
        }
        translatedObj.branches.push(branchObj);
        n++;
    }
    translatedObj.numberOfBranches = n;

    if (block.getInputTargetBlock("ELSE")) {
        translatedObj.else = [];

        block2process = block.getInputTargetBlock("ELSE");
        while(block2process != null) {
            translatedObj.else.push(Blockly.CompilerGenerator.blockToCode(block2process));
            block2process = block2process.getNextBlock();
        }
    }
    return translatedObj;
};

Blockly.CompilerGenerator['bioblocks_if'] = function(block) {
    var translatedObj = Blockly.CompilerGenerator['controls_if'](block);
    appendTimeSettings(translatedObj, block);
    return translatedObj;
};

Blockly.CompilerGenerator['controls_whileUntil'] = function(block) {
    var translatedObj = {};
    translatedObj.block_type = 'controls_whileUntil';

    var boolBlock = block.getInputTargetBlock("BOOL");
    translatedObj.condition = boolBlock ? Blockly.CompilerGenerator.blockToCode(boolBlock) : null;  
    translatedObj.branches = [];

    var block2process = block.getInputTargetBlock("DO");
    while(block2process != null) {
        translatedObj.branches.push(Blockly.CompilerGenerator.blockToCode(block2process));
        block2process = block2process.getNextBlock();
    }
    return translatedObj;
};

Blockly.CompilerGenerator['bioblocks_while'] = function(block) {
    var translatedObj = Blockly.CompilerGenerator['controls_whileUntil'](block);
    appendTimeSettings(translatedObj, block);
    return translatedObj;
};

/**********************************************************************************************************/
/**********************************************************************************************************/
/***************************************OPERATIONAL REGULAR BLOCKS*****************************************/
/**********************************************************************************************************/

Blockly.CompilerGenerator['centrifugation'] = function(block) {
    var translatedObj = {};
    appendBlockFields(translatedObj, block);
    return translatedObj;
};

Blockly.CompilerGenerator['electrophoresis'] = function(block) {
    var translatedObj = {};
    appendBlockFields(translatedObj, block);
    return translatedObj;
};

Blockly.CompilerGenerator['flashFreeze'] = function(block) {
    var translatedObj = {};
    appendBlockFields(translatedObj, block);
    return translatedObj;
};

Blockly.CompilerGenerator['flowCitometry'] = function(block) {
    var translatedObj = {};
    appendBlockFields(translatedObj, block);
    return translatedObj;
};

Blockly.CompilerGenerator['incubate'] = function(block) {	
    var translatedObj = {};
    appendBlockFields(translatedObj, block);
    return translatedObj;
};

Blockly.CompilerGenerator['mix'] = function(block) {
    var translatedObj = {};
    appendBlockFields(translatedObj, block);
    return translatedObj;
};

Blockly.CompilerGenerator['oligosynthesize'] = function(block) {
    var translatedObj = {};
    appendBlockFields(translatedObj, block);
    return translatedObj;
};

Blockly.CompilerGenerator['sangerSequencing'] = function(block) {
    var translatedObj = {};
    appendBlockFields(translatedObj, block);
    return translatedObj;
};		

Blockly.CompilerGenerator['thermocycling'] = function(block) {
    var translatedObj = {};
    appendBlockFields(translatedObj, block);
    return translatedObj;
};	

Blockly.CompilerGenerator['measurement'] = function(block) {
    var translatedObj = {};
    appendBlockFields(translatedObj, block);
    return translatedObj;
};

Blockly.CompilerGenerator['cellSpreading'] = function(block) {
    var translatedObj = {};
    appendBlockFields(translatedObj, block);
    return translatedObj;
};

Blockly.CompilerGenerator['colonyPicking'] = function(block) {
    var translatedObj = {};
    appendBlockFields(translatedObj, block);
    return translatedObj;
};

Blockly.CompilerGenerator['pipette'] = function(block) {
    var translatedObj = {};
    appendBlockFields(translatedObj, block);
    return translatedObj;
};

Blockly.CompilerGenerator['turbidostat'] = function(block) {
    var translatedObj = {};
    appendBlockFields(translatedObj, block);
    return translatedObj;
};

Blockly.CompilerGenerator['continuous_flow'] = function(block) {
    var translatedObj = {};
    appendBlockFields(translatedObj, block);
    return translatedObj;
};

/**********************************************************************************************************/
/**********************************************************************************************************/
/***************************************CONTAINER BLOKS*****************************************/
/**********************************************************************************************************/

Blockly.CompilerGenerator['container'] = function(block) {
    var containerObj = {};
    appendBlockFields(containerObj, block);
    return containerObj;
};

Blockly.CompilerGenerator['containerList'] = function(block) {
    var containerObj = {};
    var fields = block.createFieldsObject();

    containerObj.block_type = fields.block_type;
    containerObj.containerList = [];
    for(var i=0; i < fields.containerList.length; i++) {
        var elemI = fields.containerList[i];
        containerObj.containerList.push(Blockly.CompilerGenerator.blockToCode(elemI));
    }
    return containerObj;
};

/**********************************************************************************************************/
/**********************************************************************************************************/
/***************************************Experiment BLOCKS*****************************************/
/**********************************************************************************************************/

Blockly.CompilerGenerator['experiment'] = function(block) {
    var containerObj = {};
    containerObj.tittle = block.getFieldValue("experimentName");
    return containerObj;
};

/**********************************************************************************************************/
/**********************************************************************************************************/
/***************************************VARIABLE OPERATIONS BLOCKS*****************************************/
/**********************************************************************************************************/

Blockly.CompilerGenerator['variables_set'] = function(block) {
    var containerObj = {};
    containerObj.block_type = "variables_set";
    containerObj.variable = block.getFieldValue("VAR");

    var valueBlock = block.getInputTargetBlock("VALUE");
    containerObj.value = valueBlock != null ? Blockly.CompilerGenerator.blockToCode(valueBlock) : null;

    var opOnTop = getOpOnTop(block);
    containerObj.timeOfOperation = opOnTop == null ? "0" : "-1";
    containerObj.timeOfOperation_units = "ms";
    return containerObj;
};

Blockly.CompilerGenerator['variables_get'] = function(block) {
    var containerObj = {};
    containerObj.block_type = "variables_get";
    containerObj.variable = block.toString();
    return containerObj;
};

/**********************************************************************************************************/
/**********************************************************************************************************/
/***************************************ARITHMETIC OPERATIONS BLOCKS***************************************/
/**********************************************************************************************************/

Blockly.CompilerGenerator['math_number'] = function(block) {
    var containerObj = {};
    containerObj.block_type = "math_number";
    containerObj.value = block.toString();
    return containerObj;
};

Blockly.CompilerGenerator['math_arithmetic'] = function(block) {
    var containerObj = {};
    containerObj.block_type = "math_arithmetic";

    var aBlock = block.getInputTargetBlock("A");
    containerObj.left = aBlock != null ? Blockly.CompilerGenerator.blockToCode(aBlock) : null;

    var bBlock = block.getInputTargetBlock("B");
    containerObj.rigth = bBlock != null ? Blockly.CompilerGenerator.blockToCode(bBlock) : null;

    containerObj.op = block.getFieldValue("OP");
    return containerObj;
};

Blockly.CompilerGenerator['math_single'] = function(block) {
    var containerObj = {};
    containerObj.block_type = "math_single";

    var aBlock = block.getInputTargetBlock("NUM");
    containerObj.value = aBlock != null ? Blockly.CompilerGenerator.blockToCode(aBlock) : null;

    containerObj.op = block.getFieldValue("OP");
    return containerObj;
};

Blockly.CompilerGenerator['math_trig'] = function(block) {
    var containerObj = {};
    containerObj.block_type = "math_trig";

    var aBlock = block.getInputTargetBlock("NUM");
    containerObj.value = aBlock != null ? Blockly.CompilerGenerator.blockToCode(aBlock) : null;

    containerObj.op = block.getFieldValue("OP");
    return containerObj;
};

Blockly.CompilerGenerator['math_constant'] = function(block) {
    var containerObj = {};
    containerObj.block_type = "math_constant";

    containerObj.constant = block.getFieldValue("CONSTANT");
    return containerObj;
};

Blockly.CompilerGenerator['math_number_property'] = function(block) {
    var containerObj = {};
    containerObj.block_type = "math_number_property";

    var aBlock = block.getInputTargetBlock("NUMBER_TO_CHECK");
    containerObj.value = aBlock != null ? Blockly.CompilerGenerator.blockToCode(aBlock) : null;

    if (block.getInput("DIVISOR") != null) {
        var divisorBlock = block.getInputTargetBlock("DIVISOR");
        containerObj.divisor = divisorBlock != null ? Blockly.CompilerGenerator.blockToCode(divisorBlock) : null;
    }

    containerObj.op = block.getFieldValue("PROPERTY");
    return containerObj;
};

Blockly.CompilerGenerator['math_change'] = function(block) {
    var containerObj = {};
    containerObj.block_type = "math_change";

    var aBlock = block.getInputTargetBlock("VAR");
    containerObj.value = aBlock != null ? Blockly.CompilerGenerator.blockToCode(aBlock) : null;

    containerObj.delta = block.getFieldValue("DELTA");
    return containerObj;
};

Blockly.CompilerGenerator['math_round'] = function(block) {
    var containerObj = {};
    containerObj.block_type = "math_round";

    var aBlock = block.getInputTargetBlock("NUM");
    containerObj.value = aBlock != null ? Blockly.CompilerGenerator.blockToCode(aBlock) : null;

    containerObj.op = block.getFieldValue("OP");
    return containerObj;
};

Blockly.CompilerGenerator['math_modulo'] = function(block) {
    var containerObj = {};
    containerObj.block_type = "math_modulo";

    var aBlock = block.getInputTargetBlock("DIVIDEND");
    containerObj.left = aBlock != null ? Blockly.CompilerGenerator.blockToCode(aBlock) : null;

    var bBlock = block.getInputTargetBlock("DIVISOR");
    containerObj.rigth = bBlock != null ? Blockly.CompilerGenerator.blockToCode(bBlock) : null;

    return containerObj;
};

Blockly.CompilerGenerator['math_constrain'] = function(block) {
    var containerObj = {};
    containerObj.block_type = "math_constrain";

    var aBlock = block.getInputTargetBlock("VALUE");
    containerObj.value = aBlock != null ? Blockly.CompilerGenerator.blockToCode(aBlock) : null;

    var bBlock = block.getInputTargetBlock("LOW");
    containerObj.low = bBlock != null ? Blockly.CompilerGenerator.blockToCode(bBlock) : null;

    var cBlock = block.getInputTargetBlock("LOW");
    containerObj.high = cBlock != null ? Blockly.CompilerGenerator.blockToCode(cBlock) : null;

    return containerObj;
};

Blockly.CompilerGenerator['math_random_int'] = function(block) {
    var containerObj = {};
    containerObj.block_type = "math_random_int";

    var aBlock = block.getInputTargetBlock("FROM");
    containerObj.from = aBlock != null ? Blockly.CompilerGenerator.blockToCode(aBlock) : null;

    var bBlock = block.getInputTargetBlock("TO");
    containerObj.to = bBlock != null ? Blockly.CompilerGenerator.blockToCode(bBlock) : null;

    return containerObj;
};

Blockly.CompilerGenerator['math_random_float'] = function(block) {
    var containerObj = {};
    containerObj.block_type = "math_random_float";
    return containerObj;
};

/**********************************************************************************************************/
/**********************************************************************************************************/
/***************************************COMPARISON OPERATIONS BLOCKS***************************************/
/**********************************************************************************************************/

Blockly.CompilerGenerator['logic_compare'] = function(block) {
    var containerObj = {};
    containerObj.block_type = "logic_compare";

    var aBlock = block.getInputTargetBlock("A");
    containerObj.left = aBlock != null ? Blockly.CompilerGenerator.blockToCode(aBlock) : null;

    var bBlock = block.getInputTargetBlock("B");
    containerObj.rigth = bBlock != null ? Blockly.CompilerGenerator.blockToCode(bBlock) : null;

    containerObj.op = block.getFieldValue("OP");
    return containerObj;
};

Blockly.CompilerGenerator['logic_operation'] = function(block) {
    var containerObj = {};
    containerObj.block_type = "logic_operation";

    var aBlock = block.getInputTargetBlock("A");
    containerObj.left = aBlock != null ? Blockly.CompilerGenerator.blockToCode(aBlock) : null;

    var bBlock = block.getInputTargetBlock("B");
    containerObj.rigth = bBlock != null ? Blockly.CompilerGenerator.blockToCode(bBlock) : null;

    containerObj.op = block.getFieldValue("OP");
    return containerObj;
};

Blockly.CompilerGenerator['logic_negate'] = function(block) {
    var containerObj = {};
    containerObj.block_type = "logic_negate";

    var aBlock = block.getInputTargetBlock("BOOL");
    containerObj.bool = aBlock != null ? Blockly.CompilerGenerator.blockToCode(aBlock) : null;

    return containerObj;
};

Blockly.CompilerGenerator['logic_boolean'] = function(block) {
    var containerObj = {};
    containerObj.block_type = "logic_boolean";

    containerObj.value = block.getFieldValue("BOOL");
    return containerObj;
}

Blockly.CompilerGenerator['logic_null'] = function(block) {
    var containerObj = {};
    containerObj.block_type = "logic_null";

    containerObj.value = "null";
    return containerObj;
}

Blockly.CompilerGenerator['logic_ternary'] = function(block) {
    var containerObj = {};
    containerObj.block_type = "logic_ternary";

    var aBlock = block.getInputTargetBlock("IF");
    containerObj.if = aBlock != null ? Blockly.CompilerGenerator.blockToCode(aBlock) : null;

    var bBlock = block.getInputTargetBlock("THEN");
    containerObj.then = bBlock != null ? Blockly.CompilerGenerator.blockToCode(bBlock) : null;

    var cBlock = block.getInputTargetBlock("ELSE");
    containerObj.else = cBlock != null ? Blockly.CompilerGenerator.blockToCode(cBlock) : null;
    return containerObj;
};