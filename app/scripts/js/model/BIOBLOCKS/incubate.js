/***************************************************************************************************************************************************************/
/* Name: incubate.js																																	   */
/* Developer: Jes�s Irimia																																	   */
/* Function: Special function of incubate. Include special inputs for the incubate function.						                                   */	
/*																																							   */
/*																																				               */
/***************************************************************************************************************************************************************/		
/***************************************************************************************************************************************************************/
Blockly.Blocks.incubate = {
	
	init: function() {
		/*Usual initialization of a common block*/
		this.setInputsInline(false);
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setColour(120);
		
		//Creating inputs.
		this.appendDummyInput("INCUBATE")
			.setAlign(Blockly.ALIGN_CENTRE)
			.appendField("INCUBATE","blockTitle");
		this.setTooltip('');
		
		this.appendValueInput("source")
		    .setCheck("containerCheck")
		    .setAlign(Blockly.ALIGN_RIGHT)
		    .appendField("container input");
		    
		this.appendValueInput("TEMPERATURE")
		    .setAlign(Blockly.ALIGN_RIGHT)
		    .appendField("temperature")
			.setCheck(["Number", "Variable"])
		    .appendField(makeUnitsDropDown("temperature"), "Unit_Temp");

		this.appendValueInput("SHAKINGSPEED")
		    .setAlign(Blockly.ALIGN_RIGHT)
		    .appendField("shaking speed")
		    .setCheck(["Number", "Variable"])
			.appendField(makeUnitsDropDown("frequency"), "SHAKINGSPEED_UNITS");
		
		this.appendValueInput("C02PERCENT")
		    .setAlign(Blockly.ALIGN_RIGHT)
		    .appendField("CO2 percent");

		addTimeAttributes(this, true);
		            
	},

	createFieldsObject : function() {
		fieldsObject = {};
		appendTimeSettings(fieldsObject, this);

		fieldsObject.block_type = this.type;

		fieldsObject.temperature = this.getInputTargetBlock("TEMPERATURE");
		fieldsObject.temperature_units = this.getFieldValue("Unit_Temp");
		fieldsObject.shaking_speed = this.getInputTargetBlock("SHAKINGSPEED");
		fieldsObject.shaking_speed_units = this.getFieldValue("SHAKINGSPEED_UNITS");
		fieldsObject.c02_percent = this.getInputTargetBlock("C02PERCENT");
		fieldsObject.source = this.getInputTargetBlock("source");		
		return fieldsObject;
	},
	
	//This is the extract of the code in JSON which is called by the Blockly.JavaScript['incubate1'] function 
	optionsDisplay_ : function(code, block) {
		var currentBlock = block;  //local variable created to don't modify continuously another the first variable.
		var currentCode = code;   //local variable created to don't modify continuously another the first variable.
		
		if(this.getFieldValue('TEMPERATURE')!=null){
			if(this.getFieldValue("Unit_Temp")=="celsius"){
				currentCode= currentCode + '                "temperature": "' +this.getFieldValue("TEMPERATURE")+':' +"celsius"+'", \n';
			}else{
				currentCode= currentCode + '                "temperature": "' +(Number(this.getFieldValue("TEMPERATURE"))+273)+':' +"Celsius"+'", \n';
			}
		}	
		if(this.getFieldValue('SHAKINGSPEED')!=null){
			currentCode= currentCode + '                "shaking": " ' +this.getFieldValue("SHAKINGSPEED") +'", \n';
		}
		if(this.getFieldValue('C02PERCENT')!=null){
			currentCode= currentCode + '                "c02_percent": " ' +this.getFieldValue("C02PERCENT") +'"\n';
		}
		return currentCode;
	},

	optionsDisplay_naturalLanguage: function(code, block) {
		var currentBlock = block;  //local variable created to don't modify continuously another the first variable.
		var currentCode = code;   //local variable created to don't modify continuously another the first variable.
		
		if(this.getInputTargetBlock('TEMPERATURE')!=null){
			currentCode= currentCode + ', at temperature ' +this.getInputTargetBlock("TEMPERATURE") + " " + this.getFieldValue("Unit_Temp") + " " ;
		}	
		if(this.getInputTargetBlock('SHAKINGSPEED')!=null){
			currentCode= currentCode + 'with shaking speed ' + this.getInputTargetBlock("SHAKINGSPEED") +' ' + this.getFieldValue("SHAKINGSPEED_UNITS");
		}
		if(this.getInputTargetBlock('C02PERCENT')!=null){
			currentCode= currentCode + ' and with a c02 percent of ' +this.getInputTargetBlock("C02PERCENT") ;
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

