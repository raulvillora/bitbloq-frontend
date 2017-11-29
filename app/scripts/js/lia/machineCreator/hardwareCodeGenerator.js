/**********************************************************************************************************/
/**********************************************************************************************************/
/***************************************MISCELANEOUS FUNCTIONS*****************************************/
/**********************************************************************************************************/

function appendBlockFields(objToAppend, block) {
    if (block.createFieldsObject != null ) {
        var blockFields = block.createFieldsObject();
        for (var keys in blockFields) {
            if (blockFields[keys] instanceof Blockly.Block) {
                objToAppend[keys] = Blockly.HardwareGenerator.blockToCode(blockFields[keys]);
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
}

function extractWorkingValues(block) {
    var workingValues = null;

    if (block != null) {
        var workingValues2 = {};

        workingValues2.decimalPrecission = block.decimalPrecission;

        workingValues2.maxRate = {};
        workingValues2.maxRate.value = block.maxRange;
        workingValues2.maxRate.volumeUnits = block.maxRangeVolumeUnits;
        workingValues2.maxRate.timeUnits = block.maxRangeTimeUnits;

        workingValues2.defaultRate = {};
        workingValues2.defaultRate.value = block.defaultRate;
        workingValues2.defaultRate.volumeUnits = block.defaultRateVolumeUnits;
        workingValues2.defaultRate.timeUnits = block.defaultRateTimeUnits;
    }
    return workingValues;
}

function processDecimalPrecission(decimalPrecision) {
    var decimalPrecisionValue = -1;
    for(var i=0; i < decimalPrecision.length; i++) {
        if (decimalPrecisionValue < decimalPrecision[i]) {
            decimalPrecisionValue =  decimalPrecision[i];   
        }
    }
    return decimalPrecisionValue;
}

function processMaxRate(maxRate, units) {
    var unitsVector = applyUnits(maxRate, units);
    var maxRate = getMaxUnistVector(unitsVector, units);

    return maxRate;
}

function processDefaultRate(defaultRate) {
    var minDefaultUnits = math.unit(1,"L/h");
    var minVolumeUnits = "L";
    var minTimeUnits = "h";

    for(var i=0; i < defaultRate.length; i++) {
        var actualVolUnits = defaultRate[i].volumeUnits;
        var actualTimeUnits = defaultRate[i].timeUnits;
        var actualUnitsStr = actualVolUnits + "/" + actualTimeUnits;

        var actualUnits = math.unit(1, actualUnitsStr);
        if (actualUnits.toNumber(actualUnitsStr) < minDefaultUnits.toNumber(actualUnitsStr)) {
            minDefaultUnits = actualUnits;

            minVolumeUnits = actualVolUnits;
            actualTimeUnits = actualTimeUnits;
        }
    }

    var unitsVector = applyUnits(defaultRate, minVolumeUnits + "/" + minTimeUnits);
    var minDefaultValue = getMinUnistVector(unitsVector, minVolumeUnits + "/" + minTimeUnits);

    var defaultRateObj = {};
    defaultRateObj.value = minDefaultValue.toNumber(minVolumeUnits + "/" + minTimeUnits);
    defaultRateObj.volumeUnits = minVolumeUnits;
    defaultRateObj.timeUnits = minTimeUnits;

    return defaultRateObj;
}

function applyUnits(rateVector, units) {
    var unitsVector = [];

    for(var i=0; i < rateVector.length; i++) {
        var rateUnits = math.unit(rateVector[i].value, rateVector[i].volumeUnits + "/" + rateVector[i].timeUnits);
        unitsVector.push(rateUnits.to(units));
    }
    return unitsVector;
}

function getMinUnistVector(unitsVector, units) {
    var minDefaultValue = math.unit(Number.MAX_VALUE, "L/h");
    for(var i=0; i < unitsVector.length; i++) {
        var actualRate = unitsVector[i];
        if (actualRate.toNumber(units) < minDefaultValue.toNumber(units)) {
            minDefaultValue = actualRate;
        }
    }
    return minDefaultValue;
}

function getMaxUnistVector(unitsVector, units) {
    var maxDefaultValue = math.unit(0, "L/h");
    for(var i=0; i < unitsVector.length; i++) {
        var actualRate = unitsVector[i];
        if (actualRate.toNumber(units) > maxDefaultValue.toNumber(units)) {
            maxDefaultValue = actualRate;
        }
    }
    return maxDefaultValue;
}

function fillPrecission(translationObj, precissionObj) {
    translationObj.decimal_precission = processDecimalPrecission(precissionObj.decimalPrescission);

    var defaultRateObj = processDefaultRate(precissionObj.defaultRate);
    translationObj.default_rate = defaultRateObj.value;
    translationObj.default_rate_volume_units = defaultRateObj.volumeUnits;
    translationObj.default_rate_time_units = defaultRateObj.timeUnits;

    var maxRateUnit = processMaxRate(precissionObj.maxRate, defaultRateObj.volumeUnits + "/" + defaultRateObj.timeUnits);
    var maxRateValue = maxRateUnit.toNumber(defaultRateObj.volumeUnits + "/" + defaultRateObj.timeUnits);

    translationObj.integer_precission = maxRateValue.toString().length;
}

function pushWorkingValues(precissionObj, workingValues) {
    if (workingValues != null) {
        precissionObj.decimalPrescission.push(workingValues.decimalPrecission);
        precissionObj.maxRate.push(workingValues.maxRate);
        precissionObj.defaultRate.push(workingValues.defaultRate);
    }
}

/**********************************************************************************************************/
/**********************************************************************************************************/
/***************************************TRANSLATION FUNCTIONS*****************************************/
/**********************************************************************************************************/
Blockly.HardwareGenerator = new Blockly.Generator("HardwareGenerator");

Blockly.HardwareGenerator.workspaceToCode = function(workspace) {
    var translationObj = null;

    var topBlocks = workspace.getTopBlocks();
    var experimentBlock = null;
    for(i = 0; (experimentBlock == null) && (i < topBlocks.length); i++) {
        if (topBlocks[i].type == "hardware_layout") {
            experimentBlock = topBlocks[i];
        }
    }

    if (experimentBlock != null) {
        var precissionObj = {};

        precissionObj.decimalPrescission = [];
        precissionObj.maxRate = [];
        precissionObj.defaultRate = [];

        translationObj = experimentBlock.createFieldsObject();
        translationObj.connections = [];

        var descendant = getFirstDescendant(experimentBlock);
        while(descendant != null) {
            var translatedBlock = Blockly.HardwareGenerator.blockToCode(descendant);
            translationObj.connections.push(translatedBlock);

            if (translatedBlock.type == "PUMP") {
                var workingValues = extractWorkingValues(translatedBlock.functions);
                pushWorkingValues(precissionObj, workingValues);
            }
            descendant = descendant.getNextBlock();
        }
        fillPrecission(translationObj, precissionObj);
    }
    return JSON.stringify(translationObj, null, 2);
};

Blockly.HardwareGenerator.blockToCode = function(block) {
    var translatedObj = null;
    if (block != null) {
        if (Blockly.HardwareGenerator[block.type] != null) {
            translatedObj = Blockly.HardwareGenerator[block.type](block);
        } else {
            translatedObj = Blockly.HardwareGenerator.processDefaultBlock(block);
        }
    } else {
        console.error("block is null");
    }
    return translatedObj;
};


/**********************************************************************************************************/
/**********************************************************************************************************/
/***************************************OPERATIONAL REGULAR BLOCKS*****************************************/
/**********************************************************************************************************/

Blockly.HardwareGenerator.processDefaultBlock = function(block) {
    var translatedObj = {};
    appendBlockFields(translatedObj, block);
    return translatedObj;
};

Blockly.HardwareGenerator.math_number = function(block) {
    var containerObj = {};
    containerObj.block_type = "math_number";
    containerObj.value = block.toString();
    return containerObj;
};

Blockly.HardwareGenerator.text = function(block) {
    var containerObj = {};
    containerObj.block_type = "text";
    containerObj.value = block.toString();
    return containerObj;
};

Blockly.HardwareGenerator.functions_list = function(block) {
    var fieldsObj = block.createFieldsObject();
    
    var functionObj = {};
    functionObj.block_type = fieldsObj.block_type;
    functionObj.type = fieldsObj.type;
    
    functionObj.functionsList = [];
    for(var i=0; i < fieldsObj.functionsList.length; i++) {
        var translatedBlock = Blockly.HardwareGenerator.blockToCode(fieldsObj.functionsList[i]);
        functionObj.functionsList.push(translatedBlock);       
    }
    
    return functionObj;
};































