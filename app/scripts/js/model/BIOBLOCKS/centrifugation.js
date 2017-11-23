/***************************************************************************************************************************************************************/
/* Name: centrifugation.js																																	   */
/* Developer: Jes�s Irimia								 																									   */
/* Function: Special function of centrifugate. Include special inputs for the centrifugate function.						                                   */	
/*																																							   */
/*																																				               */
/***************************************************************************************************************************************************************/		
/***************************************************************************************************************************************************************/
Blockly.Blocks['centrifugation'] = {

    init: function() {

        /*Usual initialization of a common block*/
        this.setInputsInline(false);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour(120);

        //Creating inputs.
        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_CENTRE)
            .appendField("CENTRIFUGATION", "blockTitle");
        this.setTooltip('');

        this.appendValueInput("source")
            .setCheck("containerCheck")
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField("container input");

        this.appendValueInput("SPEED")
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField("speed")
            .appendField(makeUnitsDropDown("frequency"), "SPEED_UNITS");

        this.appendValueInput("TEMPERATURE")
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField("Temperature")
            .appendField(makeUnitsDropDown("temperature"), "Unit_Temp");

        addTimeAttributes(this, true);          
    },

    createFieldsObject : function() {
        fieldsObject = {}
        appendTimeSettings(fieldsObject, this);

        fieldsObject["block_type"] = this.type;

        fieldsObject["speed"] = this.getInputTargetBlock("SPEED");
        fieldsObject["speed_units"] = this.getFieldValue("SPEED_UNITS");
        fieldsObject["temperature"] = this.getInputTargetBlock("TEMPERATURE");
        fieldsObject["temperature_units"] = this.getFieldValue("Unit_Temp");

        fieldsObject["source"] = this.getInputTargetBlock("source");	
        return fieldsObject;
    },

    //This is the extract of the code in JSON which is called by the Blockly.JavaScript['centrifugation'] function 	
    optionsDisplay_ : function(code, block) {
        var currentBlock = block; //local variable created to don't modify continuously another the first variable.
        var currentCode = code;  //local variable created to don't modify continuously another the first variable.

        if( this.getInputTargetValue('SPEED')!=null){ //If the option "SPEED" is displayed in this moment in the container block connected:
            currentCode= currentCode + '                 "speed": " ' +this.getInputTargetValue("SPEED") +'", \n';  // Write the next code added to the first code.
        }
        if(this.getFieldValue('TEMPERATURE')!=null){
            if(this.getFieldValue("Unit_Temp")=="celsius"){
                currentCode= currentCode + '                "temperature": "' +this.getFieldValue("TEMPERATURE")+':' +"celsius"+'", \n';
            }else{
                currentCode= currentCode + '                "temperature": "' +(Number(this.getFieldValue("TEMPERATURE"))+273)+':' +"Celsius";
            }
        }	
        return currentCode;
    },

    optionsDisplay_naturalLanguage : function(code, block) {
        var currentBlock = block; //local variable created to don't modify continuously another the first variable.
        var currentCode = code;  //local variable created to don't modify continuously another the first variable.

        if( this.getInputTargetBlock('SPEED')!=null){ //If the option "SPEED" is displayed in this moment in the container block connected:
            currentCode= currentCode + ' with speed ' +this.getInputTargetBlock("SPEED")+ this.getFieldValue("SPEED_UNITS") +', ';  // Write the next code added to the first code.
        }	
        if(this.getInputTargetBlock('TEMPERATURE')!=null){
            currentCode= currentCode + ', at temperature ' +this.getInputTargetBlock("TEMPERATURE") + " " + this.getFieldValue("Unit_Temp") + " " ;
        }
        currentCode += naturalLanguageTime(this) + ".\n";
        return currentCode;
    },

    mutationToDom: function() {
        var container = document.createElement('mutation');
        mutationToDomTime(container, this);
        return container;
    },

    domToMutation: function(xmlElement) {
        domToMutationTime(xmlElement, this);
    }
};



