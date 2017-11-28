/***************************************************************************************************************************************************************/
/***** BLOCK CREATION ******************************************************************************************************************************************/
/***************************************************************************************************************************************************************/
'use strict';
var pumpColour = '#f65314';
var valveColour = '#f65314';
var addonColour = '#f65314';
var glasswareColour = '#f65314'

function createFunctionsBlock(plugins) {
    for (var i=0; i < plugins.length; i++) {
        if (plugins[i].name && plugins[i].superclass) {
            createBlock(plugins[i]);
        } else {
            console.error(i.toString() + ' plugin has no name or superclass property');
        }
    }
}

function fillInternalValues(objectToFill, internalValues) {
    for(var property in internalValues) {
        if (internalValues.hasOwnProperty(property)) {
            objectToFill[property] = internalValues[property];
        }
    }
}

function createBlock(plugin) {
    var type = plugin.superclass;

    if (type === 'Pump') {
        addPumpBlock(plugin);
    } else if (type === 'Valve') {
        addValveBlock(plugin);
    } else if (type === 'Stirer' || type === 'Centrifugator' || type === 'Shaker') {
        addCentrifugateShakeStirBlock(plugin);    
    } else if (type === 'OD_sensor') {
        addODSensorBlock(plugin);
    } else if (type === 'Fluorescence_sensor') {
        addFluorescenceSensorBlock(plugin);
    } else if (type === 'Heater') {
        addHeaterBlock(plugin);
    } else if (type === 'Ligth') {
        addLightBlock(plugin);
    } else if (type === 'Electrophorer') {
        addElectrophorerBlock(plugin);
    } else if (type === 'OpenContainer' || type === 'CloseContainer') {
        addContainerBlock(plugin);
    } else{ 
        addDeafultBlock(plugin);
    }
}

function addCommomProperties(block, plugin) {
    var tooltip = '';

    block.setInputsInline(false);
    block.setOutput(true, plugin.superclass);

    block.appendDummyInput()
        .setAlign(Blockly.ALIGN_CENTRE)
        .appendField(plugin.name, 'blockTitle');

    block.internalValues = {};

    if (plugin.pin_number) {
        block.pinNumber = plugin.pin_number;
        tooltip = tooltip + 'pin number: ' + plugin.pin_number.toString() + '\n';
    }

    block.internalValues.firmwareCompatible = [];
    if (plugin.firmware_compatible) {
        block.internalValues.firmwareCompatible = plugin.firmware_compatible;

        tooltip = tooltip + 'firmware compatible: ' + plugin.firmware_compatible.toString() + '\n';
    } else {
        console.error('empty firware_compatible field in plugin: ' + plugin.name);
    }

    block.internalValues.minVolume = -1;
    block.internalValues.minVolumeUnits = 'ml';
    if (plugin.min_volume !== null && plugin.min_volume_units !== null) {
        block.internalValues.minVolume = plugin.min_volume;
        block.internalValues.minVolumeUnits = plugin.min_volume_units;

        tooltip = tooltip + 'minimum volume: ' + plugin.min_volume.toString() +  plugin.min_volume_units + '\n';
    }

    if(plugin.in_ports !== null && plugin.out_ports !== null) {
        block.internalValues.inPorts = plugin.in_ports;
        block.internalValues.outPorts = plugin.out_ports;

        tooltip = tooltip + 'in_ports:' + plugin.in_ports.toString() + '\n';
        tooltip = tooltip + 'out_ports:' + plugin.out_ports.toString() + '\n';
    } else {
        block.internalValues.inPorts = null;
        block.internalValues.outPorts = null;
    }

    if (plugin.extra_params) {
        processParams(block, plugin.extra_params);
    } else {
        console.error('empty extra_params field in plugin: ' + plugin.name);
    }

    return tooltip;
}

