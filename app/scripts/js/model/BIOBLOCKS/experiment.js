/***************************************************************************************************************************************************************/
/* Name: experiment.js																																	  	   */
/* Developer: Jes�s Irimia																																	   */
/* Function: It contains the steps of the experiment. Also contains all the functions with the respective containers.	 	                                   */	
/*																																							   */
/*																																				               */
/***************************************************************************************************************************************************************/		
/***************************************************************************************************************************************************************/
Blockly.Blocks['experiment'] = {
  init: function() {
   
	/*Usual initialization of a common block*/
	this.appendDummyInput("Experiment")
		.setAlign(Blockly.ALIGN_CENTRE)
        .appendField("Experiment"); //name of the block
    this.setInputsInline(false);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
    this.appendDummyInput("experimentName")
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField("Name/Reference")
			.appendField(new Blockly.FieldTextInput("insert name"), "experimentName");
    this.appendStatementInput("inputOfExperiment");
    this.setCommentText("Experiment");
    
    
    /* horizontal approach
    this.appendValueInput("nextStep")
    .setCheck("experimentName")
    .setAlign(Blockly.ALIGN_RIGHT)
    .appendField("Next Step");*/
   
  },
  /*onchange : function(){
	    jsCodeGeneration();
  		myOwnFunction1();
  		myOwnFunction2();
  		myOwnFunction3();
	}*/
};




