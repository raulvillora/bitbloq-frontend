/**********************************************************************************************************/
/**********************************************************************************************************/
/***************************************OPERATIONAL REGULAR FUNCTION***************************************/
/**********************************************************************************************************/
/********************The most of the operational blocks use this function to write ************************/
/********************the intern natural languagecode2 because keep the same structure***********************/
/**********************************************************************************************************/
regularNaturalLanguageTranslation_ = function(code,block) {
    var currentExecutingBlock=block;
    var code2 = code2;
    //Loop to get the real number of container blocks connected to the centrifugation, because is the centrifugation that extract the info of each container block.
    var numberOfBlocks = 1;
    if(currentExecutingBlock.getInputTargetBlock('source') ){ //Get the block in the SOURCE input if exists
        blockSource = currentExecutingBlock.getInputTargetBlock('source');
        var isList = blockSource.getInput('contListOption');//Check if it is a list

        /*FOR LIST CASE*/
        if(isList){
            var substring='contListOptionValueNum';  //Substring to complete with the number of the position of each block.
            var j = 0;
            for(var i = 0; i < blockSource.getFieldValue('contListOptionValue'); i++){
                j++;
                var string = substring+j;  //Creating the complete srting of the input where there is a container block.
                var currentBlock = blockSource.getInputTargetBlock(string);
                if(currentBlock!=null){
                    code2= code2 + ' container ' +currentBlock.getFieldValue("containerName")+' ';
                    if (i+2 <= blockSource.getFieldValue('contListOptionValue')){
                        code2 = code2 + 'and ';
                    }
                }	
            }
            code2 = currentExecutingBlock.optionsDisplay_naturalLanguage(code2, currentBlock); //Call the function optionsDisplay_ which it exists in each function block, with their own parameters.
        }
        /*CASE NOT LIST*/
        else if ( numberOfBlocks == 1 && blockSource!=null){//If it exists child and it's just one.
            code2 = code2 + ' container ' + blockSource.getFieldValue("containerName") +' '; 
            code2 = currentExecutingBlock.optionsDisplay_naturalLanguage(code2, blockSource); //Call the function optionsDisplay_ which it exists in each function block, with their own parameters.
        }
    }
    code2 = code2 +".\n";
    return code2;	
};

/******************************************************************************************************** */
/**
 * Return the name of the actual equipment that does some block operation
 */
getEquipmentName = function(block_title) {
    if (block_title == "INCUBATE") {
        return "Incubator";
    } else {
        return block_title;
    }
};

/**********************************************************************************************************/
/**********************************************************************************************************/
/***************************************Blockly operations override***************************************/
/**********************************************************************************************************/
Blockly.NaturalLanguage_english = new Blockly.Generator("NaturalLanguage_english");

Blockly.NaturalLanguage_english.workspaceToCode = function(workspace) {
    var translation = "";

    var topBlocks = workspace.getTopBlocks();
    var experimentBlock = null;
    for(i = 0; (experimentBlock == null) && (i < topBlocks.length); i++) {
        if (topBlocks[i].type == "experiment") {
            experimentBlock = topBlocks[i];
        }
    }

    if (experimentBlock != null) {
        translation = Blockly.NaturalLanguage_english.blockToCode(experimentBlock);
    }
    return translation;
};

Blockly.NaturalLanguage_english.blockToCode = function(block) {
    var translatedObj = null;
    if (block != null) {
        if (Blockly.NaturalLanguage_english[block.type] != null) {
            translatedObj = Blockly.NaturalLanguage_english[block.type](block);
        } else {
            console.error("no natural language translation function for block type: " + block.type);
        }
    } else {
        console.error("block is null");
    }
    return translatedObj;
};

/**********************************************************************************************************/
/**********************************************************************************************************/
/***************************************Miscelaneous                ***************************************/
/**********************************************************************************************************/
Blockly.NaturalLanguage_english.processDescendants = function(firstDescendant) {
    var naturalLanguage = "";

    var actualDescendant = firstDescendant;
    while(actualDescendant != null) {
        var code = Blockly.NaturalLanguage_english.blockToCode(actualDescendant);
        naturalLanguage += code;

        actualDescendant = actualDescendant.getNextBlock();
    }
    return naturalLanguage;
};