function addPumpBlock(plugin) {
    Blockly.Blocks[plugin.name] = {
        reversible : false,

        init : function() {
            this.setColour(pumpColour);

            var tooltip = addCommomProperties(this, plugin);

            if (plugin.reversible !== null) {
                tooltip = tooltip + 'reversible:' + plugin.reversible.toString() + '\n';
                this.internalValues.reversible = plugin.reversible;
            } else {
                conosle.error('empty reversible field in plugin: ' + plugin.name);
            }

            if (plugin.continuous !== null) {
                this.internalValues.continuos = plugin.continuous;
                if (plugin.continuous === true) {

                    if (plugin.min_range !== null && 
                        plugin.min_range_volume_units !== null && 
                        plugin.min_range_time_units !== null &&
                        plugin.max_range !== null && 
                        plugin.max_range_volume_units !== null && 
                        plugin.max_range_time_units !== null)
                    {
                        tooltip = tooltip + 'minimum rate:' + plugin.min_range.toString() + plugin.min_range_volume_units + '/' + plugin.min_range_time_units + '\n';
                        tooltip = tooltip + 'maximum rate:' + plugin.max_range.toString() + plugin.max_range_volume_units + '/' + plugin.max_range_time_units + '\n';

                        this.internalValues.minRange = plugin.min_range;
                        this.internalValues.minRangeVolumeUnits = plugin.min_range_volume_units;
                        this.internalValues.minRangeTimeUnits = plugin.min_range_time_units;

                        this.internalValues.maxRange = plugin.max_range;
                        this.internalValues.maxRangeVolumeUnits = plugin.max_range_volume_units;
                        this.internalValues.maxRangeTimeUnits = plugin.max_range_time_units;
                    } else {
                        console.error('empty min or max: range, range_volume_units or range_time_units field in plugin: ' + plugin.name)
                    }

                    if(plugin.default_rate !== null && 
                       plugin.default_rate_volume_units !== null &&
                       plugin.default_rate_time_units !== null)
                    {
                        tooltip = tooltip + 'default rate:' + plugin.default_rate.toString() + plugin.default_rate_volume_units + '/' 
                            + plugin.default_rate_time_units + '\n';

                        this.internalValues.defaultRate = plugin.default_rate;
                        this.internalValues.defaultRateVolumeUnits = plugin.default_rate_volume_units;
                        this.internalValues.defaultRateTimeUnits = plugin.default_rate_time_units;
                    } else {
                        console.error('empty default_rate fields in plugin: ' + plugin.name);
                    }

                    if(plugin.min_range_step !== null && 
                       plugin.min_range_step_volume_units !== null &&
                       plugin.min_range_step_time_units !== null)
                    {
                        tooltip = tooltip + 'minimum range step:' + plugin.min_range_step.toString() + plugin.min_range_step_volume_units + '/' + 
                            plugin.min_range_step_time_units + '\n';

                        this.internalValues.minRangeStep = plugin.min_range_step;
                        this.internalValues.minRangeStepVolumeUnits = plugin.min_range_step_volume_units;
                        this.internalValues.minRangeStepTimeUnits = plugin.min_range_step_time_units;
                    } else {
                        console.error('empty min_range_step fields in plugin: ' + plugin.name);
                    }

                } else {
                    if (plugin.min_range !== null && 
                        plugin.min_range_units !== null && 
                        plugin.max_range !== null && 
                        plugin.max_range_units !== null)
                    {
                        tooltip = tooltip + 'minimum volume:' + plugin.min_range.toString() + plugin.min_range_units + '\n';
                        tooltip = tooltip + 'maximum volume:' + plugin.max_range.toString() + plugin.max_range_units + '\n';

                        this.internalValues.minRange = plugin.min_range;
                        this.internalValues.minRangeUnits = plugin.min_range_units;
                        this.internalValues.maxRange = plugin.max_range;
                        this.internalValues.maxRangeUnits = plugin.max_range_units;
                    } else {
                        console.error('empty min or max: min_range or min_range_units field in plugin: ' + plugin.name)
                    }

                    if(plugin.min_range_step !== null && 
                       plugin.min_range_step_units !== null)
                    {
                        tooltip = tooltip + 'minimum range step:' + plugin.min_range_step.toString() + plugin.min_range_step_units + '\n';

                        this.internalValues.minRangeStep = plugin.min_range_step;
                        this.internalValues.minRangeUnits = plugin.min_range_step_units;
                    } else {
                        console.error('empty min_range_step fields in plugin: ' + plugin.name);
                    }
                }
            } else {
                console.error('empty continuos field in plugin: ' + plugin.name);
            }

            if(plugin.decimal_precission !== null)
            {
                tooltip = tooltip + 'decimal precission:' + plugin.decimal_precission.toString() + '\n';
                this.internalValues.decimalPrecission = plugin.decimal_precission;
            } else {
                console.error('empty decimal_precission fields in plugin: ' + plugin.name);
            }

            this.setCommentText(tooltip);
        },

        createFieldsObject : function() {
            var blockObj = {};

            blockObj.block_type = this.type;
            blockObj.type = plugin.superclass;

            fillInternalValues(blockObj, this.internalValues);

            createParamsObj(this, blockObj);
            return blockObj;
        }
    };
};

