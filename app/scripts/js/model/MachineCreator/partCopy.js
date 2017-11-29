(function () {
    'use strict';
 }());
var partCopyColour = '#00A1F1';

Blockly.Blocks.part_copy = {
    init : function() {
        this.setColour(partCopyColour);
        this.setInputsInline(true);
        this.setOutput('Reference');
        this.appendValueInput('reference')
            .appendField('Copy')
            .setCheck('Reference');	
    },

    createFieldsObject : function() {
        var blockObj = {};

        blockObj.block_type = this.type;
        blockObj.reference = this.getInputTargetBlock('reference');
        return blockObj;
    }
};