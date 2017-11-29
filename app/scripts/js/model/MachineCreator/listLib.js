var MAX_CONTAINERLIST = 12;

/***************************************************************************************************************************************************************/
/***** NUMBER LIST ******************************************************************************************************************************************/
/***************************************************************************************************************************************************************/

Blockly.Blocks.number_list = {

	init: function() {
        var me = this;
		
		this.setInputsInline(true);
		this.setColour("#5B67A5");
		this.setTooltip('');
		this.quantity=2;	
		this.previousAmount=2;
		this.setOutput(true, "ListNumber");
		this.previousParent = null;
		
		/*Dropdown menu to choose the number of block that we want atach to some function*/
		var dropdownNumbers = [];
		for(var i=2; i <= MAX_CONTAINERLIST; i++) {
			dropdownNumbers.push([i.toString(), i.toString()]);
		} 

		var dropdownQuantity = new Blockly.FieldDropdown(dropdownNumbers, function(optionQ) {
			var contListOptionValueLocal = optionQ;		
			var variables = me.updateNumberType_(contListOptionValueLocal);
		});
		this.appendDummyInput("contListOption")
			.appendField("NUMBER LIST")
			.appendField(dropdownQuantity, 'contListOptionValue');
		/*Input for atach JUST a container. Just one for default*/	
		this.appendValueInput('contListOptionValueNum1')
			.setCheck("Number");
		this.appendValueInput('contListOptionValueNum2')
			.setCheck("Number");
		
	},

	createFieldsObject : function() {
		var fieldsObj = {};

		fieldsObj.block_type = "number_list";

		fieldsObj.containerList = [];
		var numberBlocks = parseInt(this.getFieldValue("contListOptionValue"));
		for(var i = 1; i <= numberBlocks; i++) {
			var actualInputBlock =  this.getInputTargetBlock("contListOptionValueNum" + i);
			if (actualInputBlock != null) {
				var translatedBlock = {};
                translatedBlock.block_type = "math_number";
                translatedBlock.value = actualInputBlock.toString();
				fieldsObj.containerList.push(translatedBlock);
			}
		}
		return fieldsObj;
	},
	
    /*Function to updatethe number of blocks we are able to atach in the list of blocks*/
    /*It works just removing the needed blocks, not removing all and regenerating, because this would detach automatically the container blocks in the list*/	
	updateNumberType_ : function(contListOptionValueLocal){
		this.quantity=Number(contListOptionValueLocal);
		
		if(this.quantity<this.previousAmount){/*if actual choice is less than previous choice, then REMOVE*/
			for (i=0;i<(this.previousAmount-this.quantity);i++){
					var chain = 'contListOptionValueNum'+(this.previousAmount-i); //Variable created to access the input and be able to remove it.
					this.removeInput(chain);
				}
		}else if(this.quantity>this.previousAmount){/*if actual choice is more than previous choice, then CREATE*/
			for (i = 0; i < (this.quantity-this.previousAmount); i++){
				var chain2='contListOptionValueNum'+(this.previousAmount+1+i);
				this.appendValueInput(chain2)
					.setCheck("Number");
			}
			
		}	
		this.previousAmount=this.quantity;// This variable is to store the CURRENT value, and use it in the next call of the function. 
	},
		
	/*This function is called when we copy or save this block*/
	mutationToDom: function() {
		var container = document.createElement('mutation');//Creating a element which name is "mutation" where save the parameters of the array
		
        var listSize = this.getFieldValue("contListOptionValue");
        container.setAttribute("list_size", listSize);
		return container;//return the container to the xml document created ach time we copy or save the block.
		
	},

	/*This function is called when we paste or load the block.*/
	domToMutation: function(xmlElement) {
		if(xmlElement.getAttribute("list_size") != null){
			var listSize = xmlElement.getAttribute('list_size');
            this.setFieldValue(listSize, "contListOptionValue");
            this.updateNumberType_(listSize);
		}
		this.previousParent = this.getParent();
	}
};

