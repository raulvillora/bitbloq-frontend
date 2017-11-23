/***************************************************************************************************************************************************************/
/* Name: colonyPicking.js																																	   */
/* Developer: Jes�s Irimia																																	   */
/* Function: Special function of electrophoresis. Include special inputs for the electrophoresis function.						                                   */	
/*																																							   */
/*																																				               */
/***************************************************************************************************************************************************************/		
/***************************************************************************************************************************************************************/
Blockly.Blocks['colonyPicking'] = {
	
	init: function() {
		/*Usual initialization of a common block*/
		this.setInputsInline(false);
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setColour(120);
		
		//Creating inputs.
		this.appendDummyInput("COLONYPICKING")
			.setAlign(Blockly.ALIGN_CENTRE)
			.appendField("COLONY PICKING","blockTitle");  
		
		this.setTooltip('');
		
		this.appendValueInput("source")
		    .setCheck("containerCheck")
		    .setAlign(Blockly.ALIGN_RIGHT)
		    .appendField("container source");
		    
		this.appendValueInput("destination")
		    .setCheck("containerCheck")
		    .setAlign(Blockly.ALIGN_RIGHT)
		    .appendField("container destination");
		        
		this.appendDummyInput()
		    .setAlign(Blockly.ALIGN_RIGHT)
		    .appendField("minimum colony count")
		    .appendField(new Blockly.FieldTextInput("---"), "MINIMUCOLONYCOUNT");

		addTimeAttributes(this, false);
		
	},

	createFieldsObject : function() {
		fieldsObject = {}
		appendTimeSettings(fieldsObject, this);

		fieldsObject["block_type"] = this.type;

		fieldsObject["minimum_colony_count"] = this.getFieldValue("MINIMUCOLONYCOUNT");
		fieldsObject["source"] = this.getInputTargetBlock("source");	
		fieldsObject["destination"] = this.getInputTargetBlock("destination");
		return fieldsObject;
	},
	
	//This is the extract of the code in JSON which is called by the Blockly.JavaScript['incubate1'] function 
	optionsDisplay_ : function(code, block) {
		var currentBlock = block;  //local variable created to don't modify continuously another the first variable.
		var currentCode = code;   //local variable created to don't modify continuously another the first variable.
		
		if(this.getFieldValue('MINIMUCOLONYCOUNT')!=null){
			currentCode= currentCode + '                "minimum_colony_count": " ' +this.getFieldValue("MINIMUCOLONYCOUNT");
		}	
		return currentCode;
	},
	//This is the extract of the code in JSON which is called by the Blockly.JavaScript['incubate1'] function 
	optionsDisplay_naturalLanguage : function(code, block) {
		var currentBlock = block;  //local variable created to don't modify continuously another the first variable.
		var currentCode = code;   //local variable created to don't modify continuously another the first variable.
		
		if(this.getFieldValue('MINIMUCOLONYCOUNT')!=null){
			currentCode= currentCode + 'and with minimum colony count ' +this.getFieldValue("MINIMUCOLONYCOUNT") ;
		}	
		currentCode += naturalLanguageTime(this) + ".\n";
		return currentCode;
	},
	onchange: function() {
		var blockSource = this.getInputTargetBlock('source') //Get the block set in the source
    	if(blockSource!=null){
			var isList1 = blockSource.getInput('contListOption');
        	if(isList1){ 
	        	blockSource.setParent(null);//Remove the parent of its own parameters
				var dx = Blockly.SNAP_RADIUS * (blockSource.RTL ? -1 : 1);//calculate the movement of the block in x axis
			    var dy = Blockly.SNAP_RADIUS * 2;//calculate the movement of the block in x axis
			    blockSource.moveBy(dx, dy); //Move the block with the measures gotten.
        	}else if(blockSource!=null){
	        	if(blockSource.getFieldValue('container_type_global')<200 || blockSource.getFieldValue('container_type_global')>300){//If it is  a list 
	        		blockSource.setParent(null);//Remove the parent of its own parameters
					var dx = Blockly.SNAP_RADIUS * (blockSource.RTL ? -1 : 1);//calculate the movement of the block in x axis
				    var dy = Blockly.SNAP_RADIUS * 2;//calculate the movement of the block in x axis
				    blockSource.moveBy(dx, dy); //Move the block with the measures gotten.
			    }
    		}
		}
		var blockDestination = this.getInputTargetBlock('destination') //Get the block set in the source
    	if(blockDestination!=null){
			var isList1 = blockDestination.getInput('contListOption');
        	if(isList1){ //Check if it is a list
	        	blockDestination.setParent(null);//Remove the parent of its own parameters
				var dx = Blockly.SNAP_RADIUS * (blockDestination.RTL ? -1 : 1);//calculate the movement of the block in x axis
			    var dy = Blockly.SNAP_RADIUS * 2;//calculate the movement of the block in x axis
			    blockDestination.moveBy(dx, dy); //Move the block with the measures gotten.		
        	}else if(blockDestination!=null){
	        	if(blockDestination.getFieldValue('container_type_global')==201){//If it is  a list 
	        		blockDestination.setParent(null);//Remove the parent of its own parameters
					var dx = Blockly.SNAP_RADIUS * (blockDestination.RTL ? -1 : 1);//calculate the movement of the block in x axis
				    var dy = Blockly.SNAP_RADIUS * 2;//calculate the movement of the block in x axis
				    blockDestination.moveBy(dx, dy); //Move the block with the measures gotten.
			    }
    		}
		}
		
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

