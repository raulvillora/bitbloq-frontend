/*
The MIT License (MIT)

Copyright (c) 2016 Universidad Polit�cnica de Madrid

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

var LINKED_STR = "_∞_";

function addTimeAttributes(block, duration) {
    block.appendDummyInput('timeSettings')//The settings input is monitored from onchange() function
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("Time settings")
        .appendField(new Blockly.FieldCheckbox('FALSE', function(value) {toogleTimeSettings(block,value); }), "timeSetting_checkbox");

    var timeInput = block.appendDummyInput('timeOperations');

    timeInput.appendField(new Blockly.FieldLabel('Link:'),"linkLbl")
        .appendField(new Blockly.FieldCheckbox('FALSE', function(value) {return toogleLinked(block,value);}), "linked_checkbox");

    timeInput.setAlign(Blockly.ALIGN_RIGHT)
        .appendField(new Blockly.FieldLabel('Start Time:'),"timeOdOperationLbl")
        .appendField(new Blockly.FieldNumber(0), "timeOfOperation")
        .appendField(makeUnitsDropDown("time"),"timeOfOperation_units");


    if(duration) {
        timeInput.setAlign(Blockly.ALIGN_RIGHT)
            .appendField(new Blockly.FieldLabel('Duration:'),"durationLbl")
            .appendField(new Blockly.FieldNumber(0), "durationText")
            .appendField(makeUnitsDropDown("time"), "durationText_units");
    }

    timeInput.setVisible(false);

    block.data = null;
};

function changeTimeOfOperationVisibility(block, visible) {
    block.getField('timeOfOperation').setVisible(visible);
    block.getField('timeOfOperation_units').setVisible(visible);
    block.getField('timeOdOperationLbl').setVisible(visible);
};

function toogleTimeSettings(block, value) {
    block.getInput('timeOperations').setVisible(value);
    if (block.getFieldValue('linked_checkbox') == 'TRUE') {
        changeTimeOfOperationVisibility(block, false);
    }
    block.render();
};

function toogleLinked(block, value) {
    if(value) {
        var opOnTop = getOpOnTop(block);
        if(opOnTop != null) {
            block.setFieldValue(-1, 'timeOfOperation');
            changeTimeOfOperationVisibility(block, false);
            block.setMovable(false);

            setLinkedTittle(block);

            block.render();			
            return true;
        } else {
            alert("an operation must have an other operation on top");
            return null;
        }
    } else {
        block.setFieldValue(0, 'timeOfOperation');
        changeTimeOfOperationVisibility(block, true);
        block.setMovable(true);

        unsetLinkedTittle(block);

        block.render();
        return false;
    }
}

function getOperationsBlocks() {
    var operations = [];
    var xml = document.getElementById('toolbox');
    if (xml != null) {
        var x = xml.children;
        var finded = null;
        for(i=0 ;  finded == null && i < x.length; i++) {
            if(x[i].attributes["name"].value == "Operations") {
                finded = x[i];
            }
        }

        if (finded != null) {
            var customBlocks = finded.children;
            for(i = 0; i < customBlocks.length; i++) {
                operations.push(customBlocks[i].attributes["type"].value);
            }
        } else {
            console.error("no 'Operations' category on the toolbox");	
        }
    } else {
        console.error("no 'toolbox' element on the document");
    }
    return operations;
};

function getOpOnTop(block) {
    if (availableOperationsBlocks != null && availableOperationsBlocks.length > 0) {
        var finded = null;
        var block2check = block.getParent();

        while(finded == null && block2check != null) {
            if (availableOperationsBlocks.indexOf(block2check.type) != -1) {
                finded = block2check;
            }
            block2check = block2check.getParent();
        }
        return finded;
    } else {
        console.error("no operations types available");
        return null;
    }
};

function setLinkedTittle(block) {
    if(block.getField('blockTitle')) {
        var newTittle = LINKED_STR + block.getFieldValue("blockTitle");
        block.setFieldValue(newTittle, "blockTitle");
    }
};

function unsetLinkedTittle(block) {
    if(block.getField('blockTitle')) {
        var title = block.getFieldValue("blockTitle");
        var position = title.lastIndexOf(LINKED_STR);
        if (position >= 0) {
            var newTittle = title.slice(position + LINKED_STR.length, title.length);
            block.setFieldValue(newTittle, "blockTitle");
        }
    }
};

function mutationToDomTime(container, block) {
    if (container != null) {
        container.setAttribute('show_time_operations', block.getFieldValue('timeSetting_checkbox'));
        container.setAttribute('linked', block.getFieldValue('linked_checkbox'));
    }
};

function domToMutationTime(xmlElement, block) {
    var  showTimeOps = xmlElement.getAttribute('show_time_operations');
    var linked = xmlElement.getAttribute('linked');

    if (showTimeOps != null && showTimeOps == 'TRUE') {
        block.getInput('timeOperations').setVisible(true);
        if (linked != null){
            if (linked == 'TRUE') {
                changeTimeOfOperationVisibility(block, false);
            }
        }
    }
};

function appendTimeSettings(obj, block) {
    obj.timeOfOperation = block.getFieldValue('timeOfOperation');
    obj.timeOfOperation_units = block.getFieldValue('timeOfOperation_units');
    obj.linked = block.getFieldValue('linked_checkbox');
    if (block.getField('durationText')) {
        obj.duration = 	block.getFieldValue('durationText');
        obj.duration_units = block.getFieldValue('durationText_units');
    }
};

function naturalLanguageTime(block) {
    var naturalLanguage
    
    var time = block.getFieldValue('timeOfOperation');
    if (time != "-1") {
        naturalLanguage = " at time " + block.getFieldValue('timeOfOperation') + block.getFieldValue('timeOfOperation_units');
    } else {
        naturalLanguage = " upon last operation completion";
    }
    
    if (block.getField('durationText')) {
        naturalLanguage += ", for " + block.getFieldValue('durationText') + " " + block.getFieldValue('durationText_units');
    }
    return naturalLanguage;
};


