/***************************************************************************************************************************************************************/
/***** TEXT LIST ******************************************************************************************************************************************/
/***************************************************************************************************************************************************************/

Blockly.Blocks.text_list = {

	init: function() {
		
		/*Usual initialization of a common block*/
		this.setInputsInline(true);
		this.setColour("#5BA58C");
		this.setTooltip('');
		this.quantity=2;	
		this.previousAmount=2;
		this.setOutput(true, "ListString");
		this.previousParent = null;
		
		/*Dropdown menu to choose the number of block that we want atach to some function*/
		var dropdownNumbers = [];
		for(var i=2; i <= MAX_CONTAINERLIST; i++) {
			dropdownNumbers.push([i.toString(), i.toString()]);
		} 

		var dropdownQuantity = new Blockly.FieldDropdown(dropdownNumbers, function(optionQ) {
			var contListOptionValueLocal = optionQ;		
			var variables = this.sourceBlock_.updateNumberType_(contListOptionValueLocal);
		});
		this.appendDummyInput("contListOption")
			.appendField("STRING LIST")
			.appendField(dropdownQuantity, 'contListOptionValue');
		/*Input for atach JUST a container. Just one for default*/	
		this.appendValueInput('contListOptionValueNum1')
			.setCheck("String");
		this.appendValueInput('contListOptionValueNum2')
			.setCheck("String");
		
	},

	createFieldsObject : function() {
		var fieldsObj = {};

		fieldsObj.block_type = "number_list";

		fieldsObj.containerList = [];
		var numberBlocks = parseInt(this.getFieldValue("contListOptionValue"));
		for(var i = 1; i <= numberBlocks; i++) {
			var actualInputBlock =  this.getInputTargetBlock("contListOptionValueNum" + i);
			if (actualInputBlock != null) {
				var translatedBlock = {};
                translatedBlock.block_type = "text";
                translatedBlock.value = actualInputBlock.toString();
				fieldsObj.containerList.push(translatedBlock);
			}
		}
		return fieldsObj;
	},
	
    /*Function to updatethe number of blocks we are able to atach in the list of blocks*/
    /*It works just removing the needed blocks, not removing all and regenerating, because this would detach automatically the container blocks in the list*/	
	updateNumberType_ : function(contListOptionValueLocal){
		this.quantity=Number(contListOptionValueLocal);
		
		if(this.quantity<this.previousAmount){/*if actual choice is less than previous choice, then REMOVE*/
			for (i=0;i<(this.previousAmount-this.quantity);i++){
					var chain = 'contListOptionValueNum'+(this.previousAmount-i); //Variable created to access the input and be able to remove it.
					this.removeInput(chain);
				}
		}else if(this.quantity>this.previousAmount){/*if actual choice is more than previous choice, then CREATE*/
			for (i = 0; i < (this.quantity-this.previousAmount); i++){
				var chain2='contListOptionValueNum'+(this.previousAmount+1+i);
				this.appendValueInput(chain2)
					.setCheck("String");
			}
			
		}	
		this.previousAmount=this.quantity;// This variable is to store the CURRENT value, and use it in the next call of the function. 
	},
	
	/*This function is called when we copy or save this block*/
	mutationToDom: function() {
		var container = document.createElement('mutation');//Creating a element which name is "mutation" where save the parameters of the array
		
        var listSize = this.getFieldValue("contListOptionValue");
        container.setAttribute("list_size", listSize);
		return container;//return the container to the xml document created ach time we copy or save the block.
		
	},

	/*This function is called when we paste or load the block.*/
	domToMutation: function(xmlElement) {
		if(xmlElement.getAttribute("list_size") != null){
			var listSize = xmlElement.getAttribute('list_size');
            this.setFieldValue(listSize, "contListOptionValue");
            this.updateNumberType_(listSize);
		}
		this.previousParent = this.getParent();
	}
};

