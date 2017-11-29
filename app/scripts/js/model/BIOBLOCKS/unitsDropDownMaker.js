/*
The MIT License (MIT)

Copyright (c) 2016 Universidad Polit�cnica de Madrid

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
(function () {
    'use strict';
 }());
var unitsObj = {
    'volume' : [{'mL' : 'ml'}, {'L' : 'l'}, {'μL' : 'ul'} , {'nL':'nl'}],
    'frequency' : [{'Hz' : 'hz'}, {'kHz' : 'khz'} , {'MHz':'mhz'}],
    'length' : [{'nm' : 'nm'}, {'m' : 'm'}, {'cm' : 'cm'}, {'mm' : 'mm'}],
    'time' : [{'ms' : 'ms'}, {'s' : 's'}, {'minute' : 'minute'}, {'hr' : 'hr'}],
    'luminousIntensity' : [{'cd' : 'cd'}],
    'temperature' : [{'Cº' : 'c'}/*, {'K' : 'k'}*/],
    'electricPotential' : [{'V' : 'v'}]
};

var unitsConversionObj = {
    'L' : 1,
    'ml' : 1e-3,
    'ul' : 1e-6,
    'nl' : 1e-9,
    'hz' : 1,
    'khz' : 1e3,
    'mhz' : 1e6,
    'm' : 1,
    'nm' : 1e-9,
    's' : 1,
    'ms' : 1e-3,
    'minute' : 60,
    'hr' : 3600,
    'cd' : 1,
    'k' : 1,
    'c' : 273.15,
    'v' : 1
};

function makeUnitsDropDown(units, checkfunction = null) {
    if (unitsObj[units] !== null) {
        var unitsArray = [];
        var selectedUnits = unitsObj[units];
        for(var i = 0; i < selectedUnits.length; i++) {
            actualUnitArray = [];
            actualUnitObj = selectedUnits[i];
            for(var keys in actualUnitObj) {
                actualUnitArray.push(keys);
                actualUnitArray.push(actualUnitObj[keys]);
            }
            unitsArray.push(actualUnitArray);
        }
        return new Blockly.FieldDropdown(unitsArray, checkfunction);
    } else {
        console.err('unknow units ' + units);
        return new Blockly.FieldDropdown(['null','null']);
    }
}

function toStandardUnits(value, units) {
    if (units === 'c') {
        return value + unitsConversionObj[units];
    } else {
        return value * unitsConversionObj[units];
    }
}