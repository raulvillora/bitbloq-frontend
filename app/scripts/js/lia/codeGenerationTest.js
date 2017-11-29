/*
The MIT License (MIT)

Copyright (c) 2016 Universidad Polit�cnica de Madrid

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

function generateCompilerCode() {
    code = Blockly.CompilerGenerator.workspaceToCode(this.workspace);
    document.getElementById("codeToShow1").innerHTML =  code; // Set the code inside local variable "res" in the element "codeToShow1" in the code area.-->	
}

//script// Function developed for study of the special memory object built up to the mutation autoload memory-->
function test() {
    for (var k in containerObject){ // Loop to iterate every objects inside the container object GLOBAL-->
        if (containerObject.hasOwnProperty(k)) {// Check if the current "containerName"==id has "contListOptionValueNum"==object of container information-->
            //alert("hola " +k +" YEI " +  +containerObject[k]);
            conti=containerObject[k]// Assign the current LOCAL object of a container-->
            for(var h in conti){
                if (conti.hasOwnProperty(h)){ // Loop to iterate every objects inside the container object LOCAL-->
                    alert(h + conti[h]) // Display the data, This serve to the developer to check possible errors-->
                    //alert("Funciona " +  conti[h].name);
                }
            }
        }
    }
};


// This function print in a window the bioblocks in JSON format.
function runJS() {
    Blockly.JavaScript.addReservedWords('code');// Special function of blockly-->
    if(workspace){
        var code = Blockly.JavaScript.workspaceToCode(workspace);// Get the blocks in the workspace and use the function that give the code-->
    }
    alert(code);// Display the code in the screen-->

    /*Execute the javascript code, for bioblocks is useless because it needs the laboratory*/
    /*
	try {
		eval(code);// Execute the code-->
	} catch (e) {// Catch exception errors-->
	alert(e);

	}	*/					
}


function saveBlocks() {	
    filename=prompt("Write the output file name: ");// Ask to the user to prompt the name of the file-->
    var xml = Blockly.Xml.workspaceToDom(workspace);// Transform the workspace in a dom core-->
    var xml_text = Blockly.Xml.domToPrettyText(xml);// Convert to xml, in addition the text is called pretty because ut includes tabulation-->
    try {// Check if the browser accept the Binary large object--> 
        var isFileSaverSupported = !!new Blob;
        alert("Save is supported in this browser");
    } catch (e) {alert(e);}

    var blob = new Blob([xml_text]);// Include the text in the blob-->
    saveAs(blob, filename);// Save the blob in the file created on your PC-->
    alert('This block system is correctly saved');
}

function loadBlocks() {
    docXml = prompt("Write the XML text you want to load");// Ask to the user to prompt the text in xml-->
    alert(docXml)// Display the text to check possibles errors-->
    // Functions of blockly to rebuild the blocks-->
    var xml = Blockly.Xml.textToDom(docXml);
    Blockly.Xml.domToWorkspace(workspace, xml);
}		

