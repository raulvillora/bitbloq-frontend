(function () {
    'use strict';
 }());
//fucntion that updates the nodes category
function createNodesCategory(workspace) {
    var variableList = workspace.variableList;
    var xmlList = [];
    var button = goog.dom.createDom('button');
    button.setAttribute('text', 'Create part');
    button.setAttribute('callbackKey', 'CREATE_VARIABLE');

    workspace.registerButtonCallback('CREATE_VARIABLE', function(button) {
        Blockly.Variables.createVariable(button.getTargetWorkspace());
    });
    xmlList.push(button);

    var partCopyStr = '<xml>' +
        '<block type="part_copy">' +
        '</block>' +
        '</xml>';
    var partCopy = Blockly.Xml.textToDom(partCopyStr).firstChild;
    xmlList.push(partCopy);

    for (var i=0; i < variableList.length; i++) {
        var refenrenceBlockText = '<xml>' +
            '<block type="reference_node">' +
            '<field name="blockTitle">' + variableList[i] + '</field>' +
            '</block>' +
            '</xml>';
        var referenceBlock = Blockly.Xml.textToDom(refenrenceBlockText).firstChild;
        xmlList.push(referenceBlock);

        var configureBlockText = '<xml>' +
            '<block type="configure_node">' +
            '<field name="blockTitle">' + variableList[i] + '</field>' +
            '</block>' +
            '</xml>';
        var configureBlock = Blockly.Xml.textToDom(configureBlockText).firstChild;
        xmlList.push(configureBlock);
    }
    return xmlList;
}

var COLOUR_REFERENCE = '#00A1F1';
var COLOUR_CONFIGURE = '#00A1F1';


Blockly.Blocks.reference_node = {
    init : function() {
        this.setColour(COLOUR_REFERENCE);

        this.setOutput('Reference');

        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_CENTRE)
            .appendField(new Blockly.FieldVariable(), 'blockTitle');
    },

    createFieldsObject : function() {
        var blockObj = {};

        blockObj.block_type = this.type;
        blockObj.reference = this.getFieldValue('blockTitle');
        return blockObj;
    }
};

var ACEPTED_CONTAINER_EXTRAFUNCTIONS = [ 
    'Stirer', 
    'Centrifugator', 
    'Shaker', 
    'OD_sensor', 
    'Fluorescence_sensor', 
    'Temperature_sensor', 
    'Volume_sensor', 
    'Luminiscence_sensor', 
    'Heater', 
    'Ligth',
    'Electrophorer',
    'FunctionList'];

var ACEPTED_PUMP_FUNCTIONS = 'Pump';
var ACEPTED_VALVE_FUNCTIONS = 'Valve';
var ACEPTED_OPENCONTAINER_FUNCTIONS = 'OpenContainer';
var ACEPTED_CLOSECONTAINER_FUNCTIONS = 'CloseContainer';

