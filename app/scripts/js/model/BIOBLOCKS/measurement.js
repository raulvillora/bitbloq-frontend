/***************************************************************************************************************************************************************/
/* Name: measurement.js																																	   */
/* Developer: Jes�s Irimia																																	   */
/* Function: Special function of measure. Include special inputs for the measurement function.						                                   */	
/*																																							   */
/*																																				               */
/***************************************************************************************************************************************************************/		
/***************************************************************************************************************************************************************/
function addWaveLengthField(block) {
	block.appendValueInput("wavelengthnum")
		.setCheck(["Number","Variable"])
		.setAlign(Blockly.ALIGN_RIGHT)
		.appendField("wavelength num")
		.appendField(makeUnitsDropDown("length"), "wavelengthnum_units");
}

function setMeasurementBlockToCommonState(block) {
	if(block.getInput('wavelengthnum') != null) {
		block.removeInput('wavelengthnum');
	}
	
	if(block.getInput('excitation') != null) {
		block.removeInput('excitation');
	}
	
	if(block.getInput('emission') != null){
		block.removeInput('emission');
	}
}

function addExcitationEmissionFields(block) {
	block.appendValueInput("excitation")
		.setCheck(["Number","Variable"])
		.setAlign(Blockly.ALIGN_RIGHT)
		.appendField("excitation")
		.appendField(makeUnitsDropDown("length"), "excitation_units");

	block.appendValueInput("emission")
		.setCheck(["Number","Variable"])
		.setAlign(Blockly.ALIGN_RIGHT)
		.appendField("emission")
		.appendField(makeUnitsDropDown("length"), "emission_units");
}