Blockly.NaturalLanguage_english.getFirstDescendant = function(block) {
    var firstDescendant = null;
    var descendants = block.getDescendants();
    if (descendants.length > 1) {
        firstDescendant = descendants[1];
    }
    return firstDescendant;
};

Blockly.NaturalLanguage_english.getRateStr = function(containerBlock) {
    var code = "?";
    if (containerBlock != null) {
        var blockFields = containerBlock.createFieldsObject();
        var rateStr = (blockFields.rate != null ? blockFields.rate.toString() : "?");
        code = rateStr + " " + blockFields.rate_volume_units + "/" + blockFields.rate_time_units;
    }
    return code;
};

Blockly.NaturalLanguage_english.getContainerName = function(containerBlock) {
    var code = "?";
    if (containerBlock != null) {
        var blockFields = containerBlock.createFieldsObject();
        code = " " + blockFields.containerName + " ";
    }
    return code;
};

Blockly.NaturalLanguage_english.getContainerListNames = function(containerListBlock) {
    var code = [];
    if (containerListBlock != null) {
        var blockFields = containerListBlock.createFieldsObject();

        var containerList = blockFields.containerList;
        for(var i=0; i < containerList.length; i++) {
            var elemI = Blockly.NaturalLanguage_english.getContainerName(containerList[i]);
            code.push(elemI);
        }
    }
    return code;
};

Blockly.NaturalLanguage_english.getContainerListRates = function(containerListBlock) {
    var code = [];
    if (containerListBlock != null) {
        var blockFields = containerListBlock.createFieldsObject();

        var containerList = blockFields.containerList;
        for(var i=0; i < containerList.length; i++) {
            var elemI = Blockly.NaturalLanguage_english.getRateStr(containerList[i]);
            code.push(elemI);
        }
    }
    return code;
};

/**********************************************************************************************************/
/**********************************************************************************************************/
/***************************************OPERATIONAL REGULAR BLOCKS*****************************************/
/**********************************************************************************************************/
/**********************Basicly choose the possibility of change the first sentence of the block************/
/**********************************************************************************************************/

Blockly.NaturalLanguage_english.centrifugation = function(block) {
    /*var code = '   <font color="blue"> Spin ';  //This is an example of how we can modify the color of a sentence
    code = regularNaturalLanguageTranslation_(code,block);
    code = code +'</font> ';
    return code; */
    var code = '    Spin ';  //This is an example of how we can modify the color of a sentence
    code = regularNaturalLanguageTranslation_(code,block);
    return code; 
};

Blockly.NaturalLanguage_english.electrophoresis = function(block) {
    var code = '    Do an electrophoresis';  
    code = regularNaturalLanguageTranslation_(code,block);
    return code;
};


Blockly.NaturalLanguage_english.flashFreeze = function(block) {
    var code = '    Flash freeze ';   
    code = regularNaturalLanguageTranslation_(code,block);
    return code;
};

Blockly.NaturalLanguage_english.flowCitometry = function(block) {
    var code = '    Flow Analyze with data: \n';  
    code = regularNaturalLanguageTranslation_(code,block);
    return code;
};

Blockly.NaturalLanguage_english.incubate = function(block) {
    var code = '    Incubate ';    
    code = regularNaturalLanguageTranslation_(code,block);
    return code;
};

Blockly.NaturalLanguage_english.mix = function(block) {
    var code = '    Mix ';    
    code = regularNaturalLanguageTranslation_(code,block);
    return code;
};

Blockly.NaturalLanguage_english.oligosynthesize = function(block) {
    var code = '    Oligosynthesize ';    
    code = regularNaturalLanguageTranslation_(code,block);
    return code;
};

Blockly.NaturalLanguage_english.sangerSequencing = function(block) {
    var code ='    Sanger sequencing';
    code = regularNaturalLanguageTranslation_(code,block);
    return code;
};

