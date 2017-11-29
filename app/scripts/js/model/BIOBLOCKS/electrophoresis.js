/***************************************************************************************************************************************************************/
/* Name: electrophoresis.js																																	   */
/* Developer: Jes�s Irimia																																	   */
/* Function: Special function of electrophoresis. Include special inputs for the electrophoresis function.						                                   */	
/*																																							   */
/*														 																						               */
/***************************************************************************************************************************************************************/		
/***************************************************************************************************************************************************************/
Blockly.Blocks.electrophoresis = {
	
	init: function() {
		/*Usual initialization of a common block*/
		this.setInputsInline(false);
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setColour(120);
		
		//Creating inputs.
		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_CENTRE)
			.appendField("ELECTROPHORESIS","blockTitle");
			
		this.setTooltip('');
		
		this.appendValueInput("source")
		    .setCheck("containerCheck")
		    .setAlign(Blockly.ALIGN_RIGHT)
		    .appendField("container input");
		    
		this.appendDummyInput()
		    .setAlign(Blockly.ALIGN_RIGHT)
		    .appendField("ladder")
		    .appendField(new Blockly.FieldTextInput("---"), "LADDER");

		this.appendValueInput("FIELDSTRENGTH")
			.setCheck(["Number", "Variable"])
		    .setAlign(Blockly.ALIGN_RIGHT)
		    .appendField("field strength")
			.appendField(makeUnitsDropDown("electricPotential"), "FIELDSTRENGTH_UNITS_V")
			.appendField("/")
			.appendField(makeUnitsDropDown("length"), "FIELDSTRENGTH_UNITS_L");
		
		this.appendValueInput("DATAREFERENCE")
		    .setAlign(Blockly.ALIGN_RIGHT)
			.setCheck("Variable")
	    	.appendField("data reference");

		addTimeAttributes(this, true);
		           
	},

	createFieldsObject : function() {
		fieldsObject = {};
		appendTimeSettings(fieldsObject, this);

		fieldsObject.block_type = this.type;

		fieldsObject.ladder = this.getFieldValue("LADDER");

		fieldsObject.field_strength = this.getInputTargetBlock("FIELDSTRENGTH");
		
		fieldsObject.field_strength_units_v = this.getFieldValue("FIELDSTRENGTH_UNITS_V");
		fieldsObject.field_strength_units_l = this.getFieldValue("FIELDSTRENGTH_UNITS_L");

		fieldsObject.data_reference =  this.getInputTargetBlock("DATAREFERENCE");
		fieldsObject.source = this.getInputTargetBlock("source");	
		
		return fieldsObject;
	},

	//This is the extract of the code in JSON which is called by the Blockly.JavaScript['pipette'] function 
	optionsDisplay_ : function(code, block) {
		var currentBlock = block; //local variable created to don't modify continuously another the first variable.
		var currentCode = code;  //local variable created to don't modify continuously another the first variable.
		
		if( this.getFieldValue('LADDER')!=null){
			currentCode= currentCode + '                 "ladder": " ' +this.getFieldValue("LADDER") +'", \n';
		}
		if( this.getFieldValue('FIELDSTRENGTH')!=null){
			currentCode= currentCode + '                 "field_strength": " ' +this.getFieldValue("FIELDSTRENGTH") +'", \n';
		}
		if(this.getInputTargetBlock('DATAREFERENCE')!=null){
			currentCode= currentCode + '                 "dataref": " ' +this.getInputTargetBlock("DATAREFERENCE").getFieldValue('NUM') +'", \n';
		}
		return currentCode;
	},
	//This is the extract of the code in JSON which is called by the Blockly.JavaScript['pipette'] function 
	optionsDisplay_naturalLanguage : function(code, block) {
		var currentBlock = block; //local variable created to don't modify continuously another the first variable.
		var currentCode = code;  //local variable created to don't modify continuously another the first variable.
		
		if( this.getFieldValue('LADDER')!=null){
			currentCode= currentCode + ', with a ladder '+ this.getFieldValue("LADDER");
		}
		if( this.getInputTargetBlock('FIELDSTRENGTH')!=null){
			currentCode= currentCode + ', with field strength ' + this.getInputTargetBlock("FIELDSTRENGTH") + this.getFieldValue("FIELDSTRENGTH_UNITS_V") + "/" + this.getFieldValue("FIELDSTRENGTH_UNITS_L");
		}
		if(this.getInputTargetBlock('DATAREFERENCE')!=null){
			currentCode= currentCode + ', and a dataref ' + this.getInputTargetBlock("DATAREFERENCE").toString();
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


	