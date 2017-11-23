/***************************************************************************************************************************************************************/
/* Name: flashFreeze.js																																	   */
/* Developer: Jes�s Irimia																																	   */
/* Function: Special function of flashFreeze. Include special inputs for the electrophoresis function.						                                   */	
/*																																							   */
/*																																				               */
/***************************************************************************************************************************************************************/		
/***************************************************************************************************************************************************************/
Blockly.Blocks['flashFreeze'] = {
	
	init: function() {
		/*Usual initialization of a common block*/
		this.setInputsInline(false);
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setColour(120);
		
		//Creating inputs.
		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_CENTRE)
			.appendField("FLASH FREEZE", "blockTitle");
		
		this.setTooltip('');
		
		this.appendValueInput("source")
		    .setCheck("containerCheck")
		    .setAlign(Blockly.ALIGN_RIGHT)
		    .appendField("container input");
		    
		addTimeAttributes(this, true);
	},

	createFieldsObject : function() {
		fieldsObject = {}
		appendTimeSettings(fieldsObject, this);

		fieldsObject["block_type"] = this.type;

		fieldsObject["source"] = this.getInputTargetBlock("source");	
		return fieldsObject;
	},
	
	//This is the extract of the code in JSON which is called by the Blockly.JavaScript['incubate1'] function 
	optionsDisplay_ : function(code, block) {
		var currentBlock = block;  //local variable created to don't modify continuously another the first variable.
		var currentCode = code;   //local variable created to don't modify continuously another the first variable.
		
		return currentCode;
	},
	
	//This is the extract of the code in JSON which is called by the Blockly.JavaScript['incubate1'] function 
	optionsDisplay_naturalLanguage : function(code, block) {
		var currentBlock = block;  //local variable created to don't modify continuously another the first variable.
		var currentCode = code;   //local variable created to don't modify continuously another the first variable.
		
		currentCode += naturalLanguageTime(this) + ".\n";
		return currentCode;
	},

	onchange: function() {
		var blockSource = this.getInputTargetBlock('source') //Get the block set in the source
    	if(blockSource!=null){
			var isList1 = blockSource.getInput('contListOption');
        	if(isList1){ //Check if it is a list
	        	var currentBlock
				for(var i=1;i<blockSource.getFieldValue('contListOptionValue')+1;i++){/*Iterate over all inputs in the list*/
					var chain='contListOptionValueNum'+i//Name of the current block
					currentBlock = blockSource.getInputTargetBlock(chain);//Current block got with chain
					if(currentBlock!=null){
						if( currentBlock.getFieldValue('container_type_global')==201){//If it is  AGAROSE
							currentBlock.setParent(null);//Remove the parent of its own parameters
							var dx = Blockly.SNAP_RADIUS * (currentBlock.RTL ? -1 : 1);//calculate the movement of the block in x axis
						    var dy = Blockly.SNAP_RADIUS * 2;//calculate the movement of the block in x axis
						    currentBlock.moveBy(dx, dy); //Move the block with the measures gotten.						
						}
					}
				}
        	}else if(blockSource!=null){
	        	if(blockSource.getFieldValue('container_type_global')==201){//If it is  a list 
	        		blockSource.setParent(null);//Remove the parent of its own parameters
					var dx = Blockly.SNAP_RADIUS * (blockSource.RTL ? -1 : 1);//calculate the movement of the block in x axis
				    var dy = Blockly.SNAP_RADIUS * 2;//calculate the movement of the block in x axis
				    blockSource.moveBy(dx, dy); //Move the block with the measures gotten.
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


	