Blockly.NaturalLanguage_english.thermocycling = function(block) {
    var code ='    Thermocycle operation';
    code = regularNaturalLanguageTranslation_(code,block);
    return code;
};

Blockly.NaturalLanguage_english.measurement = function(block) {
    var type_measure = block.getFieldValue('parameters');
    switch (type_measure){//This function is to get the real name of the different kinds of pipetting.
        case '1':
            type_measure="Absorbance";
            break;
        case '2':
            type_measure="Fluorescence";
            break;
        case '3':
            type_measure="Luminiscence";
            break;
        case '4':
            type_measure="Volume";
            break;
        case '5':
            type_measure="Temperature";
            break;
        default:
            alert("Some error appeared translating language");
                        }
    //Creating general code of PIPETTE function and its type
    var code ='    ' + type_measure +' measure' ;
    code = regularNaturalLanguageTranslation_(code,block);
    return code;
};

/**********************************************************************************************************/
/**********************************************************************************************************/
/***************************************OPERATIONAL SPECIAL BLOCKS*****************************************/
/**********************************************************************************************************/
/*****************They are special just because they have source and destination blocks********************/
/*********Particularly PIPETTE is the most complex because it can include lists in source and dest*********/
/**********************************************************************************************************/


Blockly.NaturalLanguage_english.cellSpreading = function(block) {
    var code = '    Spread ';     //initialize the code for incubate function

    //Loop to get the real number of container blocks connected to the centrifugation, because is the centrifugation that extract the info of each container block.
    var numberOfBlocks = 1;
    if(block.getInputTargetBlock('source') ){ //Get the block in the SOURCE input if exists
        blockSource = block.getInputTargetBlock('source');
        blockDestination = block.getInputTargetBlock('destination');
        var isList = blockSource.getInput('contListOption');//Check if it is a list

        if ( numberOfBlocks == 1 && blockSource!=null){  //If it exists child and it's just one.
            code = code + ' from ' + blockSource.getFieldValue("containerName") +"/"+blockSource.getFieldValue("container_type_global")+' '; 
            if(block.getInputTargetBlock('destination')!=null){
                code = code + ' to ' + blockDestination.getFieldValue("containerName") +"/"+blockDestination.getFieldValue("container_type_global")+' ';
                code = block.optionsDisplay_naturalLanguage(code,blockDestination); //Call the function optionsDisplay_naturalLanguage which it exists in each function block, with their own parameters.
            }
        }
    }
    code = code + "\n";
    return code;
};

Blockly.NaturalLanguage_english.colonyPicking = function(block) {
    var code = '    Autopick ';     //initialize the code for incubate function

    //Loop to get the real number of container blocks connected to the centrifugation, because is the centrifugation that extract the info of each container block.
    var numberOfBlocks = 1;
    if(block.getInputTargetBlock('source') ){ //Get the block in the SOURCE input if exists
        blockSource = block.getInputTargetBlock('source') ;
        blockDestination = block.getInputTargetBlock('destination');
        //var isList = blockSource.getInput('contListOption');//Check if it is a list
        if ( numberOfBlocks == 1 && blockSource!=null){  //If it exists child and it's just one.
            code = code + ' from ' + blockSource.getFieldValue("containerName") +"/"+blockSource.getFieldValue("container_type_global")+' '; 
            if(block.getInputTargetBlock('destination')){
                code = code + 'to ' + blockDestination.getFieldValue("containerName") +"/"+blockDestination.getFieldValue("container_type_global")+' ';
            }	
            code = block.optionsDisplay_naturalLanguage(code,blockSource);//Call the function optionsDisplay_naturalLanguage which it exists in each function block, with their own parameters.
        }
    }
    code = code +".\n";
    return code;
};


