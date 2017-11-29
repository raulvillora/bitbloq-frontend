var COMPARTION_OPERATION_DROPDOWN = [[">", "GT"],[">=", "GTE"],["<", "LT"],["<=","LTE"],["=","EQ"]];

Blockly.Blocks.checkTime = {
    init : function() {
        this.setInputsInline(true);
        this.setOutput(true, "Boolean");
        
        this.appendDummyInput()
            .appendField("experiment time")
            .appendField(new Blockly.FieldDropdown(COMPARTION_OPERATION_DROPDOWN),"compare_op")
            .appendField(new Blockly.FieldNumber(0),"time_value")
            .appendField(makeUnitsDropDown("time"),"time_value_units");
    },
    
    createFieldsObject : function() {
		fieldsObject = {};
		appendTimeSettings(fieldsObject, this);

		fieldsObject.block_type = this.type;
		fieldsObject.compare_op = this.getFieldValue("compare_op");
		fieldsObject.time_value = this.getFieldValue("time_value");
        fieldsObject.time_value_units = this.getFieldValue("time_value_units");
		return fieldsObject;
	},
    
    toString : function() {
        var fields = this.createFieldsObject();
        
        return "experiment_time " + fields.compare_op + " " + fields.time_value.toString() + " " + fields.time_value_units;
    }
};