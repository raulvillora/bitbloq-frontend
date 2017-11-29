Blockly.Blocks.hardware_layout = {
    init: function() {

        this.appendDummyInput("HardwareLayout")
            .setAlign(Blockly.ALIGN_CENTRE)
            .appendField("Machine Layout");

        this.setInputsInline(false);
        this.setTooltip('');
        this.setHelpUrl('http://www.example.com/');
        
        /*this.appendDummyInput()
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField("rate integer precission:")
            .appendField(new Blockly.FieldNumber(3), "integer_precission");
        
        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField("rate decimal precission:")
            .appendField(new Blockly.FieldNumber(2), "decimal_precission");
        
        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField("default rate units:")
            .appendField(new Blockly.FieldNumber(300), "default_rate")
            .appendField(makeUnitsDropDown("volume"), "default_rate_volume_units")
            .appendField("/")
            .appendField(makeUnitsDropDown("time"), "default_rate_time_units");
        
        this.setFieldValue("hr" , "default_rate_time_units");*/

        this.appendStatementInput("inputOfHardware");
        //this.setCommentText("Hardware Layout");
    },

    createFieldsObject : function() {
        var blockObj = {};

        blockObj.block_type = this.type;
        /*blockObj.default_rate = this.getFieldValue("default_rate");
        blockObj.default_rate_volume_units = this.getFieldValue("default_rate_volume_units");
        blockObj.default_rate_time_units = this.getFieldValue("default_rate_time_units");
        
        blockObj.integer_precission = this.getFieldValue("integer_precission");
        blockObj.decimal_precission = this.getFieldValue("decimal_precission");*/
        
        return blockObj;
    }

};