Blockly.NaturalLanguage_english.pipette = function(block) {
    var type_pipette = block.getFieldValue('pipetteTypeName');
    switch (type_pipette){//This function is to get the real name of the different kinds of pipetting.
        case '1':
            type_pipette="Transfer";
            break;
        case '2':
            type_pipette="Distribute";
            break;
        case '3':
            type_pipette="Consolidate";
            break;
        case '4':
            type_pipette="Continuous transfer";
            break;
        default:
            alert("Some error appeared translating language");
                        }
    //Creating general code of PIPETTE function and its type
    var code = "    " + type_pipette + ' from  ';

    //SOURCE operations:****************************************************************************************************************************
    //Loop to get the real number of container blocks connected to the pipette, because is the pipette that extract the info of each container block.
    var numberOfBlocks = 1; 
    if(block.getInputTargetBlock('source') ){ //Get the block in the SOURCE input if exists
        blockSource = block.getInputTargetBlock('source');
        var isList = blockSource.getInput('contListOption');//Check if it is a list
        if(isList){

            var substring='contListOptionValueNum'; //Substring to complete with the number of the position of each block.

            var j = 0;
            for(var i = 0; i < blockSource.getFieldValue('contListOptionValue'); i++){
                j++;
                var string = substring+j; //Creating the complete srting of the input where there is a container block.
                var currentBlock = blockSource.getInputTargetBlock(string);
                if (currentBlock != null){					
                    code= code +currentBlock.getFieldValue("containerName")+' ';
                    code = block.optionsDisplay_naturalLanguage(code, currentBlock); //Call the function optionsDisplay_naturalLanguage which it exists in each function block, with their own parameters.
                    if (i+2 <= blockSource.getFieldValue('contListOptionValue')){
                        code = code + ' and ';
                    }
                }
            }
        }


        /*CASE only one block in source*/
        else if ( numberOfBlocks == 1 && blockSource!=null){//If it exists child and it's just one.
            if ( blockSource.getInputTargetBlock('volume') || blockSource.getInput('datareference') || blockSource.getInput('singlewelladdrinput') || blockSource.getInput('singleWell') || blockSource.getInput('multipleWellAddrInput') || blockSource.getInput('multiplewells') || blockSource.getInput('gelcomposition') || blockSource.getInput('valueagarose') || blockSource.getInput('optionsCTMode') || blockSource.getInput('optionsCTMode2') || blockSource.getInput('steps')  ){

                code= code + blockSource.getFieldValue("containerName") +' '; 
                code = block.optionsDisplay_naturalLanguage(code,blockSource); //Call the function optionsDisplay_naturalLanguage which it exists in each function block, with their own parameters.

            }else{
                code = code  + blockSource.getFieldValue("containerName");
            }
        }
    }

    //DESTINATION operations:****************************************************************************************************************************
    //Loop to get the real number of container blocks connected to the pipette, because is the pipette that extract the info of each container block.
    var code3 = code3+ ' to ';
    var numberOfBlocks3 = 1; 
    if(block.getInputTargetBlock('destination') ){ //Get the block in the SOURCE input if exists
        blockDestination = block.getInputTargetBlock('destination');
        var isList = blockDestination.getInput('contListOption');//Check if it is a list
        if(isList){
            var substring='contListOptionValueNum'; //Substring to complete with the number of the position of each block.
            var j = 0;
            for(var i = 0; i < blockDestination.getFieldValue('contListOptionValue'); i++){
                j++;
                var string = substring+j; //Creating the complete srting of the input where there is a container block.
                var currentBlock = blockDestination.getInputTargetBlock(string);
                if (currentBlock != null){
                    code3= code3 +currentBlock.getFieldValue("containerName");
                    code3 = block.optionsDisplay_naturalLanguage(code3, currentBlock); //Call the function optionsDisplay_ which it exists in each function block, with their own parameters.
                    if (i+2 <= blockDestination.getFieldValue('contListOptionValue')){
                        code3 = code3 + ' and ';
                    }
                }
            }

        } 
        /*CASE only one block in destination*/
        else if ( numberOfBlocks3 == 1 && blockDestination!=null){//If it exists child and it's just one.
            if ( blockDestination.getInputTargetBlock('volume') || blockDestination.getInput('datareference') || blockDestination.getInput('singlewelladdrinput') || blockDestination.getInput('singleWell') || blockDestination.getInput('multipleWellAddrInput') || blockDestination.getInput('multiplewells') || blockDestination.getInput('gelcomposition') || blockDestination.getInput('valueagarose') || blockDestination.getInput('optionsCTMode') || blockDestination.getInput('optionsCTMode2') || blockDestination.getInput('steps')  ){
                code3 = code3+ blockDestination.getFieldValue("containerName") ; 
                code3 = block.optionsDisplay_naturalLanguage(code3,blockDestination);  //Call the function optionsDisplay_ which it exists in each function block, with their own parameters.

            }else{
                code3 = code3 + blockDestination.getFieldValue("containerName") ;
            }
        }
    }

    code3 += naturalLanguageTime(block) + ".\n";
    return code3;
};
//TODO
Blockly.NaturalLanguage_english.continuous_flow = function(block) {
    var fieldsValues = block.createFieldsObject();

    var code = "Set a continuous flow "

    var type = parseInt(fieldsValues.continuosflow_type);
    switch (type) {
        case 1: { //one to one
            var source = fieldsValues.source;
            code += "from " +Blockly.NaturalLanguage_english.getContainerName(source);

            var destination = fieldsValues.destination;
            code += " to " + Blockly.NaturalLanguage_english.getContainerName(destination);
            code += " at a rate of " + Blockly.NaturalLanguage_english.getRateStr(destination);
            
            break;
        } case 2: { //one to many
            var source2 = fieldsValues.source;
            var sourceName = Blockly.NaturalLanguage_english.getContainerName(source2);
            code += "from " + sourceName;

            var destination3 = fieldsValues.destination;
            var destinationNames = Blockly.NaturalLanguage_english.getContainerListNames(destination3);
            var destinationRates = Blockly.NaturalLanguage_english.getContainerListRates(destination3);

            for(var i=0; i < destinationNames.length; i++) {
                var nameI = destinationNames[i];
                var rateI = destinationRates[i];
                code += " to " + nameI + " at a rate of " + rateI;

                if (i != destinationNames.length -1) { //not the last one
                    code += " AND from " + sourceName;
                }
            }
            break;
        } case 3: { //many to one
            var destination4 = fieldsValues.destination;
            var destinationName = Blockly.NaturalLanguage_english.getContainerName(destination4);

            var source4 = fieldsValues.source;
            var sourceNames = Blockly.NaturalLanguage_english.getContainerListNames(source4);
            var sourceRates = Blockly.NaturalLanguage_english.getContainerListRates(source4);

            for(var i2=0; i2 < sourceNames.length; i2++) {
                var nameI2 = sourceNames[i2];
                var rateI2 = sourceRates[i2];
                code += " from " + nameI2 + " to " + destinationName + " at a rate of " + rateI2;

                if (i2 != sourceNames.length -1) { //not the last one
                    code += " AND ";
                }
            }
            
            break;
        } case 4: { //sequence
            var source = fieldsValues.source;
            var sequenceNames = Blockly.NaturalLanguage_english.getContainerListNames(source);
            
            for(var i=1; i < sequenceNames.length; i++) {
                var namePreviousI = sequenceNames[i-1];
                var nameI = sequenceNames[i];
                
                code += " from " + namePreviousI + " to " + nameI;
                if (i != sequenceNames.length -1) { //not the last one
                    code += " AND ";
                }
            }
            
            var rateValueStr = (fieldsValues.rate != null ? fieldsValues.rate.toString() : "?");
            var rateStr = rateValueStr + " " + fieldsValues.rate_volume_units + "/" + fieldsValues.rate_time_units;
            code += " at a rate of " + rateStr;
            
            break;
        } default: {
            console.error("Unknow continuous_flow type" + fieldsValues.continuosflow_type);
            break;
        }
                }
    
    code += naturalLanguageTime(block) + ".\n";
    return code;
};