/*Definition of the object which contains all the arrays of measure parameters*/
var measurementObject = {};
/*Start the mesaurement Block*/
Blockly.Blocks.measurement = {
	
	init: function() {//Function to initialize the block
		/*Creating LOCAL array for this measurement block*/
		var measurementArray={};
		measurementArray.id=this.id; 
		measurementObject[this.id]=measurementArray; //It adds the LOCAL array in the GLOBAL object with the key "id".
		
		/*Usual initialization of a common block*/
		this.setInputsInline(false);
		this.setPreviousStatement(true);
		this.setNextStatement(true);
		this.setColour(120);
		
		//Creating inputs.
		this.appendDummyInput("MEASUREMENT")
			.setAlign(Blockly.ALIGN_CENTRE)
			.appendField("MEASUREMENT", "blockTitle");
			
		this.setTooltip('');
		
		var dropdownType = new Blockly.FieldDropdown([["Absorbance", "1"], ["Fluorescence", "2"], ["Luminiscence", "3"], ["Volume", "4"], ["Temperature", "5"]], function(option){
			var measurementType = option;
			this.sourceBlock_.updateType_(measurementType);
		});
		
		this.appendDummyInput("DDMeasurement")
			.appendField("Measurement Type")
			.appendField(dropdownType, 'parameters');
		 
		this.appendValueInput("source")
		    .setCheck("containerCheck")
		    .setAlign(Blockly.ALIGN_RIGHT)
		    .appendField("Container Input");

		this.appendValueInput("FREQUENCYOFMEASUREMENT")
		    .setAlign(Blockly.ALIGN_RIGHT)
			.setCheck(["Number","Variable"])
		    .appendField("Measurement Frequency")
			.appendField(makeUnitsDropDown("frequency"), "unit_frequency");

		this.appendValueInput("data_reference")
			.setCheck(["Variable"])
			.setAlign(Blockly.ALIGN_RIGHT)
		    .appendField("Data Reference");
		    //.appendField(new Blockly.FieldTextInput("---"), "DATAREFERENCE");

		addWaveLengthField(this);
		addTimeAttributes(this, true);
	},

	createFieldsObject : function() {
		fieldsObject = {};
		appendTimeSettings(fieldsObject, this);

		fieldsObject.block_type = this.type;

		fieldsObject.measurement_type = this.getFieldValue("parameters");
		fieldsObject.measurement_frequency = this.getInputTargetBlock("FREQUENCYOFMEASUREMENT");
		fieldsObject.unit_frequency = this.getFieldValue("unit_frequency");
		fieldsObject.data_reference = this.getInputTargetBlock("data_reference");
		fieldsObject.source = this.getInputTargetBlock("source");	

		if (this.getInput("wavelengthnum") != null) {
			fieldsObject.wavelengthnum = this.getInputTargetBlock("wavelengthnum");
			fieldsObject.wavelengthnum_units = this.getFieldValue("wavelengthnum_units");
		}

		if(this.getInput("excitation") != null) {
			fieldsObject.excitation	= this.getInputTargetBlock("excitation");
			fieldsObject.excitation_units = this.getFieldValue("excitation_units");
		}

		if(this.getInput("emission") != null) {
			fieldsObject.emission	= this.getInputTargetBlock("emission");
			fieldsObject.emission_units = this.getFieldValue("emission_units");
		}
		return fieldsObject;
	},

/****************************************************************************************************************************************************************/		
/****************************************************************************************************************************************************************/	
	/*This is a particular function of JS*/
	/*each change appeared in the workspace/context call to this function*/
	/*we are using it to set the shape, display parameters and similar matter*/
/****************************************************************************************************************************************************************/		
/****************************************************************************************************************************************************************/	
	onchange : function(){
		var myId = this.id;//we get our id, to locate us in the global array.
		myId=myId.toString();
		var currentArray=measurementObject[myId]; // We get access to the global array, and assign this array in the currentArray to work with a extern array. In this way we don't need access each change.
		
		var measurementtype=this.getFieldValue('parameters');
		switch (measurementtype){  //JS function to structure better the if-else sentences
			case'1':  //absorbance
				/*Save in the array object the fields if they were modified*/
				if ( this.getInputTargetBlock('wavelengthnum') != null){
					currentArray.wavelengthnum=this.getInputTargetBlock('wavelengthnum').toString();//If the input exists set the current value of this input.
				}
				
			break;
			case'2':  //fluorescence
				if ( this.getInputTargetBlock('excitation') != null){		
					currentArray.excitation=this.getInputTargetBlock('excitation').toString();
				}
				if ( this.getInputTargetBlock('emission') != null){
					currentArray.emission=this.getInputTargetBlock('emission').toString();
				}
				
			break;
			case'3':  //luminiscence
				
			break;
		}
	},
	//Function called from the dropdown menu to choose th different type of measure we want to do.
	updateType_ : function(measurementType){
		/*If exists some mutation input first is remove.*/
		setMeasurementBlockToCommonState(this);

		var myId = this.id;//we get our id, to locate us in the global array.
		myId=myId.toString();
		var currentArray=measurementObject[myId]; // We get access to the global array, and assign this array in the currentArray to work with a extern array. In this way we don't need access each change.

		
		switch (measurementType){   //JS function to structure better the if-else sentences
			case '1': //absorbance
				addWaveLengthField(this);
				break;
			case '2':  //fluorescence
				addExcitationEmissionFields(this);
				break;
			default:
			break;
			
		}
	},
	/****************************************************************************************************************************************************************/		
/****************************************************************************************************************************************************************/
	/*This function is called when we copy or save this block*/
	mutationToDom: function() {
		
		var container = document.createElement('mutation');//Creating a element which name is "mutation"
		container.setAttribute("parameters",this.getFieldValue("parameters"));
		
		var myId = this.id;//we get our id, to locate us in the global array.
		myId=myId.toString();
		var currentArray=measurementObject[myId];// We get access to the global array, and assign this array in the currentArray to work with a extern array. In this way we don't need access each change.
		
		if(currentArray.hasOwnProperty('wavelengthnum')){  //if exists the variable in the object 
			container.setAttribute("wavelengthnum",currentArray.wavelengthnum); //save in the container element
		}
		if(currentArray.hasOwnProperty('excitation')){
			container.setAttribute("excitation",currentArray.excitation);
		}
		if(currentArray.hasOwnProperty('emission')){
			container.setAttribute("emission",currentArray.emission);
		}

		mutationToDomTime(container, this);
		return container;
	},
/****************************************************************************************************************************************************************/		
/****************************************************************************************************************************************************************/
	/*This function is called when we paste or load the block.*/
	domToMutation: function(xmlElement) {
		
		var myId = this.id;//we get our id, to locate us in the global array.
		myId=myId.toString();
		var currentArray=measurementObject[myId];// We get access to the global array, and assign this array in the currentArray to work with a extern array. In this way we don't need access each change.
				
		if(xmlElement.getAttribute('wavelengthnum')!=null){
			currentArray.wavelengthnum=xmlElement.getAttribute("wavelengthnum");//If the input exists set the current value of this input.
		}
		
		if(xmlElement.getAttribute('excitation')!=null){
			currentArray.excitation=xmlElement.getAttribute("excitation");//If the input exists set the current value of this input.
		}
		if(xmlElement.getAttribute('emission')!=null){
			currentArray.emission=xmlElement.getAttribute("emission");//If the input exists set the current value of this input.
		}
		
		this.updateType_(xmlElement.getAttribute('parameters'));

		domToMutationTime(xmlElement, this);
	},
	
	optionsDisplay_ : function(code, block) { //This is the extract of the code in JSON which is called by the Blockly.JavaScript['pipette'] function 
		var currentBlock = block;  //local variable created to don't modify continuously another the first variable.
		var currentCode = code;   //local variable created to don't modify continuously another the first variable.
		
		if( this.getFieldValue('timeOfOperation')!=null){ //If the option "SPEED" is displayed in this moment in the container block connected:
			currentCode= currentCode + '                "time of operation" : " ' +this.getFieldValue("timeOfOperation") +'", \n';  // Write the next code added to the first code.
		}
		if( this.getFieldValue('DATAREFERENCE')!=null){ //If the option "SPEED" is displayed in this moment in the container block connected:
			currentCode= currentCode + '                "dataref: " ' +this.getFieldValue("DATAREFERENCE") +'", \n';  // Write the next code added to the first code.
		}
		if(this.getFieldValue('DURATION')!=null){
			currentCode= currentCode + '                 "duration": " ' +this.getFieldValue("DURATION")+':'+this.getFieldValue("Unit_Time") +'", \n';
		}
		if(this.getFieldValue('FREQUENCYOFMEASUREMENT')!=null){
			currentCode= currentCode + '                "frequency measurement": " ' +this.getFieldValue("FREQUENCYOFMEASUREMENT") + ":" + this.getFieldValue("unit_frequency") + '", \n';
		}	
		if(this.getFieldValue('wavelengthnum')!=null){
			currentCode= currentCode + '                "wavelength": " ' +this.getFieldValue("wavelengthnum") +'", \n';
		}
		if(this.getFieldValue('excitation')!=null){
			currentCode= currentCode + '                "excitation": " ' +this.getFieldValue("excitation") +'", \n';
		}	
		if(this.getFieldValue('emission')!=null){
			currentCode= currentCode + '                "emission": " ' +this.getFieldValue("emission") +'" \n';
		}
		
		
		return currentCode;
	},
	optionsDisplay_naturalLanguage : function(code, block) { //This is the extract of the code in JSON which is called by the Blockly.JavaScript['pipette'] function 
		var currentBlock = block;  //local variable created to don't modify continuously another the first variable.
		var currentCode = code;   //local variable created to don't modify continuously another the first variable.
		
		if( this.getInputTargetBlock('data_reference')!=null){ //If the option "SPEED" is displayed in this moment in the container block connected:
			currentCode= currentCode + ', with dataref ' +this.getInputTargetBlock("data_reference").toString() ;  // Write the next code added to the first code.
		}
		if(this.getInputTargetBlock('wavelengthnum')!=null){
			currentCode= currentCode + ', with wavelength ' +this.getInputTargetBlock("wavelengthnum") + this.getFieldValue("wavelengthnum_units");
		}
		if(this.getInputTargetBlock('excitation')!=null){
			currentCode= currentCode + ', with excitation ' +this.getInputTargetBlock("excitation") + this.getFieldValue("excitation_units");
		}	
		if(this.getInputTargetBlock('emission')!=null){
			currentCode= currentCode + ', with emission ' +this.getInputTargetBlock("emission") + this.getFieldValue("emission_units") ;
		}
		
		if(this.getInputTargetBlock('FREQUENCYOFMEASUREMENT')!=null){
			currentCode= currentCode + ' and each ' + this.getInputTargetBlock("FREQUENCYOFMEASUREMENT") + this.getFieldValue("unit_frequency");
		}
		currentCode += naturalLanguageTime(this) + ".\n";
		return currentCode;
	},

	getFreqcuencyInSeconds : function() {
		var frecuency = Number(this.getFieldValue("FREQUENCYOFMEASUREMENT"));

		if (this.getFieldValue("unit_frequency") == "khz") {
			frecuency = frecuency * 1000;
		} else if (this.getFieldValue("unit_frequency") == "mhz") {
			frecuency = frecuency * 1000000;
		}

		return 1/frecuency;
	}
	
};