// Function which call to all the blocks and get the JavaScript code of the blocks, replace the values to print in html, and finally print them in the app-->
var jsCode = "";
function jsCodeGeneration() {
    Blockly.Graph.addReservedWords('code');			
    totalBlocks = this.workspace.getAllBlocks();//  This function performs an array which is used to store all the blocks in the workspace-->

    var maximumTimeOfOperation = 0;
    var totalOperationBlocks = 0;
    var childrenOperationArray={};//Array to store only the operation blocks (the green blocks).--> 
    var h=0;//variable to iterate all the blocks in the workspace-->
    jsCode =  '/********************************************************************/  \n';



    while(h<= totalBlocks.length){
        if (totalBlocks.hasOwnProperty(h)){//Check if it exists the object contain in totalBlock[h]-->
            if(totalBlocks[h].getInput("Experiment")){ //If it's an experiment block go on -->
                //			 						jsCode += '/* Name: '+ totalBlocks[h].getFieldValue("experimentName") +'.js				*/		\n';
                //			 						jsCode += '/* Developer: Diego															*/		\n';
                //			 						jsCode += '/* Function: Description.	 	                                            */		\n';					
                //			 						jsCode += '/*																   			*/		\n';
                //			 						jsCode += '/*																  			*/		\n';
                //			 						jsCode += '/*****************************************************************************/		\n';
                //			 						jsCode += '/*****************************************************************************/		\n';
                //			 						jsCode += 'Blockly.Blocks[' + totalBlocks[h].getFieldValue("experimentName") + '] = {     		\n';						
                //			 						jsCode += '	/*Usual initialization of a common block*/ 									  		\n';

                //			 						//Bloques contenidos en el experimento
                //			 						jsCode += '	this.appendDummyInput("Experiment")													\n';
                //			 						jsCode += '		.setAlign(Blockly.ALIGN_CENTRE)													\n';
                //			 						jsCode += '        .appendField("' + totalBlocks[h].getFieldValue("experimentName") + '");		\n';
                //			 						jsCode += '    this.setInputsInline(false);														\n';
                //			 						jsCode += '    this.setTooltip("");																\n';
                //			 						jsCode += '    this.setColour(120);																\n';
                //			 						jsCode += '    this.setHelpUrl("http://www.example.com/");										\n';
                //			 						jsCode += '    this.appendDummyInput("' + totalBlocks[h].getFieldValue("experimentName") + '")	\n';
                //			 						jsCode += '			.setAlign(Blockly.ALIGN_RIGHT)												\n';
                //			 						jsCode += '			.appendField("Name/Reference")												\n';
                //			 						jsCode += '			.appendField(new Blockly.FieldTextInput("insert name"), "' + 
                //			 																totalBlocks[h].getFieldValue("experimentName") + '");	\n';
                //			 						jsCode += '    this.appendStatementInput("inputOfExperiment");									\n';						
                //			 						jsCode += '  },																					\n';
                //			 						jsCode += '  onchange : function(){																\n';
                //			 						jsCode += '  		myOwnFunction1();															\n';
                //			 						jsCode += '  		myOwnFunction2();															\n';
                //			 						jsCode += '  		myOwnFunction3();															\n';
                //			 						jsCode += '	}																					\n';
                //			 						jsCode += '};																					\n';
                var childrenArray = {}//initialize of this object-->
                childrenArray = totalBlocks[h].getChildren(); //Get all the children of the CURRENT experiment block-->
                var childrenContainerExists = {}
                var s=0;
                var boolExists=0;


                //This loop search in the all the children of experiment block and switch their kind call determinated functions-->
                jsCode += '\n Hijos dle experimento = ' + childrenArray.length + '';
                for(var k=0;k<childrenArray.length;k++) {
                    var child = childrenArray[k];
                    if(child.getInputsInline()){
                        jsCode += '\n \t \t \t \t \t horizontal = ' + child.getInputsInline();
                    }else {
                        jsCode += '\n \t \t \t \t \t vertical = ' + child.getInputsInline();
                    }
                    jsCode += '\n Bioblock = ' + child.getFieldValue() + ' con ' + child.inputList.length + ' inputs';

                    for(var v=0;v<child.inputList.length;v++){						
                        jsCode += '\n \t \t \t Input numero = ' + v + '';	
                        var fieldList = child.getInput(child.inputList[v].name).fieldRow;

                        for(var z=0;z<fieldList.length;z++){														
                            jsCode += '\n \t \t \t \t elemento numero ' + z ;	
                            jsCode += '\n \t \t \t \t \t texto = '+ fieldList[z].getText();
                            jsCode += '\n \t \t \t \t \t valor = '+ fieldList[z].getValue();


                        }	
                    }	

                    jsCode += '\n \t START hijos ';

                    for(var u=0;u<child.getChildren().length;u++){
                        var subChild = child.getChildren()[u];
                        if(subChild.getInputsInline() == true){
                            jsCode += '\n \t \t \t \t \t horizontal = ' + subChild.getInputsInline();
                        }else {
                            jsCode += '\n \t \t \t \t \t vertical = ' + subChild.getInputsInline();
                        }
                        jsCode += '\n \t  \t Bioblock = ' + subChild.getFieldValue() + ' (Hijo de '+child.getFieldValue()+' )';

                        for(var v=0;v<subChild.inputList.length;v++){						
                            jsCode += '\n \t \t \t Input numero = ' + v + '';	
                            var fieldList = subChild.getInput(subChild.inputList[v].name).fieldRow;
                            for(var z=0;z<fieldList.length;z++){														
                                jsCode += '\n \t \t \t \t elemento numero ' + z ;	
                                jsCode += '\n \t \t \t \t \t texto = '+ fieldList[z].getText();
                                jsCode += '\n \t \t \t \t \t valor = '+ fieldList[z].getValue();
                            }	
                        }		
                    }				
                    jsCode += '\n \t END hijos ';
                    jsCode += '\n ';
                }
            }
        }
        h++;
    }
    //After store all function blocks, we do a loop to export the information of each of them arranged by the time of operation.
    var operationBlocksToGraph=0;
    var i=0;
    while ((operationBlocksToGraph < totalOperationBlocks) && (i <= maximumTimeOfOperation)) { //Condition to make sure we are writing all the operation 
        for(var k=0;k<totalOperationBlocks;k++){
            if (childrenOperationArray.hasOwnProperty(k)){
                if(i == childrenOperationArray[k].getFieldValue("timeOfOperation")){ //Chech if the current block has the corresponding time of operation-->

                    var bimbo = Blockly.JavaScript.blockToCode(childrenOperationArray[k]);  //Codify this block and its direct descendence.-->
                    operationBlocksToGraph++;
                    if( operationBlocksToGraph<totalOperationBlocks){

                    }
                }
            }
        }
        i++; //increment the current "timeOfOperaion" output-->

    }

    var res = jsCode.replace(/\n/g, "<br>");// Replace "new string" value of javascript for the pertinent of html -->
    var res = res.replace(/ /g, "&nbsp"); ;// Replace "space" value of javascript for the pertinent of html -->
    document.getElementById("codeToShow0").innerHTML =  res; // Set the code inside local variable "res" in the element "codeToShow1" in the code area.-->
};