function addValveBlock(plugin) {
    Blockly.Blocks[plugin.name] = {
        truthTable : null,

        init : function() {
            this.setColour(valveColour);

            var tooltip = addCommomProperties(this, plugin);

            if (plugin.truth_table !== null) {
                this.internalValues.truthTable = plugin.truth_table;

                var truthTableStr = 'truth table: \n' + parseTruthTable(plugin.truth_table) + '\n';
                tooltip = tooltip + truthTableStr;
            } else {
                console.error('empty truth_table field in plugin: ' + plugin.name);
            }

            if (plugin.number_twins !== null) {
                this.internalValues.twinsNumber = plugin.number_twins;
                tooltip += 'number_twins: ' + plugin.number_twins.toString() + '\n';
            }

            this.setCommentText(tooltip);
        },

        createFieldsObject : function() {
            var blockObj = {};

            blockObj.block_type = this.type;
            blockObj.type = plugin.superclass;

            fillInternalValues(blockObj, this.internalValues);

            createParamsObj(this, blockObj);

            return blockObj;
        }
    }
};

function addCentrifugateShakeStirBlock(plugin) {
    Blockly.Blocks[plugin.name] = {
        init : function() {
            this.setColour(addonColour);

            var tooltip = addCommomProperties(this, plugin);

            if (plugin.min_range !== null &&
                plugin.min_range_units !== null &&
                plugin.max_range !== null &&
                plugin.max_range_units !== null)
            {
                this.internalValues.minRange = plugin.min_range;
                this.internalValues.minRangeUnits = plugin.min_range_units;
                this.internalValues.maxRange = plugin.max_range;
                this.internalValues.maxRangeUnits = plugin.max_range_units;

                var minRangeStr = 'minimun working range: ' + plugin.min_range.toString() + plugin.min_range_units + '\n';
                var maxRangeStr = 'maximun working range: ' + plugin.max_range.toString() + plugin.max_range_units + '\n';
                tooltip = tooltip + minRangeStr;
                tooltip = tooltip + maxRangeStr;
            } else {
                console.error('empty range fields in plugin: ' + plugin.name);    
            }

            this.setCommentText(tooltip);
        },

        createFieldsObject : function() {
            var blockObj = {};

            blockObj.block_type = this.type;
            blockObj.type = plugin.superclass;

            fillInternalValues(blockObj, this.internalValues);

            createParamsObj(this, blockObj);

            return blockObj;
        }
    }
};

function addDeafultBlock(plugin) {
    Blockly.Blocks[plugin.name] = {
        init : function() {
            this.setColour(addonColour);

            var tooltip = addCommomProperties(this, plugin);
            this.setCommentText(tooltip);
        },

        createFieldsObject : function() {
            var blockObj = {};

            blockObj.block_type = this.type;
            blockObj.type = plugin.superclass;

            fillInternalValues(blockObj, this.internalValues);

            createParamsObj(this, blockObj);

            return blockObj;
        }
    }
};

function addODSensorBlock(plugin) {
    Blockly.Blocks[plugin.name] = {
        init : function() {
            this.setColour(addonColour);

            var tooltip = addCommomProperties(this, plugin);

            if (plugin.min_wavelength !== null &&
                plugin.min_wavelength_units !== null &&
                plugin.max_wavelength !== null &&
                plugin.max_wavelength_units !== null)
            {
                this.internalValues.minRange = plugin.min_wavelength;
                this.internalValues.minRangeUnits = plugin.min_wavelength_units;
                this.internalValues.maxRange = plugin.max_wavelength;
                this.internalValues.maxRangeUnits = plugin.max_wavelength_units;

                var minRangeStr = 'minimun wavelength: ' + plugin.min_wavelength.toString() + plugin.min_wavelength_units + '\n';
                var maxRangeStr = 'maximun wavelength: ' + plugin.max_wavelength.toString() + plugin.max_wavelength_units + '\n';
                tooltip = tooltip + minRangeStr;
                tooltip = tooltip + maxRangeStr;
            } else {
                console.error('empty range fields in plugin: ' + plugin.name);    
            }

            this.setCommentText(tooltip);
        },

        createFieldsObject : function() {
            var blockObj = {};

            blockObj.block_type = this.type;
            blockObj.type = plugin.superclass;

            fillInternalValues(blockObj, this.internalValues);

            createParamsObj(this, blockObj);

            return blockObj;
        }
    }   
};