/***************************************************************************************************************************************************************/
/***** FUNCTIONS LIST ******************************************************************************************************************************************/
/***************************************************************************************************************************************************************/
var TYPES_ACEPTED = [ "Stirer", 
                     "Centrifugator", 
                     "Shaker", 
                     "OD_sensor", 
                     "Fluorescence_sensor", 
                     "Temperature_sensor", 
                     "Volume_sensor", 
                     "Luminiscence_sensor", 
                     "Heater", 
                     "Ligth",
                     "Electrophorer"];

Blockly.Blocks.functions_list = {

	init: function() {
		
		/*Usual initialization of a common block*/
		this.setInputsInline(true);
		this.setColour("#f65314");
		this.setTooltip('');
		this.quantity=2;	
		this.previousAmount=2;
		this.setOutput(true, "FunctionList");
		this.previousParent = null;
		
		/*Dropdown menu to choose the number of block that we want atach to some function*/
		var dropdownNumbers = [];
		for(var i=2; i <= MAX_CONTAINERLIST; i++) {
			dropdownNumbers.push([i.toString(), i.toString()]);
		} 

		var dropdownQuantity = new Blockly.FieldDropdown(dropdownNumbers, function(optionQ) {
			var contListOptionValueLocal = optionQ;		
			var variables = this.sourceBlock_.updateNumberType_(contListOptionValueLocal);
		});
		this.appendDummyInput("contListOption")
			.appendField("Plugin List")
			.appendField(dropdownQuantity, 'contListOptionValue');
		/*Input for atach JUST a container. Just one for default*/	
		this.appendValueInput('contListOptionValueNum1')
			.setCheck(TYPES_ACEPTED);
		this.appendValueInput('contListOptionValueNum2')
			.setCheck(TYPES_ACEPTED);	
		
	},

	createFieldsObject : function() {
		var fieldsObj = {};

		fieldsObj.block_type = "functions_list";
        fieldsObj.type = "functions_list";

		fieldsObj.functionsList = [];
		var numberBlocks = parseInt(this.getFieldValue("contListOptionValue"));
		for(var i = 1; i <= numberBlocks; i++) {
			var actualInputBlock =  this.getInputTargetBlock("contListOptionValueNum" + i);
			if (actualInputBlock != null) {
				fieldsObj.functionsList.push(actualInputBlock);
			}
		}
		return fieldsObj;
	},
	
    /*Function to updatethe number of blocks we are able to atach in the list of blocks*/
    /*It works just removing the needed blocks, not removing all and regenerating, because this would detach automatically the container blocks in the list*/	
	updateNumberType_ : function(contListOptionValueLocal){
		this.quantity=Number(contListOptionValueLocal);
		
		if(this.quantity<this.previousAmount){/*if actual choice is less than previous choice, then REMOVE*/
			for (i=0;i<(this.previousAmount-this.quantity);i++){
					var chain = 'contListOptionValueNum'+(this.previousAmount-i); //Variable created to access the input and be able to remove it.
					this.removeInput(chain);
				}
		}else if(this.quantity>this.previousAmount){/*if actual choice is more than previous choice, then CREATE*/
			for (i = 0; i < (this.quantity-this.previousAmount); i++){
				var chain2='contListOptionValueNum'+(this.previousAmount+1+i);
				this.appendValueInput(chain2)
					.setCheck(TYPES_ACEPTED);
			}
			
		}	
		this.previousAmount=this.quantity;// This variable is to store the CURRENT value, and use it in the next call of the function. 
	},
	
	/*This function is called when we copy or save this block*/
	mutationToDom: function() {
		var container = document.createElement('mutation');//Creating a element which name is "mutation" where save the parameters of the array
		
        var listSize = this.getFieldValue("contListOptionValue");
        container.setAttribute("list_size", listSize);
		return container;//return the container to the xml document created ach time we copy or save the block.
		
	},

	/*This function is called when we paste or load the block.*/
	domToMutation: function(xmlElement) {
		if(xmlElement.getAttribute("list_size") != null){
			var listSize = xmlElement.getAttribute('list_size');
            this.setFieldValue(listSize, "contListOptionValue");
            this.updateNumberType_(listSize);
		}
		this.previousParent = this.getParent();
	}
};