// Function which call to all the blocks and get the JSON code of the blocks, replace the values to print in html, and finally print them in the app-->
var JSONcode = "";
function myOwnFunction1() {
    Blockly.Graph.addReservedWords('code');
    //var code = Blockly.Graph.workspaceToCode();// This function call each block to develop the graphs. Useless for the graphs wich is controlled for "time of operation"-->
    totalBlocks = this.workspace.getAllBlocks();//  This function performs an array which is used to store all the blocks in the workspace-->

    var maximumTimeOfOperation = 0;
    var totalOperationBlocks = 0;
    var childrenOperationArray={};// Array to store only the operation blocks (the green blocks).--> 
    var h=0;// variable to iterate all the blocks in the workspace-->
    JSONcode = '{\n    "refs": {\n';
    while(h<= totalBlocks.length){
        if (totalBlocks.hasOwnProperty(h)){// Check if it exists the object contain in totalBlock[h]-->
            if(totalBlocks[h].getInput("Experiment")){ // If it's an experiment block go on -->
                var childrenArray = {}// initialize of this object-->
                childrenArray = totalBlocks[h].getDescendants(); // Get all the children of the CURRENT experiment block-->
                var childrenContainerExists = {}
                var s=0;
                var boolExists=0;

                // This loop search in the all the children of experiment block and switch their kind call determinated functions-->
                for(var k=0;k<childrenArray.length;k++){
                    if (childrenArray.hasOwnProperty(k)){
                        var surroundBlock = childrenArray[k].getSurroundParent();
                        if ((surroundBlock == null) || 
                            ((surroundBlock.type != "controls_if") &&
                             (surroundBlock.type != "controls_whileUntil")))  //if the operation is not in an if or loop surround block remove the condition
                        {
                            childrenArray[k].condition = null;
                        }
                        if(childrenArray[k].getFieldValue("containerName")){ // If it's a container-->

                            for(var u=0;u<childrenArray.length;u++){

                                if (childrenContainerExists.hasOwnProperty(u)){ // Check if a block with the same name already was processed-->
                                    if ( childrenContainerExists[u].getFieldValue("containerName") == childrenArray[k].getFieldValue("containerName")){
                                        boolExists=1;

                                    }
                                }
                            }
                            if(boolExists==0){ // If it's first time appear this container's name write their info in "refs:" of JSON code.-->
                                JSONcode = JSONcode + '        "' + childrenArray[k].getFieldValue("containerName") +'": {\n';
                                JSONcode = JSONcode + '            "id": "' + childrenArray[k].getFieldValue("containerName") +'", \n';
                                JSONcode = JSONcode + '            "volume": "' + childrenArray[k].getFieldValue("initial_volume") +'", \n';
                                JSONcode = JSONcode + '            "store": ' + childrenArray[k].getFieldValue("STORE-DISCARD") +'\n        },\n';
                                childrenContainerExists[s] = childrenArray[k] // Include this name in the array to check if it already exists-->
                                s++;
                            }
                            boolExists=0; // Reboot this variable for next loop-->
                        }

                        if(childrenArray[k].getFieldValue("timeOfOperation")){ // If it's an operation block go on. Because all the operation block has the "timeOfOperation" input -->
                            /*if(0>childrenArray[k].getFieldValue("timeOfOperation")){
								alert("Warning, time of operation must be greater than 0"); // Warning message to advise to the user, that negative values are not allow-->
							}

							if(maximumTimeOfOperation<Number(childrenArray[k].getFieldValue("timeOfOperation"))){
								maximumTimeOfOperation=childrenArray[k].getFieldValue("timeOfOperation"); // Store the maximum time of operation off the blocks -->

							}*/
                            childrenOperationArray[totalOperationBlocks]=childrenArray[k]; // Assign the current operation block in the array of operation block-->
                            totalOperationBlocks++;
                        }

                        if(childrenArray[k].type == "controls_if" || childrenArray[k].type == "controls_whileUntil") {
                            Blockly.JavaScript[childrenArray[k].type](childrenArray[k]);
                        }
                    }
                }							
            }
        }
        h++;
    }
    // After store all function blocks, we do a loop to export the information of each of them arranged by the time of operation.-->
    JSONcode = JSONcode.substring(0,JSONcode.length-2);
    JSONcode = JSONcode + '\n      },\n        "instructions": [\n';
    var operationBlocksToGraph=0;
    var i=0;
    while ((operationBlocksToGraph < totalOperationBlocks) && (i <= maximumTimeOfOperation)) {// Condition to make sure we are writing all the operation blocks.-->
        for(var k=0;k<totalOperationBlocks;k++){
            if (childrenOperationArray.hasOwnProperty(k)){
                if(i == childrenOperationArray[k].getFieldValue("timeOfOperation")){ // Chech if the current block has the corresponding time of operation-->

                    var bimbo = Blockly.JavaScript.blockToCode(childrenOperationArray[k]);  // Codify this block and its direct descendence.-->
                    operationBlocksToGraph++;
                    if( operationBlocksToGraph<totalOperationBlocks){
                        JSONcode = JSONcode + '                },\n';
                    }
                }
            }
        }
        i++; // increment the current "timeOfOperaion" output-->
    }
    JSONcode = JSONcode + '        }\n    ]\n}'; 

    var res = JSONcode.replace(/\n/g, "<br>");// Replace "new string" value of javascript for the pertinent of html -->
    var res = res.replace(/ /g, "&nbsp"); ;// Replace "space" value of javascript for the pertinent of html -->
    document.getElementById("codeToShow1").innerHTML =  res; // Set the code inside local variable "res" in the element "codeToShow1" in the code area.-->
};

// Function which call to all the blocks and get the NATURAL_LANGUAGE code of the blocks, replace the values to print in html, and finally print them in the app-->
function myOwnFunction2(){
    Blockly.NaturalLanguage_english.addReservedWords('code');// Special function of blockly-->
    if(workspace){
        var code = Blockly.NaturalLanguage_english.workspaceToCode(workspace);// Get the blocks in the workspace and use the function that give the code-->
        var res = code.replace(/\n/g, "<br>"); // Replace "new string" value of javascript for the pertinent of html --> 
        //var res = res.replace(/ /g, "&nbsp"); // Replace "space" value of javascript for the pertinent of html -->
        document.getElementById("codeToShow2").innerHTML =  res;  // Set the code inside local variable "res" in the element "codeToShow2" in the code area.-->
    }
}