function addFluorescenceSensorBlock(plugin) {
    Blockly.Blocks[plugin.name] = {
        init : function() {
            this.setColour(addonColour);

            var tooltip = addCommomProperties(this, plugin);

            if (plugin.min_emission !== null &&
                plugin.min_emission_units !== null &&
                plugin.max_emission !== null &&
                plugin.max_emission_units !== null)
            {
                this.internalValues.minEmission = plugin.min_emission;
                this.internalValues.minEmissionUnits = plugin.min_emission_units;
                this.internalValues.maxEmission = plugin.max_emission;
                this.internalValues.maxEmissionUnits = plugin.max_emission_units;


                var minEmissionStr = 'minimun emission: ' + plugin.min_emission.toString() + plugin.min_emission_units + '\n';
                var maxEmissionStr = 'maximun emission: ' + plugin.max_emission.toString() + plugin.max_emission_units + '\n';
                tooltip = tooltip + minEmissionStr;
                tooltip = tooltip + maxEmissionStr;
            } else {
                console.error('empty range emission fields in plugin: ' + plugin.name);      
            }

            if (plugin.min_excitation !== null &&
                plugin.min_excitation_units !== null &&
                plugin.max_excitation !== null &&
                plugin.max_excitation_units !== null)
            {
                this.internalValues.minExcitation = plugin.min_excitation;
                this.internalValues.minExcitationUnits = plugin.min_excitation_units;
                this.internalValues.maxExcitation = plugin.max_excitation;
                this.internalValues.maxExcitationUnits = plugin.max_excitation_units;

                var minExcitationStr = 'minimun excitation: ' + plugin.min_excitation.toString() + plugin.min_excitation_units + '\n';
                var maxExcitationStr = 'maximun excitation: ' + plugin.max_excitation.toString() + plugin.max_excitation_units + '\n';
                tooltip = tooltip + minExcitationStr;
                tooltip = tooltip + maxExcitationStr;
            } else {
                console.error('empty range excitation fields in plugin: ' + plugin.name);      
            }

            this.setCommentText(tooltip);
        },

        createFieldsObject : function() {
            var blockObj = {};

            blockObj.block_type = this.type;
            blockObj.type = plugin.superclass;

            fillInternalValues(blockObj, this.internalValues);

            createParamsObj(this, blockObj);

            return blockObj;
        }
    }      
};

function addHeaterBlock(plugin) {
    Blockly.Blocks[plugin.name] = {
        init : function() {
            this.setColour(addonColour);

            var tooltip = addCommomProperties(this, plugin);

            if (plugin.min_temperature !== null &&
                plugin.min_temperature_units !== null &&
                plugin.max_temperature !== null &&
                plugin.max_temperature_units !== null)
            {
                this.internalValues.minRange = plugin.min_temperature;
                this.internalValues.minRangeUnits = plugin.min_temperature_units;
                this.internalValues.maxRange = plugin.max_temperature;
                this.internalValues.maxRangeUnits = plugin.max_temperature_units;

                var minRangeStr = 'minimun temperature: ' + plugin.min_temperature.toString() + plugin.min_temperature_units + '\n';
                var maxRangeStr = 'maximun temperature: ' + plugin.max_temperature.toString() + plugin.max_temperature_units + '\n';
                tooltip = tooltip + minRangeStr;
                tooltip = tooltip + maxRangeStr;
            } else {
                console.error('empty range temperature fields in plugin: ' + plugin.name);     
            }

            this.setCommentText(tooltip);
        },

        createFieldsObject : function() {
            var blockObj = {};

            blockObj.block_type = this.type;
            blockObj.type = plugin.superclass;

            fillInternalValues(blockObj, this.internalValues);

            createParamsObj(this, blockObj);

            return blockObj;
        }
    }   
};