//TODO:
Blockly.NaturalLanguage_english.turbidostat = function(block) {
    return "";
};

/**********************************************************************************************************/
/**********************************************************************************************************/
/***************************************************LOGIC BLOCKS*****************************************/
/**********************************************************************************************************/
/**********************************************************************************************************/

Blockly.NaturalLanguage_english.bioblocks_if = function(block) {
    var code = "";

    n = 0;
    while (block.getInputTargetBlock("IF" + n)) {
        var conditionBlock = block.getInputTargetBlock("IF" + n);
        var condition = (conditionBlock != null ? conditionBlock.toString() : "?");
        code += "IF " + condition + " DO: \n";

        var block2process = block.getInputTargetBlock("DO" + n);
        code += Blockly.NaturalLanguage_english.processDescendants(block2process);

        n++;
    }

    if (block.getInputTargetBlock("ELSE")) {
        code += "ELSE DO: \n";

        block2process = block.getInputTargetBlock("ELSE");
        code += Blockly.NaturalLanguage_english.processDescendants(block2process);
    }

    code += "END IF";
    return code;
};

Blockly.NaturalLanguage_english.bioblocks_while = function(block) {
    var code = "";

    var boolBlock = block.getInputTargetBlock("BOOL");
    var condition = (boolBlock ? boolBlock.toString() : "?");
    code += "WHILE " + condition + " DO: \n";

    var block2process = block.getInputTargetBlock("DO");
    code += Blockly.NaturalLanguage_english.processDescendants(block2process);

    code += "END WHILE";
    return code;
};

