/***************************************************************************************************************************************************************/
/* Name: thermocycling.js																																	   */
/* Developer: Jes�s Irimia																																	   */
/* Function: Special function of thermocycling.. Include special inputs for the thermocycling. function.						                                   */	
/*																																							   */
/*				 																																               */
/***************************************************************************************************************************************************************/		
/***************************************************************************************************************************************************************/
Blockly.Blocks['thermocycling'] = {
	
	init: function() {
		/*Usual initialization of a common block*/
		this.setInputsInline(false);
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setColour(120);
		
		//Creating inputs.
		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_CENTRE)
			.appendField("THERMOCYCLING", "blockTitle");
		this.setTooltip('');
		
		this.appendValueInput("source")
		    .setCheck("containerCheck")
		    .setAlign(Blockly.ALIGN_RIGHT)
		    .appendField("container input");
		
		this.appendValueInput("CYCLES")
			.setCheck(["Variable", "Number"])
		    .setAlign(Blockly.ALIGN_RIGHT)
		    .appendField("cycles");
		
		addTimeAttributes(this, false);          
	},

	createFieldsObject : function() {
		fieldsObject = {}
		appendTimeSettings(fieldsObject, this);

		fieldsObject["block_type"] = this.type;

		fieldsObject["cycles"] = this.getInputTargetBlock("CYCLES");
		fieldsObject["source"] = this.getInputTargetBlock("source");	
		
		return fieldsObject;
	},
	
	optionsDisplay_ : function(code, block) { //This is the extract of the code in JSON which is called by the Blockly.JavaScript['pipette'] function 
		var currentBlock = block; //local variable created to don't modify continuously another the first variable.
		var currentCode = code;  //local variable created to don't modify continuously another the first variable.
		//alert("HEHRH");
		/*Special thermocycling*/
				
		if( currentBlock.getFieldValue('steps')!=null){
			currentCode= currentCode + '                "groups": [{\n                    "cycles": ' + this.getFieldValue('CYCLES')+',\n                    "steps: [{\n'
			for( var i=0; i<currentBlock.getFieldValue('steps');i++){//Loop which switch the number of wells update the fill the corr3ect number of blanks 
				currentCode= currentCode + '                             "duration": " ' +currentBlock.getFieldValue("duration"+i) +'", \n'	
				currentCode= currentCode + '                             "temperature": " ' +currentBlock.getFieldValue("temperature"+i) +'"\n                    },{ \n'
			}
			currentCode = currentCode.substring(0,currentCode.length-5);
			currentCode = currentCode + '}]\n                  }]\n';
		}
		return currentCode;
		
	},
	optionsDisplay_naturalLanguage : function(code, block) { //This is the extract of the code in JSON which is called by the Blockly.JavaScript['pipette'] function 
		var currentBlock = block; //local variable created to don't modify continuously another the first variable.
		var currentCode = code;  //local variable created to don't modify continuously another the first variable.
		//alert("HEHRH");
		/*Special thermocycling*/
		
		if( currentBlock.getFieldValue('steps')!=null){
			currentCode= currentCode + ' with ' + this.getInputTargetBlock('CYCLES')+' cycles with the following steps:'
			for( var i=0; i<currentBlock.getFieldValue('steps');i++){//Loop which switch the number of wells update the fill the corr3ect number of blanks 
				currentCode= currentCode +" step "+ (i+1) +': duration ' +currentBlock.getFieldValue("duration"+i) +currentBlock.getFieldValue("duration_units"+i);	
				currentCode= currentCode + ' and ' +currentBlock.getFieldValue("temperature"+i) + currentBlock.getFieldValue("temperature_units"+i);
			}
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