function addLightBlock(plugin) {
    Blockly.Blocks[plugin.name] = {
        init : function() {
            this.setColour(addonColour);

            var tooltip = addCommomProperties(this, plugin);

            if (plugin.min_wavelength !== null &&
                plugin.min_wavelength_units !== null &&
                plugin.max_wavelength !== null &&
                plugin.max_wavelength_units !== null)
            {
                this.internalValues.minWavelength = plugin.min_wavelength;
                this.internalValues.minWavelengthUnits = plugin.min_wavelength_units;
                this.internalValues.maxWavelength = plugin.max_wavelength;
                this.internalValues.maxWavelengthUnits = plugin.max_wavelength_units;

                var minWavelengthStr = 'minimun wavelength: ' + plugin.min_wavelength.toString() + plugin.min_wavelength_units + '\n';
                var maxWavelengthStr = 'maximun wavelength: ' + plugin.max_wavelength.toString() + plugin.max_wavelength_units + '\n';
                tooltip = tooltip + minWavelengthStr;
                tooltip = tooltip + maxWavelengthStr;
            } else {
                console.error('empty range wavelength fields in plugin: ' + plugin.name);     
            }

            if (plugin.min_intensity !== null &&
                plugin.min_intensity_units !== null &&
                plugin.max_intensity !== null &&
                plugin.max_intensity_units !== null)
            {
                this.internalValues.minIntensity = plugin.min_intensity;
                this.internalValues.minIntensityUnits = plugin.min_intensity_units;
                this.internalValues.maxIntensity = plugin.max_intensity;
                this.internalValues.maxIntensityUnits = plugin.max_intensity_units;

                var minIntensityStr = 'minimun intensity: ' + plugin.min_intensity.toString() + plugin.min_intensity_units + '\n';
                var maxIntensityStr = 'maximun intensity: ' + plugin.max_intensity.toString() + plugin.max_intensity_units + '\n';
                tooltip = tooltip + minIntensityStr;
                tooltip = tooltip + maxIntensityStr;
            } else {
                console.error('empty range intensity fields in plugin: ' + plugin.name);    
            }

            this.setCommentText(tooltip);
        },

        createFieldsObject : function() {
            var blockObj = {};

            blockObj.block_type = this.type;
            blockObj.type = plugin.superclass;

            fillInternalValues(blockObj, this.internalValues);

            createParamsObj(this, blockObj);

            return blockObj;
        }
    }
};

function addElectrophorerBlock(plugin) {
    Blockly.Blocks[plugin.name] = {
        init : function() {
            this.setColour(addonColour);

            var tooltip = addCommomProperties(this, plugin);

            if (plugin.min_efield !== null &&
                plugin.min_efield_units !== null &&
                plugin.max_efield !== null &&
                plugin.max_efield_units !== null)
            {
                this.internalValues.minRange = plugin.min_efield;
                this.internalValues.minRangeEFieldUnits = plugin.min_efield_units;
                this.internalValues.minRangeLengthUnits = plugin.min_length_units;

                this.internalValues.maxRange = plugin.max_efield;
                this.internalValues.maxRangeEFieldUnits = plugin.max_efield_units;
                this.internalValues.maxRangeLengthUnits = plugin.max_length_units;

                var minRangeStr = 'minimun electric field: ' + plugin.min_efield.toString() + plugin.min_efield_units + '\n';
                var maxRangeStr = 'maximun electric field: ' + plugin.max_efield.toString() + plugin.max_efield_units + '\n';
                tooltip = tooltip + minRangeStr;
                tooltip = tooltip + maxRangeStr;
            } else {
                console.error('empty range e-field fields in plugin: ' + plugin.name);     
            }

            this.setCommentText(tooltip);
        },

        createFieldsObject : function() {
            var blockObj = {};

            blockObj.block_type = this.type;
            blockObj.type = plugin.superclass;

            createParamsObj(this, blockObj);

            fillInternalValues(blockObj, this.internalValues);

            return blockObj;
        }
    }
};

