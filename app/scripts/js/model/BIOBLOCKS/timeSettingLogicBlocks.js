/*
The MIT License (MIT)

Copyright (c) 2016 Universidad Polit�cnica de Madrid

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

Blockly.Blocks.bioblocks_while = {
    init : function() {
        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_CENTRE)
            .appendField("LOOP", "blockTitle");

        Blockly.Blocks['controls_whileUntil'].init.call(this);

        addTimeAttributes(this, false);

        this.setColour("#e06939");
    },

    optionsDisplay_: function (code, block) { //This is the extract of the code in JSON which is called by the Blockly.JavaScript['pipette'] function 

    },

    optionsDisplay_naturalLanguage: function (code, block) { //This is the extract of the code in JSON which is called by the Blockly.JavaScript['pipette'] function 

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

//Blockly.Blocks['bioblocks_if'] = jQuery.extend(true, {}, Blockly.Blocks['controls_if']); //make a deep copy of the original blockly if block

Blockly.Blocks.bioblocks_if = {
    init : function() {
        this.appendDummyInput()
            .setAlign(Blockly.ALIGN_CENTRE)
            .appendField("IF", "blockTitle");

        addTimeAttributes(this, false);

        Blockly.Blocks['controls_if'].init.call(this);
        
        var controlsIfMutationToDomFunction = this.mutationToDom;
        var controlsIfDomToMutationFunction = this.domToMutation;

        this.mutationToDom = function() {
            var container = controlsIfMutationToDomFunction.call(this);
            mutationToDomTime(container, this);
            return container;
        };

        this.domToMutation = function(xmlElement) {
            controlsIfDomToMutationFunction.call(this, xmlElement);
            domToMutationTime(xmlElement, this);
        };
        
        this.setColour("#e06939");
    },

    optionsDisplay_ : function (code, block) { //This is the extract of the code in JSON which is called by the Blockly.JavaScript['pipette'] function 

    },

    optionsDisplay_naturalLanguage : function (code, block) { //This is the extract of the code in JSON which is called by the Blockly.JavaScript['pipette'] function 

    }
}
