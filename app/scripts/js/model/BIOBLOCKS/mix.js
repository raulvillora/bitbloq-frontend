/***************************************************************************************************************************************************************/
/* Name: mix.js																																	   */
/* Developer: Vishal Gupta(mine)and Jesus
/* Function: Special function of mix. Include special inputs for the mix function.						                                   */	
/*																																							   */
/*																																				               */
/***************************************************************************************************************************************************************/		
/***************************************************************************************************************************************************************/
Blockly.Blocks.mix = {

    init: function() {
        var me = this;
        
        /*Usual initialization of a common block*/
        this.setInputsInline(false);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour(120);

        //Creating inputs.
        this.appendDummyInput("MIX")
            .setAlign(Blockly.ALIGN_CENTRE)
            .appendField("MIX", "blockTitle");

        this.setTooltip('');

        this.appendValueInput("source")
            .setCheck("containerCheck")
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField("container input");

        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Type")
            .appendField(new Blockly.FieldDropdown([["Vortex", "1"], ["Shake", "2"]]), "Mix_Type");

        this.appendValueInput("Mix_Speed")
            .setCheck(["Number", "Variable"])
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Speed")
            .appendField(makeUnitsDropDown("frequency"), "Mix_Speed_units");
        
        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Set temperature ?")
            .appendField(new Blockly.FieldCheckbox('TRUE', function(value) {me.toogleHeatInput(value);}), "heat_checbox");
        
        this.appendValueInput("Heat")
            .setCheck(["Number", "Variable"])
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Temperature")
            .appendField(makeUnitsDropDown("temperature"), "Heat_units");

        addTimeAttributes(this, true);

    },
    
    toogleHeatInput : function(visisble) {
        this.getInput('Heat').setVisible(visisble);
        this.render();
    },

    createFieldsObject : function() {
        fieldsObject = {};
        appendTimeSettings(fieldsObject, this);

        fieldsObject.block_type = this.type;

        fieldsObject.type = this.getFieldValue("Mix_Type");
        fieldsObject.mix_speed = this.getInputTargetBlock("Mix_Speed");
        fieldsObject.mix_speed_units = this.getFieldValue("Mix_Speed_units");
        fieldsObject.source = this.getInputTargetBlock("source");
        fieldsObject.heat_checbox = this.getFieldValue("heat_checbox");
        fieldsObject.heat = this.getInputTargetBlock("Heat");
        fieldsObject.heat_units = this.getFieldValue("Heat_units");

        return fieldsObject;
    },

    onchange: function() {
        var blockSource = this.getInputTargetBlock('source');//Get the block set in the source
        if(blockSource!=null){
            var isList1 = blockSource.getInput('contListOption');
            if(isList1){ //Check if it is a list
                var currentBlock;
                for(var i=1;i<blockSource.getFieldValue('contListOptionValue')+1;i++){/*Iterate over all inputs in the list*/
                    var chain='contListOptionValueNum'+i;//Name of the current block
                    currentBlock = blockSource.getInputTargetBlock(chain);//Current block got with chain
                    if(currentBlock!=null){
                        if( currentBlock.getFieldValue('container_type_global')>100){//If it is  AGAROSE
                            currentBlock.setParent(null);//Remove the parent of its own parameters
                            var dx = Blockly.SNAP_RADIUS * (currentBlock.RTL ? -1 : 1);//calculate the movement of the block in x axis
                            var dy = Blockly.SNAP_RADIUS * 2;//calculate the movement of the block in x axis
                            currentBlock.moveBy(dx, dy); //Move the block with the measures gotten.						
                        }
                    }
                }
            }else if(blockSource!=null){
                if(blockSource.getFieldValue('container_type_global')>100){//If it is  a list 
                    blockSource.setParent(null);//Remove the parent of its own parameters
                    var dx2 = Blockly.SNAP_RADIUS * (blockSource.RTL ? -1 : 1);//calculate the movement of the block in x axis
                    var dy2 = Blockly.SNAP_RADIUS * 2;//calculate the movement of the block in x axis
                    blockSource.moveBy(dx2, dy2); //Move the block with the measures gotten.
                }
            }
        }
    },

    //This is the extract of the code in JSON which is called by the Blockly.JavaScript['mix1'] function 
    optionsDisplay_ : function(code, block) {
        var currentBlock = block;  //local variable created to don't modify continuously another the first variable.
        var currentCode = code;   //local variable created to don't modify continuously another the first variable.

        if( this.getFieldValue('timeOfOperation')!=null){ //If the option "SPEED" is displayed in this moment in the container block connected:
            currentCode= currentCode + '                "time of operation: " ' +this.getFieldValue("timeOfOperation") +'", \n';  // Write the next code added to the first code.
        }
        if(this.getFieldValue('Mix_Type')!=null){
            currentCode= currentCode + '                "Mix_Type: " ' +this.getFieldValue("Mix_Type") +'", \n';
        }	

        if(this.getFieldValue('Mix_Speed')!=null){
            currentCode= currentCode + '                "speed": " ' +this.getFieldValue("Mix_Speed") +'", \n';
        }
        if(this.getFieldValue('DURATION')!=null){
            currentCode= currentCode + '                 "duration": " ' +this.getFieldValue("DURATION")+':'+this.getFieldValue("Unit_Time") +'"\n';
        }
        return currentCode;
    },
    
    optionsDisplay_naturalLanguage: function(code, block) {
        var currentBlock = block;  //local variable created to don't modify continuously another the first variable.
        var currentCode = code;   //local variable created to don't modify continuously another the first variable.

        if(this.getFieldValue('Mix_Type')!=null){
            currentCode= currentCode + ', Type of mixing ' +this.getFieldValue("Mix_Type") + " " ;
        }	
        if(this.getInputTargetBlock('Mix_Speed')!=null){
            currentCode= currentCode + 'at speed ' + this.getInputTargetBlock("Mix_Speed") + this.getFieldValue("Mix_Speed_units");
        }
        currentCode += naturalLanguageTime(this) + ".\n";
        return currentCode;
    },

    mutationToDom: function() {
        var container = document.createElement('mutation');
        mutationToDomTime(container, this);
        
        var setTemperature = this.getFieldValue("heat_checbox");
        container.setAttribute("heat_checbox", setTemperature);
        return container;
    },

    domToMutation: function(xmlElement) {
        domToMutationTime(xmlElement, this);
        
        var setTemperature = xmlElement.getAttribute("heat_checbox");
        if (setTemperature != null && setTemperature == "FALSE") {
            this.getInput('Heat').setVisible(false);
        }
    }
};