function addContainerBlock(plugin) {
    Blockly.Blocks[plugin.name] = {
        init : function() {
            this.setInputsInline(false);
            this.setOutput(true, plugin.superclass);

            this.setColour(glasswareColour);

            this.appendDummyInput()
                .setAlign(Blockly.ALIGN_CENTRE)
                .appendField(plugin.name, 'blockTitle');

            var tooltip = '';
            this.internalValues = {};

            if (plugin.pin_number) {
                this.pinNumber = plugin.pin_number;
                tooltip = tooltip + 'pin number: ' + plugin.pin_number.toString() + '\n';
            } else {
                console.error('empty pin_number fields in plugin: ' + plugin.name);
            }

            this.internalValues.minVolume = -1;
            this.internalValues.minVolumeUnits = 'ml';
            if (plugin.min_volume !== null && plugin.min_volume_units !== null) {
                this.internalValues.minVolume = plugin.min_volume;
                this.internalValues.minVolumeUnits = plugin.min_volume_units;

                tooltip = tooltip + 'minimum volume: ' + plugin.min_volume.toString() +  plugin.min_volume_units + '\n';
            } else {
                console.error('empty range min_volume fields in plugin: ' + plugin.name);
            }

            this.internalValues.maxVolume = -1;
            this.internalValues.maxVolumeUnits = 'ml';
            if (plugin.max_volume !== null && plugin.max_volume_units !== null) {
                this.internalValues.maxVolume = plugin.max_volume;
                this.internalValues.maxVolumeUnits = plugin.max_volume_units;

                tooltip = tooltip + 'maximum volume: ' + plugin.max_volume.toString() +  plugin.max_volume_units + '\n';
            } else {
                console.error('empty range max_volume fields in plugin: ' + plugin.name);
            }

            if(plugin.in_ports !== null && plugin.out_ports !== null) {
                this.internalValues.inPorts = plugin.in_ports;
                this.internalValues.outPorts = plugin.out_ports;

                tooltip = tooltip + 'in_ports:' + plugin.in_ports.toString() + '\n';
                tooltip = tooltip + 'out_ports:' + plugin.out_ports.toString() + '\n';
            } else {
                this.internalValues.inPorts = null;
                this.internalValues.outPorts = null;
            }

            this.setCommentText(tooltip);
        },  

        createFieldsObject : function() {
            var blockObj = {};

            blockObj.block_type = this.type;
            blockObj.type = plugin.superclass;

            fillInternalValues(blockObj, this.internalValues);

            return blockObj;
        }
    }
};

/***************************************************************************************************************************************************************/
/***** MISCELANEOUS ******************************************************************************************************************************************/
/***************************************************************************************************************************************************************/

function processParams(block, params) {
    for(var i=0; i < params.length; i++) {
        var name = params[i].name;
        var type = processType(params[i].type);

        if (type) {
            block.appendValueInput('param' + i.toString())
                .setAlign(Blockly.ALIGN_RIGHT)
                .setCheck(type)
                .appendField(name,'name' + i.toString());
        }
    }
};

function processType(type) {
    var processedType = null;
    if (type.startsWith('[') && type.endsWith(']')) {
        var listType = type.substring(1,type.length - 1).trim();
        processedType = 'List' + processType(listType);    
    } else if (type === 'int') {
        processedType = 'Number';
    } else if (type === 'string') {
        processedType = 'String';
    } else {
        console.error('unknow param type ' + type);
    }
    return processedType;
}

function parseTruthTable(truthTable) {
    var tableStr = '{';
    for(var i=0; i < truthTable.length; i++) {
        var pos = truthTable[i].position;
        var connectedPins = truthTable[i].connected_pins;

        var cnPinsStr = '[';
        for(var j=0; j < connectedPins.length; j++) {
            var cnPinElem = connectedPins[j];

            var cnPinElemStr = '[';
            for(var k=0; k < cnPinElem.length; k++) {
                cnPinElemStr = cnPinElemStr + cnPinElem[k].toString();
                if (i !== cnPinElem.length - 1) {
                    cnPinElemStr = cnPinElemStr + ',';
                }
            }
            cnPinElemStr = cnPinElemStr + ']';

            cnPinsStr = cnPinsStr + cnPinElemStr;
            if (j !== connectedPins.length - 1) {
                cnPinsStr = cnPinsStr + ',';
            }
        }
        cnPinsStr = cnPinsStr + ']';

        var rowStr = 'position: ' + pos.toString() + ', connected_pins: ' + cnPinsStr + '\n';
        tableStr = tableStr + rowStr;
    }
    tableStr = tableStr + '}';
    return tableStr;
};

function createParamsObj(block, obj2Append) {
    var i = 0;
    var paramStr = 'param' + i.toString();
    var paramBlock = block.getInput(paramStr);

    while(paramBlock !== null) {
        var nameStr = 'name' +i.toString(); 

        obj2Append[nameStr] = block.getFieldValue(nameStr);
        obj2Append['value' + i.toString()] = block.getInputTargetBlock(paramStr);

        i++;
        paramStr = 'param' + i.toString();
        paramBlock = block.getInput(paramStr);
    }
    obj2Append.paramsNumber = i;
};
























