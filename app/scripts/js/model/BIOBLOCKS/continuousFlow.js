/*
The MIT License (MIT)

Copyright (c) 2016 Universidad Polit�cnica de Madrid

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
Blockly.Blocks.continuous_flow = {
    init: function () {
        var me = this;

        /*Usual initialization of a common block*/
        this.setInputsInline(false);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour(120);

        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_CENTRE)
            .appendField("CONTINUOUS FLOW", "blockTitle");

        /*Dropdown menu to choose the behaviour of the pipette, and over all the particular displays in the container*/
        var dropdownType = new Blockly.FieldDropdown([["one to one", "1"], ["one to many", "2"], ["many to one", "3"], ["sequence", "4"]], 
                                                     function(option){
            var opNum = parseInt(option);
            me.updateTypeContinuosFlow_(opNum); 
        });
        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField(dropdownType, "continuosflow_type");

        addTimeAttributes(this, true);

        this.appendValueInput("source")
            .setCheck("containerCheck")
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Container Source");

        this.appendValueInput("destination")
            .setCheck("containerCheck")
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Container Destination");
    },

    createFieldsObject : function() {
        var translatedObj = {};
        appendTimeSettings(translatedObj, this);

        translatedObj.block_type = this.type;
        translatedObj.continuosflow_type = this.getFieldValue("continuosflow_type");
        translatedObj.source = this.getInputTargetBlock("source");	


        var type = parseInt(this.getFieldValue("continuosflow_type"));
        if (type == 4) {
            translatedObj.rate = this.getInputTargetBlock("rate");
            translatedObj.rate_volume_units = this.getFieldValue("rate_volume_units");
            translatedObj.rate_time_units = this.getFieldValue("rate_time_units");
        } else {
            translatedObj.destination = this.getInputTargetBlock("destination");    
        }

        return translatedObj;
    },

    optionsDisplay_: function (code, block) { //This is the extract of the code in JSON which is called by the Blockly.JavaScript['pipette'] function 

    },

    optionsDisplay_naturalLanguage: function (code, block) { //This is the extract of the code in JSON which is called by the Blockly.JavaScript['pipette'] function 

    },

    mutationToDom: function() {
        var container = document.createElement('mutation');
        mutationToDomTime(container, this);

        container.setAttribute("type", this.getFieldValue("continuosflow_type"));
        return container;
    },

    domToMutation: function(xmlElement) {
        domToMutationTime(xmlElement, this);

        var type = parseInt(xmlElement.getAttribute("type"));
        this.updateTypeContinuosFlow_(type);
    },

    updateTypeContinuosFlow_ : function(type) {
        switch(type) {
            case 1: {//one to one
                var sourceInput = this.getInput("source");
                sourceInput.setCheck("containerCheck");

                this.addDestination_();

                var destinationInput = this.getInput("destination");
                destinationInput.setCheck("containerCheck");
                break;
            } case 2: {//one to many
                var sourceInput2 = this.getInput("source");
                sourceInput2.setCheck("containerCheck");

                this.addDestination_();

                var destinationInput2 = this.getInput("destination");
                destinationInput2.setCheck("containerList");
                break;	
            } case 3: {//many to one
                var sourceInput3 = this.getInput("source");
                sourceInput3.setCheck("containerList");

                this.addDestination_();

                var destinationInput3 = this.getInput("destination");
                destinationInput3.setCheck("containerCheck");
                break;
            } case 4: {//sequence
                var sourceInput4 = this.getInput("source");
                sourceInput4.setCheck(["containerList"]);

                this.removeDestination_();

                break;
            } default: {
                console.error("unknow continuos flow type: " + type);
            }
                   }    
    },

    removeDestination_ : function() {
        if (this.getInput("destination") != null) {
            this.removeInput("destination");
        }

        if(this.getInput("rate") == null) {
            this.appendValueInput("rate")
                .setCheck(["Number", "Variable"])
                .setAlign(Blockly.ALIGN_RIGHT)
                .appendField("rate")
                .appendField(makeUnitsDropDown("volume"), "rate_volume_units")
                .appendField("/")
                .appendField(makeUnitsDropDown("time"), "rate_time_units");
        }
    },

    addDestination_ : function() {
        if (this.getInput("destination") == null) {
            this.appendValueInput("destination")
                .setCheck("containerCheck")
                .setAlign(Blockly.ALIGN_RIGHT)
                .appendField("Container Destination");
        }

        if(this.getInput("rate") != null) {
            this.removeInput("rate");
        }
    }
};



