/**********************************************************************************************************/
/**********************************************************************************************************/
/***************************************************GENERAL BLOCKS*****************************************/
/**********************************************************************************************************/
/**********************************************************************************************************/

Blockly.NaturalLanguage_english.experiment = function(block) {
    var code = "Experiment name - " + block.getFieldValue('experimentName')+"\n\nSolutions/reagents:\n\n";

    var comparationArray={};

    var childrenArray = block.getDescendants(); /*Get all the children*/
    for(var k=0;k<childrenArray.length;k++){ /*Loop to write all names of different containers*/
        if (childrenArray.hasOwnProperty(k)){
            if(childrenArray[k].getFieldValue("containerName")){
                if (!comparationArray.hasOwnProperty(childrenArray[k].getFieldValue("containerName"))){
                    code = code + '- ' + childrenArray[k].getFieldValue("containerName") +' \n';
                    comparationArray[childrenArray[k].getFieldValue("containerName")]=k;
                }
            }
        }
    }

    /*code = code + "\nEquipment:\n\n";

	for(var k=0;k<childrenArray.length;k++){ //Loop for write all the equipment used (function blocks)
		if (childrenArray.hasOwnProperty(k)){
			if(!childrenArray[k].getFieldValue("containerName") && !childrenArray[k].getFieldValue("contListOptionValue") && !childrenArray[k].getFieldValue("experimentName")&& !childrenArray[k].getFieldValue("step") ){
				if (!comparationArray.hasOwnProperty(childrenArray[k].getFieldValue())){
					code = code + '- ' + getEquipmentName(childrenArray[k].getFieldValue())  +' \n';
					comparationArray[childrenArray[k].getFieldValue()]=k;
				}
			}
		}
	}*/
    code = code + "\nSteps:\n";

    var descendant = block.getInputTargetBlock("inputOfExperiment");
    code += Blockly.NaturalLanguage_english.processDescendants(descendant);
    return code;
};

Blockly.NaturalLanguage_english.step = function(block) {
    var code = block.getFieldValue('step') +". "+"\n";

    var descendant = block.getInputTargetBlock("inputOfExperiment");
    code += Blockly.NaturalLanguage_english.processDescendants(descendant);
    code = code +"\n"; 
    return code;
};

/*Although it is empty is necessary to create this functions to avoid errors*/
Blockly.NaturalLanguage_english.container = function(block) {	

};

/*Although it is empty is necessary to create this functions to avoid errors*/
Blockly.NaturalLanguage_english.containerList = function(block) {

};

Blockly.NaturalLanguage_english.variables_set = function(block) {

};