Blockly.Blocks.configure_node = {
    actual_number_ports : 0,
    actual_number_twins : 0,

    ports_in : [],
    ports_out : [],

    lastFunctionBlock : null,

    init : function() {
        var me = this;

        this.setColour(COLOUR_CONFIGURE);

        this.setNextStatement(true);
        this.setPreviousStatement(true);

        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_CENTRE)
            .appendField(new Blockly.FieldLabel('Configure'))
            .appendField(new Blockly.FieldVariable('unknow'), 'blockTitle');

        var typeOptions = [['Open container', 'OPEN_CONTAINER'], 
                           ['Close container', 'CLOSE_CONTAINER'],
                           ['Pump', 'PUMP'],
                           ['Valve', 'VALVE']];

        this.appendDummyInput()
            .appendField('Type')
            .appendField(new Blockly.FieldDropdown(typeOptions, function(type) {
            if (type === 'OPEN_CONTAINER') {
                me.getInput('functions').setCheck(ACEPTED_OPENCONTAINER_FUNCTIONS);
                me.addExtraFunctions_();
            } else if (type === 'CLOSE_CONTAINER') {
                me.getInput('functions').setCheck(ACEPTED_CLOSECONTAINER_FUNCTIONS);
                me.addExtraFunctions_();
            } else if (type === 'PUMP') {
                me.getInput('functions').setCheck(ACEPTED_PUMP_FUNCTIONS);
                me.removeExtraFunctions_();
            } else if (type === 'VALVE') {
                me.getInput('functions').setCheck(ACEPTED_VALVE_FUNCTIONS);
                me.removeExtraFunctions_();
            }
        }),'type');

        this.appendValueInput('functions')
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField('Plugins')
            .setCheck(ACEPTED_OPENCONTAINER_FUNCTIONS);

        this.addExtraFunctions_();
    },

    createFieldsObject : function() {
        var blockObj = {};

        blockObj.block_type = this.type;
        blockObj.reference = this.getFieldValue('blockTitle');
        blockObj.type = this.getFieldValue('type');
        blockObj.functions = this.getInputTargetBlock('functions');
        blockObj.extra_functions = this.getInputTargetBlock('extra_functions');
        blockObj.number_pins = this.actual_number_ports;
        blockObj.number_twins = this.actual_number_twins;

        //read ports
        var i = 1;
        var name = 'port' + i.toString();
        var actualPort = this.getInput(name);
        
        blockObj.in_ports = [];
        blockObj.out_ports = [];
        
        while (actualPort !== null) {
            blockObj[name] = this.getInputTargetBlock(name);

            if (this.getFieldValue(name + '_direction') === 'output') {
                blockObj.out_ports.push(i);        
            } else if (this.getFieldValue(name + '_direction') === 'input') {
                blockObj.in_ports.push(i);
            }

            i++;
            name = 'port' + i.toString();
            actualPort = this.getInput(name);
        }

        //read twins
        i = 1;
        name = 'twin' + i.toString();
        var actualTwin = this.getInput(name);

        while (actualTwin !== null) {
            blockObj[name] = this.getInputTargetBlock(name);

            i++;
            name = 'twin' + i.toString();
            actualTwin = this.getInput(name);
        }

        return blockObj;
    },

    onchange : function() {
        var functionBlock = this.getInputTargetBlock('functions');
        if (this.lastFunctionBlock !== functionBlock) {
            if (functionBlock !== null && 
                functionBlock.internalValues != null &&
                functionBlock.internalValues.inPorts !== null && functionBlock.internalValues.outPorts !== null)
            { 
                this.ports_in = functionBlock.internalValues.inPorts;
                this.ports_out = functionBlock.internalValues.outPorts;
            } else {
                this.ports_in = [];
                this.ports_out = [];
            }

            var numberOfPorts = functionBlock ? functionBlock.pinNumber : '0';
            this.update_ports_inputs_(numberOfPorts);

            var numberTwins = 0;
            if (functionBlock !== null && 
                functionBlock.internalValues !== null &&
                functionBlock.internalValues.twinsNumber !== null)
            { 
                numberTwins = functionBlock.internalValues.twinsNumber;
            }
            this.update_twins_inputs_(numberTwins);

            this.lastFunctionBlock = functionBlock;
        }

    },

    update_ports_inputs_ : function(numberPorts) {
        var delta = numberPorts - this.actual_number_ports;

        if (delta > 0) { //add more ports
            for(var i=0; i < delta; i++) {
                this.actual_number_ports ++;
                this.create_port_input_(this.actual_number_ports);
            }
        } else if (delta < 0) { //remove existing ports
            delta = delta * -1;
            for(var j=0; j < delta; j++) {
                this.delete_port_input_(this.actual_number_ports);
                this.actual_number_ports--;
            }
        }
    },

    create_port_input_ : function(portNumber) {
        var name = 'port' + portNumber.toString();

        if (this.ports_in.indexOf(portNumber) !== -1) { //is in port
            this.appendValueInput(name)
                .appendField('Port ' + portNumber.toString())
                .appendField(new Blockly.FieldDropdown([['input', 'input']]), name + '_direction')
                .setCheck('Reference');    
        } else if (this.ports_out.indexOf(portNumber) !== -1) { //is out port
            this.appendValueInput(name)
                .appendField('Port ' + portNumber.toString())
                .appendField(new Blockly.FieldDropdown([['output', 'output']]), name + '_direction')
                .setCheck('Reference');    
        } else {
            this.appendValueInput(name)
                .appendField('Port ' + portNumber.toString())
                .appendField(new Blockly.FieldDropdown([['output', 'output'],['input', 'input']]), name + '_direction')
                .setCheck('Reference');    
        }
    },

    delete_port_input_ : function(portNumber) {
        this.removeInput('port' + portNumber.toString());
    },

    update_twins_inputs_ : function(numberTwins) {
        var delta = numberTwins - this.actual_number_twins;

        if (delta > 0) { //add more twins
            for(var i=0; i < delta; i++) {
                this.actual_number_twins ++;
                this.create_twin_input_(this.actual_number_twins);
            }
        } else if (delta < 0) { //remove existing twins
            delta = delta * -1;
            for(var j=0; j < delta; j++) {
                this.delete_twin_input_(this.actual_number_twins);
                this.actual_number_twins--;
            }
        }    
    },

    create_twin_input_ : function(twinNumber) {
        var name = 'twin' + twinNumber.toString();
        this.appendValueInput(name)
            .appendField('Twin ' + twinNumber.toString())
            .setCheck('Reference');    
    },

    delete_twin_input_ : function(twinNumber) {
        this.removeInput('twin' + twinNumber.toString());    
    },

    addExtraFunctions_ : function() {
        if (this.getInput('extra_functions') === null) {
            this.appendValueInput('extra_functions')
                .setAlign(Blockly.ALIGN_RIGHT)
                .appendField('Extra Plugins')
                .setCheck(ACEPTED_CONTAINER_EXTRAFUNCTIONS);
        }
    },

    removeExtraFunctions_ : function() {
        if (this.getInput('extra_functions') !== null) {
            this.removeInput('extra_functions');
        }    
    },

    mutationToDom: function() {
        var container = document.createElement('mutation');
        container.setAttribute('type', this.getFieldValue('type'));
        container.setAttribute('pin_number', this.actual_number_ports);
        container.setAttribute('twin_number', this.actual_number_twins);
        container.setAttribute('ports_in', this.ports_in);
        container.setAttribute('ports_out', this.ports_out);
        return container;
    },

    domToMutation: function(xmlElement) {
        var type = xmlElement.getAttribute('type');

        if (type == 'OPEN_CONTAINER') {
            this.getInput('functions').setCheck(ACEPTED_OPENCONTAINER_FUNCTIONS);
            this.addExtraFunctions_();
        } else if (type == 'CLOSE_CONTAINER') {
            this.getInput('functions').setCheck(ACEPTED_CLOSECONTAINER_FUNCTIONS);
            this.addExtraFunctions_();
        } else if (type == 'PUMP') {
            this.getInput('functions').setCheck(ACEPTED_PUMP_FUNCTIONS);
            this.removeExtraFunctions_();
        } else if (type == 'VALVE') {
            this.getInput('functions').setCheck(ACEPTED_VALVE_FUNCTIONS);
            this.removeExtraFunctions_();
        }
        
        this.ports_in = xmlElement.getAttribute('ports_in');
        this.ports_out = xmlElement.getAttribute('ports_out');
        
        var pinNumber = xmlElement.getAttribute('pin_number');
        this.update_ports_inputs_(pinNumber);

        var twinNumber = xmlElement.getAttribute('twin_number');
        this.update_twins_inputs_(twinNumber);
    }
};