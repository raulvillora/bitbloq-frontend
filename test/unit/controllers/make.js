'use strict';

describe('Controller: MakeCtrl', function() {

    // load the controller's module
    beforeEach(module('bitbloqApp'));

    var MakeCtrl,
        scope,
        $bloqsUtils,
        bloqs = [{
            "connectors": [{
                "type": "connector--top",
                "accept": "connector--bottom"
            }, {
                "type": "connector--bottom",
                "accept": "connector--top"
            }],
            "name": "statement",
            "id": "558c146438c2918afb8dc6c7",
            "type": "statement",
            "links": [{
                "rel": "self",
                "href": "https://resources-qa.bqws.io/v1.0/resource/bitbloq:Bloqs/558c146438c2918afb8dc6c7"
            }]
        }, {
            "connectors": [{
                "type": "connector--output",
                "accept": "connector--input"
            }, {
                "name": "d0696d4f-c813-435d-a7f5-1aa33d510a98",
                "type": "connector--input",
                "accept": "connector--output",
                "acceptType": "string"
            }],
            "code": "String({TEXT})",
            "bloqClass": "bloq-string-create",
            "name": "stringCreate",
            "id": "558c146538c2918afb8dc6cd",
            "type": "output",
            "content": [
                [{
                    "alias": "text",
                    "value": "bloq-string-create-create"
                }, {
                    "name": "d0696d4f-c813-435d-a7f5-1aa33d510a98",
                    "alias": "bloqInput",
                    "bloqInputId": "TEXT",
                    "acceptType": "string"
                }]
            ],
            "returnType": {
                "type": "simple",
                "value": "string"
            },
            "links": [{
                "rel": "self",
                "href": "https://resources-qa.bqws.io/v1.0/resource/bitbloq:Bloqs/558c146538c2918afb8dc6cd"
            }]
        }, {
            "connectors": [{
                "type": "connector--output",
                "accept": "connector--input"
            }],
            "code": "{VALUE}",
            "bloqClass": "bloq-hw-variable-advanced",
            "name": "hwVariable",
            "id": "558c146538c2918afb8dc6ce",
            "type": "output",
            "content": [
                [{
                    "alias": "text",
                    "value": "bloq-hw-variable-advanced-variable"
                }, {
                    "options": "varComponents",
                    "alias": "dynamicDropdown",
                    "id": "VALUE"
                }]
            ],
            "returnType": {
                "type": "simple",
                "value": "var"
            },
            "links": [{
                "rel": "self",
                "href": "https://resources-qa.bqws.io/v1.0/resource/bitbloq:Bloqs/558c146538c2918afb8dc6ce"
            }]
        }, {
            "connectors": [{
                "type": "connector--output",
                "accept": "connector--input"
            }],
            "code": "{VALUE}",
            "bloqClass": "bloq-sw-variable-advanced",
            "name": "swVariable",
            "id": "558c146538c2918afb8dc6cf",
            "type": "output",
            "content": [
                [{
                    "alias": "text",
                    "value": "bloq-sw-variable-advanced-variable"
                }, {
                    "options": "softwareVars",
                    "alias": "dynamicDropdown",
                    "id": "VALUE"
                }]
            ],
            "returnType": {
                "type": "simple",
                "value": "var"
            },
            "links": [{
                "rel": "self",
                "href": "https://resources-qa.bqws.io/v1.0/resource/bitbloq:Bloqs/558c146538c2918afb8dc6cf"
            }]
        }, {
            "connectors": [{
                "type": "connector--output",
                "accept": "connector--input"
            }],
            "code": "{VAR}[{POSITION}]",
            "bloqClass": "bloq-array-variable",
            "name": "arrayVariable",
            "id": "558c146538c2918afb8dc6d0",
            "type": "output",
            "content": [
                [{
                    "alias": "text",
                    "value": "bloq-array-variable-variable"
                }, {
                    "options": "softwareVars",
                    "alias": "dynamicDropdown",
                    "id": "VAR"
                }, {
                    "alias": "text",
                    "value": "["
                }, {
                    "alias": "numberInput",
                    "id": "POSITION",
                    "value": 0.0
                }, {
                    "alias": "text",
                    "value": "]"
                }]
            ],
            "returnType": {
                "pointer": "true",
                "idDropdown": "VAR",
                "options": "softwareVars",
                "type": "fromDynamicDropdown"
            },
            "links": [{
                "rel": "self",
                "href": "https://resources-qa.bqws.io/v1.0/resource/bitbloq:Bloqs/558c146538c2918afb8dc6d0"
            }]
        }, {
            "connectors": [{
                "type": "connector--top",
                "accept": "connector--bottom"
            }, {
                "type": "connector--bottom",
                "accept": "connector--top"
            }, {
                "name": "938970e3-8cbd-4d55-8d4f-2b30c9af0989",
                "type": "connector--input",
                "accept": "connector--output",
                "acceptType": "all"
            }],
            "code": "{VALUE.connectionType} {NAME} = {VALUE};",
            "bloqClass": "bloq-declare-variable",
            "name": "declareVariable",
            "id": "558c146538c2918afb8dc6d1",
            "type": "statement",
            "content": [
                [{
                    "alias": "text",
                    "value": "bloq-declare-variable-declare"
                }, {
                    "alias": "varInput",
                    "id": "NAME",
                    "value": ""
                }, {
                    "alias": "text",
                    "value": "="
                }, {
                    "name": "938970e3-8cbd-4d55-8d4f-2b30c9af0989",
                    "alias": "bloqInput",
                    "bloqInputId": "VALUE",
                    "acceptType": "all"
                }]
            ],
            "returnType": {
                "type": "fromInput",
                "bloqInputId": "VALUE"
            },
            "createDynamicContent": "softwareVars",
            "links": [{
                "rel": "self",
                "href": "https://resources-qa.bqws.io/v1.0/resource/bitbloq:Bloqs/558c146538c2918afb8dc6d1"
            }]
        }, {
            "connectors": [{
                "type": "connector--output",
                "accept": "connector--input"
            }],
            "code": "{VAR}",
            "bloqClass": "bloq-select-variable",
            "name": "selectVariable",
            "id": "558c146638c2918afb8dc6d2",
            "type": "output",
            "content": [
                [{
                    "alias": "text",
                    "value": "bloq-select-variable-variable"
                }, {
                    "options": "softwareVars",
                    "alias": "dynamicDropdown",
                    "id": "VAR"
                }]
            ],
            "returnType": {
                "idDropdown": "VAR",
                "options": "softwareVars",
                "type": "fromDynamicDropdown"
            },
            "links": [{
                "rel": "self",
                "href": "https://resources-qa.bqws.io/v1.0/resource/bitbloq:Bloqs/558c146638c2918afb8dc6d2"
            }]
        }, {
            "connectors": [{
                "type": "connector--top",
                "accept": "connector--bottom"
            }, {
                "type": "connector--bottom",
                "accept": "connector--top"
            }, {
                "name": "6dd0c230-d53c-46f6-af8c-ea67a97c3ccf",
                "type": "connector--input",
                "accept": "connector--output",
                "acceptType": {
                    "pointer": "true",
                    "idDropdown": "NAME",
                    "options": "softwareVars",
                    "type": "fromDynamicDropdown"
                }
            }],
            "code": "{NAME}[{ITERATOR}] = {VALUE};",
            "bloqClass": "bloq-set-variableArray",
            "name": "setArrayVariable",
            "id": "558c146638c2918afb8dc6d3",
            "type": "statement",
            "content": [
                [{
                    "alias": "text",
                    "value": "bloq-set-variableArray-variable"
                }, {
                    "options": "softwareVars",
                    "alias": "dynamicDropdown",
                    "id": "NAME"
                }, {
                    "alias": "text",
                    "value": "["
                }, {
                    "alias": "numberInput",
                    "id": "ITERATOR",
                    "value": 0.0
                }, {
                    "alias": "text",
                    "value": "]"
                }, {
                    "alias": "text",
                    "value": "="
                }, {
                    "name": "6dd0c230-d53c-46f6-af8c-ea67a97c3ccf",
                    "alias": "bloqInput",
                    "bloqInputId": "VALUE",
                    "acceptType": {
                        "pointer": "true",
                        "idDropdown": "NAME",
                        "options": "softwareVars",
                        "type": "fromDynamicDropdown"
                    }
                }]
            ],
            "links": [{
                "rel": "self",
                "href": "https://resources-qa.bqws.io/v1.0/resource/bitbloq:Bloqs/558c146638c2918afb8dc6d3"
            }]
        }, {
            "connectors": [{
                "type": "connector--top",
                "accept": "connector--bottom"
            }, {
                "type": "connector--bottom",
                "accept": "connector--top"
            }, {
                "name": "b4729e9d-804d-4a95-b39b-4cf67d2b87b0",
                "type": "connector--input",
                "accept": "connector--output",
                "acceptType": {
                    "idDropdown": "NAME",
                    "options": "softwareVars",
                    "type": "fromDynamicDropdown"
                }
            }],
            "code": "{NAME} = {VALUE};",
            "bloqClass": "bloq-set-variable",
            "name": "setVariable",
            "id": "558c146638c2918afb8dc6d4",
            "type": "statement",
            "content": [
                [{
                    "alias": "text",
                    "value": "bloq-set-variable-variable"
                }, {
                    "options": "softwareVars",
                    "alias": "dynamicDropdown",
                    "id": "NAME"
                }, {
                    "alias": "text",
                    "value": "="
                }, {
                    "name": "b4729e9d-804d-4a95-b39b-4cf67d2b87b0",
                    "alias": "bloqInput",
                    "bloqInputId": "VALUE",
                    "acceptType": {
                        "idDropdown": "NAME",
                        "options": "softwareVars",
                        "type": "fromDynamicDropdown"
                    }
                }]
            ],
            "links": [{
                "rel": "self",
                "href": "https://resources-qa.bqws.io/v1.0/resource/bitbloq:Bloqs/558c146638c2918afb8dc6d4"
            }]
        }, {
            "connectors": [{
                "type": "connector--top",
                "accept": "connector--bottom"
            }, {
                "type": "connector--bottom",
                "accept": "connector--top"
            }, {
                "type": "connector--root",
                "accept": "connector--top"
            }, {
                "name": "724f0eaa-1e54-40a0-82dc-bb980156c001",
                "type": "connector--input",
                "accept": "connector--output",
                "acceptType": "all"
            }],
            "code": "case {VAR}:{{STATEMENTS}break;}",
            "bloqClass": "bloq-case",
            "name": "case",
            "id": "558c145d38c2918afb8dc6a1",
            "type": "statement-input",
            "content": [
                [{
                    "alias": "text",
                    "value": "bloq-case-ifSameTo"
                }, {
                    "name": "724f0eaa-1e54-40a0-82dc-bb980156c001",
                    "alias": "bloqInput",
                    "bloqInputId": "VAR",
                    "acceptType": "all"
                }, {
                    "alias": "text",
                    "value": "bloq-case-exec"
                }]
            ],
            "links": [{
                "rel": "self",
                "href": "https://resources-qa.bqws.io/v1.0/resource/bitbloq:Bloqs/558c145d38c2918afb8dc6a1"
            }]
        }, {
            "connectors": [{
                "type": "connector--top",
                "accept": "connector--bottom"
            }, {
                "type": "connector--bottom",
                "accept": "connector--top"
            }, {
                "type": "connector--root",
                "accept": "connector--top"
            }, {
                "name": "cfc1eff6-7e4f-467f-9a38-949acbffbcf7",
                "type": "connector--input",
                "accept": "connector--output",
                "acceptType": "all"
            }],
            "code": "else if ({VAR}){{STATEMENTS}}",
            "bloqClass": "bloq-else-if",
            "name": "elseif",
            "id": "558c145e38c2918afb8dc6a5",
            "type": "statement-input",
            "content": [
                [{
                    "alias": "text",
                    "value": "bloq-else-if-if"
                }, {
                    "name": "cfc1eff6-7e4f-467f-9a38-949acbffbcf7",
                    "alias": "bloqInput",
                    "bloqInputId": "VAR",
                    "acceptType": "all"
                }, {
                    "alias": "text",
                    "value": "bloq-else-if-else"
                }]
            ],
            "links": [{
                "rel": "self",
                "href": "https://resources-qa.bqws.io/v1.0/resource/bitbloq:Bloqs/558c145e38c2918afb8dc6a5"
            }]
        }, {
            "connectors": [{
                "type": "connector--top",
                "accept": "connector--bottom"
            }, {
                "type": "connector--bottom",
                "accept": "connector--top"
            }, {
                "type": "connector--root",
                "accept": "connector--top"
            }, {
                "name": "4260577f-f11b-4fe0-b514-5af22f145691",
                "type": "connector--input",
                "accept": "connector--output",
                "acceptType": "all"
            }],
            "code": "if({CONDITION}){{STATEMENTS}}",
            "bloqClass": "bloq-if",
            "name": "if",
            "id": "558c145f38c2918afb8dc6a7",
            "type": "statement-input",
            "content": [
                [{
                    "alias": "text",
                    "value": "bloq-if-if"
                }, {
                    "name": "4260577f-f11b-4fe0-b514-5af22f145691",
                    "alias": "bloqInput",
                    "bloqInputId": "CONDITION",
                    "acceptType": "all"
                }, {
                    "alias": "text",
                    "value": "bloq-if-exec"
                }]
            ],
            "links": [{
                "rel": "self",
                "href": "https://resources-qa.bqws.io/v1.0/resource/bitbloq:Bloqs/558c145f38c2918afb8dc6a7"
            }]
        }, {
            "connectors": [{
                "type": "connector--top",
                "accept": "connector--bottom"
            }, {
                "type": "connector--bottom",
                "accept": "connector--top"
            }, {
                "name": "ac587c08-7d2c-4db4-b32c-90c419e0be08",
                "type": "connector--input",
                "accept": "connector--output",
                "acceptType": "all"
            }],
            "code": "delay({TIME});",
            "bloqClass": "bloq-wait",
            "name": "wait",
            "id": "558c145f38c2918afb8dc6a9",
            "type": "statement",
            "content": [
                [{
                    "alias": "text",
                    "value": "bloq-wait-wait"
                }, {
                    "name": "ac587c08-7d2c-4db4-b32c-90c419e0be08",
                    "alias": "bloqInput",
                    "bloqInputId": "TIME",
                    "acceptType": "all"
                }]
            ],
            "links": [{
                "rel": "self",
                "href": "https://resources-qa.bqws.io/v1.0/resource/bitbloq:Bloqs/558c145f38c2918afb8dc6a9"
            }]
        }, {
            "connectors": [{
                "type": "connector--top",
                "accept": "connector--bottom"
            }, {
                "type": "connector--bottom",
                "accept": "connector--top"
            }, {
                "type": "connector--root",
                "accept": "connector--top"
            }, {
                "name": "45e70300-7639-4a28-b3c5-2ea465ec24e2",
                "type": "connector--input",
                "accept": "connector--output",
                "acceptType": "all"
            }],
            "code": "while ({CONDITION}){{STATEMENTS}}",
            "bloqClass": "bloq-while",
            "name": "while",
            "id": "558c146038c2918afb8dc6aa",
            "type": "statement-input",
            "content": [
                [{
                    "alias": "text",
                    "value": "bloq-while-while"
                }, {
                    "name": "45e70300-7639-4a28-b3c5-2ea465ec24e2",
                    "alias": "bloqInput",
                    "bloqInputId": "CONDITION",
                    "acceptType": "all"
                }, {
                    "alias": "text",
                    "value": "bloq-while-exec"
                }]
            ],
            "links": [{
                "rel": "self",
                "href": "https://resources-qa.bqws.io/v1.0/resource/bitbloq:Bloqs/558c146038c2918afb8dc6aa"
            }]
        }, {
            "connectors": [{
                "type": "connector--output",
                "accept": "connector--input"
            }],
            "code": "{TYPE} {VARNAME}",
            "bloqClass": "bloq-argument",
            "name": "argument",
            "id": "558c146038c2918afb8dc6ab",
            "type": "output",
            "content": [
                [{
                    "alias": "text",
                    "value": "bloq-argument-var"
                }, {
                    "options": [{
                        "label": "bloq-argument-float",
                        "value": "float"
                    }, {
                        "label": "bloq-argument-string",
                        "value": "String"
                    }, {
                        "label": "bloq-argument-bool",
                        "value": "bool"
                    }],
                    "alias": "staticDropdown",
                    "id": "TYPE"
                }, {
                    "alias": "varInput",
                    "id": "VARNAME",
                    "value": ""
                }]
            ],
            "returnType": {
                "type": "simple",
                "value": "var"
            },
            "createDynamicContent": "softwareVars",
            "links": [{
                "rel": "self",
                "href": "https://resources-qa.bqws.io/v1.0/resource/bitbloq:Bloqs/558c146038c2918afb8dc6ab"
            }]
        }, {
            "connectors": [{
                "type": "connector--output",
                "accept": "connector--input"
            }, {
                "name": "c8e8cf99-de8f-485e-a2fd-c690c9d88f22",
                "type": "connector--input",
                "accept": "connector--output",
                "acceptType": "all"
            }, {
                "name": "c6306407-6cb4-48e2-b762-24ba83ceefe2",
                "type": "connector--input",
                "accept": "connector--output",
                "acceptType": "all"
            }],
            "code": "{ARG1},{ARG2}",
            "bloqClass": "bloq-arguments",
            "name": "arguments",
            "id": "558c146038c2918afb8dc6ac",
            "type": "output",
            "content": [
                [{
                    "name": "c8e8cf99-de8f-485e-a2fd-c690c9d88f22",
                    "alias": "bloqInput",
                    "bloqInputId": "ARG1",
                    "acceptType": "all"
                }, {
                    "alias": "text",
                    "value": ","
                }, {
                    "name": "c6306407-6cb4-48e2-b762-24ba83ceefe2",
                    "alias": "bloqInput",
                    "bloqInputId": "ARG2",
                    "acceptType": "all"
                }]
            ],
            "returnType": {
                "type": "simple",
                "value": "var"
            },
            "createDynamicContent": "softwareVars",
            "links": [{
                "rel": "self",
                "href": "https://resources-qa.bqws.io/v1.0/resource/bitbloq:Bloqs/558c146038c2918afb8dc6ac"
            }]
        }, {
            "connectors": [{
                "type": "connector--top",
                "accept": "connector--bottom"
            }, {
                "type": "connector--bottom",
                "accept": "connector--top"
            }],
            "code": "{FUNCTION}({FUNCTION.args});",
            "bloqClass": "bloq-invoke-function",
            "name": "invokeFunction",
            "id": "558c146038c2918afb8dc6ad",
            "type": "statement",
            "content": [
                [{
                    "alias": "text",
                    "value": "bloq-invoke-function-exec"
                }, {
                    "options": "voidFunctions",
                    "alias": "dynamicDropdown",
                    "id": "FUNCTION"
                }]
            ],
            "returnType": {
                "idDropdown": "FUNCTION",
                "options": "voidFunctions",
                "type": "fromDynamicDropdown"
            },
            "links": [{
                "rel": "self",
                "href": "https://resources-qa.bqws.io/v1.0/resource/bitbloq:Bloqs/558c146038c2918afb8dc6ad"
            }]
        }, {
            "connectors": [{
                "type": "connector--output",
                "accept": "connector--input"
            }],
            "code": "{FUNCTION}({FUNCTION.args});",
            "bloqClass": "bloq-invoke-return-function",
            "name": "invokeReturnFunction",
            "id": "558c146038c2918afb8dc6ae",
            "type": "output",
            "content": [
                [{
                    "alias": "text",
                    "value": "bloq-invoke-return-function-exec"
                }, {
                    "options": "returnFunctions",
                    "alias": "dynamicDropdown",
                    "id": "FUNCTION"
                }]
            ],
            "returnType": {
                "idDropdown": "FUNCTION",
                "options": "returnFunctions",
                "type": "fromDynamicDropdown"
            },
            "links": [{
                "rel": "self",
                "href": "https://resources-qa.bqws.io/v1.0/resource/bitbloq:Bloqs/558c146038c2918afb8dc6ae"
            }]
        }, {
            "connectors": [{
                "type": "connector--top",
                "accept": "connector--bottom"
            }, {
                "type": "connector--bottom",
                "accept": "connector--top"
            }, {
                "name": "e1f2c313-57b4-430e-8868-dc6b0323a40d",
                "type": "connector--input",
                "accept": "connector--output",
                "acceptType": "all"
            }],
            "code": "return {RETURN};",
            "bloqClass": "bloq-return",
            "name": "return",
            "id": "558c146038c2918afb8dc6af",
            "type": "statement",
            "content": [
                [{
                    "alias": "text",
                    "value": "bloq-return-return"
                }, {
                    "name": "e1f2c313-57b4-430e-8868-dc6b0323a40d",
                    "alias": "bloqInput",
                    "bloqInputId": "RETURN",
                    "acceptType": "all"
                }]
            ],
            "links": [{
                "rel": "self",
                "href": "https://resources-qa.bqws.io/v1.0/resource/bitbloq:Bloqs/558c146038c2918afb8dc6af"
            }]
        }, {
            "connectors": [{
                "type": "connector--top",
                "accept": "connector--bottom"
            }, {
                "type": "connector--bottom",
                "accept": "connector--top"
            }, {
                "type": "connector--root",
                "accept": "connector--top"
            }, {
                "name": "3407c1f1-8435-4482-9182-27565e9699f2",
                "type": "connector--input",
                "accept": "connector--output",
                "acceptType": "all"
            }],
            "code": "{RETURN.connectionType} {FUNCNAME} () {{STATEMENTS}return {RETURN};}",
            "bloqClass": "bloq-return-function",
            "name": "returnFunction",
            "id": "558c146038c2918afb8dc6b0",
            "type": "statement-input",
            "content": [
                [{
                    "alias": "text",
                    "value": "bloq-return-function-declare"
                }, {
                    "alias": "varInput",
                    "id": "FUNCNAME",
                    "value": ""
                }, {
                    "alias": "text",
                    "position": "DOWN",
                    "value": "bloq-return-function-return"
                }, {
                    "name": "3407c1f1-8435-4482-9182-27565e9699f2",
                    "alias": "bloqInput",
                    "position": "DOWN",
                    "bloqInputId": "RETURN",
                    "acceptType": "all"
                }]
            ],
            "returnType": {
                "type": "fromInput",
                "bloqInputId": "RETURN"
            },
            "createDynamicContent": "returnFunctions",
            "links": [{
                "rel": "self",
                "href": "https://resources-qa.bqws.io/v1.0/resource/bitbloq:Bloqs/558c146038c2918afb8dc6b0"
            }]
        }, {
            "connectors": [{
                "type": "connector--top",
                "accept": "connector--bottom"
            }, {
                "type": "connector--bottom",
                "accept": "connector--top"
            }, {
                "type": "connector--root",
                "accept": "connector--top"
            }],
            "code": "void {FUNCNAME} (){{STATEMENTS}}",
            "bloqClass": "bloq-void-function",
            "name": "voidFunction",
            "id": "558c146138c2918afb8dc6b2",
            "type": "statement-input",
            "content": [
                [{
                    "alias": "text",
                    "value": "bloq-void-function-declare"
                }, {
                    "alias": "varInput",
                    "id": "FUNCNAME",
                    "value": ""
                }]
            ],
            "returnType": {
                "type": "simple",
                "value": "void"
            },
            "createDynamicContent": "voidFunctions",
            "links": [{
                "rel": "self",
                "href": "https://resources-qa.bqws.io/v1.0/resource/bitbloq:Bloqs/558c146138c2918afb8dc6b2"
            }]
        }, {
            "connectors": [{
                "type": "connector--output",
                "accept": "connector--input"
            }, {
                "name": "59357f13-9b75-42b5-bed6-0789fe4341ae",
                "type": "connector--input",
                "accept": "connector--output",
                "acceptType": "all"
            }],
            "code": "(bool *)malloc({VALUE}*sizeof(bool))",
            "bloqClass": "bloq-boolArray-advanced",
            "name": "boolArrayAdvanced",
            "id": "558c146138c2918afb8dc6b5",
            "type": "output",
            "content": [
                [{
                    "alias": "text",
                    "value": "bloq-boolArray-advanced-arraySize"
                }, {
                    "name": "59357f13-9b75-42b5-bed6-0789fe4341ae",
                    "alias": "bloqInput",
                    "bloqInputId": "VALUE",
                    "acceptType": "all"
                }, {
                    "alias": "text",
                    "value": "bloq-boolArray-advanced-boolType"
                }]
            ],
            "returnType": {
                "type": "simple",
                "value": "bool *"
            },
            "links": [{
                "rel": "self",
                "href": "https://resources-qa.bqws.io/v1.0/resource/bitbloq:Bloqs/558c146138c2918afb8dc6b5"
            }]
        }, {
            "connectors": [{
                "type": "connector--output",
                "accept": "connector--input"
            }],
            "code": "{STATE}",
            "bloqClass": "bloq-boolean",
            "name": "boolean",
            "id": "558c146138c2918afb8dc6b7",
            "type": "output",
            "content": [
                [{
                    "options": [{
                        "label": "bloq-boolean-true",
                        "value": "true"
                    }, {
                        "label": "bloq-boolean-false",
                        "value": "false"
                    }],
                    "alias": "staticDropdown",
                    "id": "STATE"
                }]
            ],
            "returnType": {
                "type": "simple",
                "value": "bool"
            },
            "links": [{
                "rel": "self",
                "href": "https://resources-qa.bqws.io/v1.0/resource/bitbloq:Bloqs/558c146138c2918afb8dc6b7"
            }]
        }, {
            "connectors": [{
                "type": "connector--output",
                "accept": "connector--input"
            }, {
                "name": "a27730c8-319b-4121-8ed1-3bc2a5972550",
                "type": "connector--input",
                "accept": "connector--output",
                "acceptType": "all"
            }, {
                "name": "9ff594fa-3461-4388-9c43-7c1f22938834",
                "type": "connector--input",
                "accept": "connector--output",
                "acceptType": "all"
            }],
            "code": "{ARG1} {OPERATOR} {ARG2}",
            "bloqClass": "bloq-equality-operations",
            "name": "equalityOperations",
            "id": "558c146138c2918afb8dc6b8",
            "type": "output",
            "content": [
                [{
                    "name": "a27730c8-319b-4121-8ed1-3bc2a5972550",
                    "alias": "bloqInput",
                    "bloqInputId": "ARG1",
                    "acceptType": "all"
                }, {
                    "options": [{
                        "label": "=",
                        "value": "=="
                    }, {
                        "label": "!=",
                        "value": "!="
                    }, {
                        "label": ">",
                        "value": ">"
                    }, {
                        "label": ">=",
                        "value": ">="
                    }, {
                        "label": "<",
                        "value": "<"
                    }, {
                        "label": "<=",
                        "value": "<="
                    }],
                    "alias": "staticDropdown",
                    "id": "OPERATOR"
                }, {
                    "name": "9ff594fa-3461-4388-9c43-7c1f22938834",
                    "alias": "bloqInput",
                    "bloqInputId": "ARG2",
                    "acceptType": "all"
                }]
            ],
            "returnType": {
                "type": "simple",
                "value": "bool"
            },
            "links": [{
                "rel": "self",
                "href": "https://resources-qa.bqws.io/v1.0/resource/bitbloq:Bloqs/558c146138c2918afb8dc6b8"
            }]
        }, {
            "connectors": [{
                "type": "connector--output",
                "accept": "connector--input"
            }, {
                "name": "757eaccc-8001-4bb6-b4b8-436afbb58408",
                "type": "connector--input",
                "accept": "connector--output",
                "acceptType": "all"
            }, {
                "name": "40fb4ae6-4076-4256-8461-b78f14c04829",
                "type": "connector--input",
                "accept": "connector--output",
                "acceptType": "all"
            }],
            "code": "{ARG1} {OPERATOR} {ARG2}",
            "bloqClass": "bloq-logic-operations",
            "name": "logicOperations",
            "id": "558c146138c2918afb8dc6b9",
            "type": "output",
            "content": [
                [{
                    "name": "757eaccc-8001-4bb6-b4b8-436afbb58408",
                    "alias": "bloqInput",
                    "bloqInputId": "ARG1",
                    "acceptType": "all"
                }, {
                    "options": [{
                        "label": "bloq-logic-operations-and",
                        "value": "&&"
                    }, {
                        "label": "bloq-logic-operations-or",
                        "value": "||"
                    }],
                    "alias": "staticDropdown",
                    "id": "OPERATOR"
                }, {
                    "name": "40fb4ae6-4076-4256-8461-b78f14c04829",
                    "alias": "bloqInput",
                    "bloqInputId": "ARG2",
                    "acceptType": "all"
                }]
            ],
            "returnType": {
                "type": "simple",
                "value": "bool"
            },
            "links": [{
                "rel": "self",
                "href": "https://resources-qa.bqws.io/v1.0/resource/bitbloq:Bloqs/558c146138c2918afb8dc6b9"
            }]
        }, {
            "connectors": [{
                "type": "connector--output",
                "accept": "connector--input"
            }, {
                "name": "66c0495b-1fc2-4d4a-a6b7-a9912a4f481b",
                "type": "connector--input",
                "accept": "connector--output",
                "acceptType": "all"
            }],
            "code": "!{CONDITION}",
            "bloqClass": "bloq-not",
            "name": "not",
            "id": "558c146238c2918afb8dc6ba",
            "type": "output",
            "content": [
                [{
                    "alias": "text",
                    "value": "bloq-not-not"
                }, {
                    "name": "66c0495b-1fc2-4d4a-a6b7-a9912a4f481b",
                    "alias": "bloqInput",
                    "bloqInputId": "CONDITION",
                    "acceptType": "all"
                }]
            ],
            "returnType": {
                "type": "simple",
                "value": "bool"
            },
            "links": [{
                "rel": "self",
                "href": "https://resources-qa.bqws.io/v1.0/resource/bitbloq:Bloqs/558c146238c2918afb8dc6ba"
            }]
        }, {
            "connectors": [{
                "type": "connector--empty"
            }, {
                "type": "connector--empty"
            }, {
                "type": "connector--root",
                "accept": "connector--top"
            }],
            "code": "void loop(){{STATEMENTS}}",
            "headerText": "bloq-loop-header",
            "bloqClass": "bloq-loop",
            "name": "loopBloq",
            "id": "558c146238c2918afb8dc6bb",
            "descriptionText": "bloq-loop-description",
            "type": "group",
            "content": [],
            "links": [{
                "rel": "self",
                "href": "https://resources-qa.bqws.io/v1.0/resource/bitbloq:Bloqs/558c146238c2918afb8dc6bb"
            }]
        }, {
            "connectors": [{
                "type": "connector--empty"
            }, {
                "type": "connector--empty"
            }, {
                "type": "connector--root",
                "accept": "connector--top"
            }],
            "code": "void setup(){{STATEMENTS}}",
            "headerText": "bloq-setup-header",
            "bloqClass": "bloq-setup",
            "name": "setupBloq",
            "id": "558c146238c2918afb8dc6bc",
            "descriptionText": "bloq-setup-description",
            "type": "group",
            "content": [],
            "links": [{
                "rel": "self",
                "href": "https://resources-qa.bqws.io/v1.0/resource/bitbloq:Bloqs/558c146238c2918afb8dc6bc"
            }]
        }, {
            "connectors": [{
                "type": "connector--empty"
            }, {
                "type": "connector--empty"
            }, {
                "type": "connector--root",
                "accept": "connector--top"
            }],
            "code": "{STATEMENTS}",
            "headerText": "bloq-var-header",
            "bloqClass": "bloq-vars",
            "name": "varsBloq",
            "id": "558c146238c2918afb8dc6bd",
            "descriptionText": "bloq-var-description",
            "type": "group",
            "content": [],
            "links": [{
                "rel": "self",
                "href": "https://resources-qa.bqws.io/v1.0/resource/bitbloq:Bloqs/558c146238c2918afb8dc6bd"
            }]
        }, {
            "connectors": [{
                "type": "connector--output",
                "accept": "connector--input"
            }, {
                "name": "3fc430f6-060d-4cfc-bd0a-669570d8d82c",
                "type": "connector--input",
                "accept": "connector--output",
                "acceptType": "all"
            }],
            "code": "({TYPE})malloc({VALUE}*sizeof({TYPE}.withoutAsterisk))",
            "bloqClass": "bloq-numberArray-advanced",
            "name": "numberArrayAdvanced",
            "id": "558c146238c2918afb8dc6be",
            "type": "output",
            "content": [
                [{
                    "alias": "text",
                    "value": "bloq-numberArray-advanced-arraySize"
                }, {
                    "name": "3fc430f6-060d-4cfc-bd0a-669570d8d82c",
                    "alias": "bloqInput",
                    "bloqInputId": "VALUE",
                    "acceptType": "all"
                }, {
                    "alias": "text",
                    "value": "bloq-numberArray-advanced-type"
                }, {
                    "options": [{
                        "label": "bloq-numberArray-advanced-float",
                        "value": "float *"
                    }, {
                        "label": "bloq-numberArray-advanced-int",
                        "value": "int *"
                    }],
                    "alias": "staticDropdown",
                    "id": "TYPE"
                }]
            ],
            "returnType": {
                "idDropdown": "TYPE",
                "options": "softwareVars",
                "type": "fromDropdown"
            },
            "links": [{
                "rel": "self",
                "href": "https://resources-qa.bqws.io/v1.0/resource/bitbloq:Bloqs/558c146238c2918afb8dc6be"
            }]
        }, {
            "connectors": [{
                "type": "connector--output",
                "accept": "connector--input"
            }, {
                "name": "8d4e4251-db16-4109-9af4-461c7d987114",
                "type": "connector--input",
                "accept": "connector--output",
                "acceptType": "float"
            }, {
                "name": "148a1fc8-fa81-4494-9652-27e14e6714a9",
                "type": "connector--input",
                "accept": "connector--output",
                "acceptType": "float"
            }],
            "code": "'{OPERATOR}' === '^'? 'pow({ARG1},{ARG2})' : '{ARG1} {OPERATOR} {ARG2}'",
            "bloqClass": "bloq-basic-operations",
            "name": "basicOperations",
            "id": "558c146238c2918afb8dc6bf",
            "type": "output",
            "content": [
                [{
                    "name": "8d4e4251-db16-4109-9af4-461c7d987114",
                    "alias": "bloqInput",
                    "bloqInputId": "ARG1",
                    "acceptType": "float"
                }, {
                    "options": [{
                        "label": "+",
                        "value": "+"
                    }, {
                        "label": "-",
                        "value": "-"
                    }, {
                        "label": "x",
                        "value": "*"
                    }, {
                        "label": "/",
                        "value": "/"
                    }, {
                        "label": "^",
                        "value": "^"
                    }],
                    "alias": "staticDropdown",
                    "id": "OPERATOR"
                }, {
                    "name": "148a1fc8-fa81-4494-9652-27e14e6714a9",
                    "alias": "bloqInput",
                    "bloqInputId": "ARG2",
                    "acceptType": "float"
                }]
            ],
            "returnType": {
                "type": "simple",
                "value": "float"
            },
            "links": [{
                "rel": "self",
                "href": "https://resources-qa.bqws.io/v1.0/resource/bitbloq:Bloqs/558c146238c2918afb8dc6bf"
            }]
        }, {
            "connectors": [{
                "type": "connector--output",
                "accept": "connector--input"
            }, {
                "name": "bf4126ed-5325-414e-bcbc-2fca8ace5a46",
                "type": "connector--input",
                "accept": "connector--output",
                "acceptType": "float"
            }, {
                "name": "edbc257f-7c00-4b1b-ab85-f010bdcf90df",
                "type": "connector--input",
                "accept": "connector--output",
                "acceptType": "float"
            }],
            "code": "map({VAR},0,1023,0,{MAXVAL})",
            "bloqClass": "bloq-map",
            "name": "map",
            "id": "558c146338c2918afb8dc6c0",
            "type": "output",
            "content": [
                [{
                    "alias": "text",
                    "value": "bloq-map-map"
                }, {
                    "name": "bf4126ed-5325-414e-bcbc-2fca8ace5a46",
                    "alias": "bloqInput",
                    "bloqInputId": "VAR",
                    "acceptType": "float"
                }, {
                    "alias": "text",
                    "value": "bloq-map-value"
                }, {
                    "name": "edbc257f-7c00-4b1b-ab85-f010bdcf90df",
                    "alias": "bloqInput",
                    "bloqInputId": "MAXVAL",
                    "acceptType": "float"
                }, {
                    "alias": "text",
                    "value": "]"
                }]
            ],
            "returnType": {
                "type": "simple",
                "value": "float"
            },
            "links": [{
                "rel": "self",
                "href": "https://resources-qa.bqws.io/v1.0/resource/bitbloq:Bloqs/558c146338c2918afb8dc6c0"
            }]
        }, {
            "connectors": [{
                "type": "connector--output",
                "accept": "connector--input"
            }, {
                "name": "cd6ecfe6-235b-4970-be31-58aeefbcd72d",
                "type": "connector--input",
                "accept": "connector--output",
                "acceptType": "float"
            }, {
                "name": "c672355f-0303-48ea-a3f8-293ac3431e40",
                "type": "connector--input",
                "accept": "connector--output",
                "acceptType": "float"
            }, {
                "name": "3f28d825-4884-42f1-9c5a-2d23018d1205",
                "type": "connector--input",
                "accept": "connector--output",
                "acceptType": "float"
            }, {
                "name": "b4ef03c2-283c-4312-a02b-7b3d7fde3dfe",
                "type": "connector--input",
                "accept": "connector--output",
                "acceptType": "float"
            }, {
                "name": "820aa4d9-63d9-4c95-97a8-e60c6db8a4ef",
                "type": "connector--input",
                "accept": "connector--output",
                "acceptType": "float"
            }],
            "code": "map({VAR},{INITMIN},{INITMAX},{FINMIN},{FINMAX})",
            "bloqClass": "bloq-map-advanced",
            "name": "mapAdvanced",
            "id": "558c146338c2918afb8dc6c1",
            "type": "output",
            "content": [
                [{
                    "alias": "text",
                    "value": "bloq-map-advanced-map"
                }, {
                    "name": "cd6ecfe6-235b-4970-be31-58aeefbcd72d",
                    "alias": "bloqInput",
                    "bloqInputId": "VAR",
                    "acceptType": "float"
                }, {
                    "alias": "text",
                    "value": "bloq-map-advanced-value"
                }, {
                    "name": "c672355f-0303-48ea-a3f8-293ac3431e40",
                    "alias": "bloqInput",
                    "bloqInputId": "INITMIN",
                    "acceptType": "float"
                }, {
                    "alias": "text",
                    "value": "-"
                }, {
                    "name": "3f28d825-4884-42f1-9c5a-2d23018d1205",
                    "alias": "bloqInput",
                    "bloqInputId": "INITMAX",
                    "acceptType": "float"
                }, {
                    "alias": "text",
                    "value": "bloq-map-advanced-and"
                }, {
                    "name": "b4ef03c2-283c-4312-a02b-7b3d7fde3dfe",
                    "alias": "bloqInput",
                    "bloqInputId": "FINMIN",
                    "acceptType": "float"
                }, {
                    "alias": "text",
                    "value": "-"
                }, {
                    "name": "820aa4d9-63d9-4c95-97a8-e60c6db8a4ef",
                    "alias": "bloqInput",
                    "bloqInputId": "FINMAX",
                    "acceptType": "float"
                }, {
                    "alias": "text",
                    "value": "]"
                }]
            ],
            "returnType": {
                "type": "simple",
                "value": "float"
            },
            "links": [{
                "rel": "self",
                "href": "https://resources-qa.bqws.io/v1.0/resource/bitbloq:Bloqs/558c146338c2918afb8dc6c1"
            }]
        }, {
            "connectors": [{
                "type": "connector--output",
                "accept": "connector--input"
            }, {
                "name": "46d0ed29-0936-45dc-85f8-589627ed7d74",
                "type": "connector--input",
                "accept": "connector--output",
                "acceptType": "all"
            }],
            "code": "{OPERATOR}({ARG})",
            "bloqClass": "bloq-math-operations",
            "name": "mathOperations",
            "id": "558c146338c2918afb8dc6c2",
            "type": "output",
            "content": [
                [{
                    "options": [{
                        "label": "bloq-math-operations-sqrt",
                        "value": "sqrt"
                    }, {
                        "label": "bloq-math-operations-abs",
                        "value": "abs"
                    }, {
                        "label": "ln",
                        "value": "log"
                    }, {
                        "label": "log10",
                        "value": "log10"
                    }, {
                        "label": "e^",
                        "value": "exp"
                    }],
                    "alias": "staticDropdown",
                    "id": "OPERATOR"
                }, {
                    "name": "46d0ed29-0936-45dc-85f8-589627ed7d74",
                    "alias": "bloqInput",
                    "bloqInputId": "ARG",
                    "acceptType": "all"
                }]
            ],
            "returnType": {
                "type": "simple",
                "value": "float"
            },
            "links": [{
                "rel": "self",
                "href": "https://resources-qa.bqws.io/v1.0/resource/bitbloq:Bloqs/558c146338c2918afb8dc6c2"
            }]
        }, {
            "connectors": [{
                "type": "connector--output",
                "accept": "connector--input"
            }],
            "code": "{VALUE}",
            "bloqClass": "bloq-number",
            "name": "number",
            "id": "558c146338c2918afb8dc6c3",
            "type": "output",
            "content": [
                [{
                    "alias": "numberInput",
                    "id": "VALUE",
                    "value": 0.0
                }]
            ],
            "returnType": {
                "type": "simple",
                "value": "float"
            },
            "links": [{
                "rel": "self",
                "href": "https://resources-qa.bqws.io/v1.0/resource/bitbloq:Bloqs/558c146338c2918afb8dc6c3"
            }]
        }, {
            "connectors": [{
                "type": "connector--output",
                "accept": "connector--input"
            }],
            "code": "(float*)malloc({VALUE}*sizeof(float))",
            "bloqClass": "bloq-numberArray",
            "name": "numberArray",
            "id": "558c146338c2918afb8dc6c4",
            "type": "output",
            "content": [
                [{
                    "alias": "text",
                    "value": "bloq-numberArray-arraySize"
                }, {
                    "alias": "numberInput",
                    "id": "VALUE",
                    "value": 0.0
                }, {
                    "alias": "text",
                    "value": "bloq-numberArray-floatType"
                }]
            ],
            "returnType": {
                "type": "simple",
                "value": "float *"
            },
            "links": [{
                "rel": "self",
                "href": "https://resources-qa.bqws.io/v1.0/resource/bitbloq:Bloqs/558c146338c2918afb8dc6c4"
            }]
        }, {
            "connectors": [{
                "type": "connector--output",
                "accept": "connector--input"
            }, {
                "name": "56b3f34b-8f89-4ace-b0b5-53dd292ac6bf",
                "type": "connector--input",
                "accept": "connector--output",
                "acceptType": "float"
            }, {
                "name": "436d8c0f-b9f9-486c-8ecc-01107693c10d",
                "type": "connector--input",
                "accept": "connector--output",
                "acceptType": "float"
            }],
            "code": "random({ARG1},{ARG2}+1)",
            "bloqClass": "bloq-random",
            "name": "random",
            "id": "558c146438c2918afb8dc6c5",
            "type": "output",
            "content": [
                [{
                    "alias": "text",
                    "value": "bloq-random-random"
                }, {
                    "name": "56b3f34b-8f89-4ace-b0b5-53dd292ac6bf",
                    "alias": "bloqInput",
                    "bloqInputId": "ARG1",
                    "acceptType": "float"
                }, {
                    "alias": "text",
                    "value": "bloq-random-and"
                }, {
                    "name": "436d8c0f-b9f9-486c-8ecc-01107693c10d",
                    "alias": "bloqInput",
                    "bloqInputId": "ARG2",
                    "acceptType": "float"
                }]
            ],
            "returnType": {
                "type": "simple",
                "value": "float"
            },
            "links": [{
                "rel": "self",
                "href": "https://resources-qa.bqws.io/v1.0/resource/bitbloq:Bloqs/558c146438c2918afb8dc6c5"
            }]
        }, {
            "connectors": [{
                "type": "connector--output",
                "accept": "connector--input"
            }],
            "name": "output",
            "id": "558c146438c2918afb8dc6c6",
            "type": "output",
            "links": [{
                "rel": "self",
                "href": "https://resources-qa.bqws.io/v1.0/resource/bitbloq:Bloqs/558c146438c2918afb8dc6c6"
            }]
        }, {
            "connectors": [{
                "type": "connector--top",
                "accept": "connector--bottom"
            }, {
                "type": "connector--bottom",
                "accept": "connector--top"
            }, {
                "type": "connector--root",
                "accept": "connector--top"
            }],
            "name": "statement-input",
            "id": "558c146438c2918afb8dc6c8",
            "type": "statement-input",
            "links": [{
                "rel": "self",
                "href": "https://resources-qa.bqws.io/v1.0/resource/bitbloq:Bloqs/558c146438c2918afb8dc6c8"
            }]
        }, {
            "connectors": [{
                "type": "connector--output",
                "accept": "connector--input"
            }, {
                "name": "99ba23a7-971c-4ac6-8c70-eeb4776ba3c6",
                "type": "connector--input",
                "accept": "connector--output",
                "acceptType": "all"
            }],
            "code": "({TYPE})malloc({VALUE}*sizeof({TYPE}.withoutAsterisk))",
            "bloqClass": "bloq-stringArray-advanced",
            "name": "stringArrayAdvanced",
            "id": "558c146438c2918afb8dc6c9",
            "type": "output",
            "content": [
                [{
                    "alias": "text",
                    "value": "bloq-stringArray-advanced-arraySize"
                }, {
                    "name": "99ba23a7-971c-4ac6-8c70-eeb4776ba3c6",
                    "alias": "bloqInput",
                    "bloqInputId": "VALUE",
                    "acceptType": "all"
                }, {
                    "alias": "text",
                    "value": "bloq-stringArray-advanced-type"
                }, {
                    "options": [{
                        "label": "bloq-stringArray-advanced-string",
                        "value": "String *"
                    }, {
                        "label": "bloq-stringArray-advanced-char",
                        "value": "char *"
                    }],
                    "alias": "staticDropdown",
                    "id": "TYPE"
                }]
            ],
            "returnType": {
                "idDropdown": "TYPE",
                "options": "softwareVars",
                "type": "fromDropdown"
            },
            "links": [{
                "rel": "self",
                "href": "https://resources-qa.bqws.io/v1.0/resource/bitbloq:Bloqs/558c146438c2918afb8dc6c9"
            }]
        }, {
            "connectors": [{
                "type": "connector--output",
                "accept": "connector--input"
            }, {
                "name": "18ce77dc-2064-4542-89d7-d8e7f3ff948d",
                "type": "connector--input",
                "accept": "connector--output",
                "acceptType": "string"
            }],
            "code": "{TEXT}.length()",
            "bloqClass": "bloq-length",
            "name": "length",
            "id": "558c146538c2918afb8dc6ca",
            "type": "output",
            "content": [
                [{
                    "alias": "text",
                    "value": "bloq-length-length"
                }, {
                    "name": "18ce77dc-2064-4542-89d7-d8e7f3ff948d",
                    "alias": "bloqInput",
                    "bloqInputId": "TEXT",
                    "acceptType": "string"
                }]
            ],
            "returnType": {
                "type": "simple",
                "value": "float"
            },
            "links": [{
                "rel": "self",
                "href": "https://resources-qa.bqws.io/v1.0/resource/bitbloq:Bloqs/558c146538c2918afb8dc6ca"
            }]
        }, {
            "connectors": [{
                "type": "connector--output",
                "accept": "connector--input"
            }],
            "code": "{TEXT}",
            "bloqClass": "bloq-string",
            "name": "string",
            "id": "558c146538c2918afb8dc6cb",
            "type": "output",
            "content": [
                [{
                    "alias": "text",
                    "value": "\""
                }, {
                    "alias": "stringInput",
                    "id": "TEXT",
                    "placeholder": "bloq-string-string"
                }, {
                    "alias": "text",
                    "value": "\""
                }]
            ],
            "returnType": {
                "type": "simple",
                "value": "String"
            },
            "links": [{
                "rel": "self",
                "href": "https://resources-qa.bqws.io/v1.0/resource/bitbloq:Bloqs/558c146538c2918afb8dc6cb"
            }]
        }, {
            "connectors": [{
                "type": "connector--output",
                "accept": "connector--input"
            }],
            "code": "(String *)malloc({VALUE}*sizeof(String))",
            "bloqClass": "bloq-stringArray",
            "name": "stringArray",
            "id": "558c146538c2918afb8dc6cc",
            "type": "output",
            "content": [
                [{
                    "alias": "text",
                    "value": "bloq-stringArray-arraySize"
                }, {
                    "alias": "numberInput",
                    "id": "VALUE",
                    "value": 0.0
                }, {
                    "alias": "text",
                    "value": "bloq-stringArray-stringType"
                }]
            ],
            "returnType": {
                "type": "simple",
                "value": "String *"
            },
            "links": [{
                "rel": "self",
                "href": "https://resources-qa.bqws.io/v1.0/resource/bitbloq:Bloqs/558c146538c2918afb8dc6cc"
            }]
        }, {
            "connectors": [{
                "type": "connector--top",
                "accept": "connector--bottom"
            }, {
                "type": "connector--bottom",
                "accept": "connector--top"
            }],
            "code": "{CODE}",
            "bloqClass": "bloq-code",
            "name": "code",
            "id": "558c145938c2918afb8dc683",
            "type": "statement",
            "content": [
                [{
                    "alias": "multilineCodeInput",
                    "id": "CODE",
                    "placeholder": "bloq-code-writeYourCode",
                    "value": ""
                }]
            ],
            "links": [{
                "rel": "self",
                "href": "https://resources-qa.bqws.io/v1.0/resource/bitbloq:Bloqs/558c145938c2918afb8dc683"
            }]
        }, {
            "connectors": [{
                "type": "connector--top",
                "accept": "connector--bottom"
            }, {
                "type": "connector--bottom",
                "accept": "connector--top"
            }],
            "code": "/*\n{COMMENT}\n*/",
            "bloqClass": "bloq-comment",
            "name": "comment",
            "id": "558c145a38c2918afb8dc684",
            "type": "statement",
            "content": [
                [{
                    "alias": "text",
                    "value": "bloq-comment-comment"
                }, {
                    "alias": "multilineCodeInput",
                    "id": "COMMENT",
                    "value": ""
                }]
            ],
            "links": [{
                "rel": "self",
                "href": "https://resources-qa.bqws.io/v1.0/resource/bitbloq:Bloqs/558c145a38c2918afb8dc684"
            }]
        }, {
            "connectors": [{
                "type": "connector--output",
                "accept": "connector--input"
            }, {
                "name": "d87e5e74-2bd4-43c8-acca-31131aaf54c3",
                "type": "connector--input",
                "accept": "connector--output",
                "acceptType": "number"
            }],
            "code": "({NUMBER},{TYPE});",
            "bloqClass": "bloq-convert",
            "name": "convert",
            "id": "558c145a38c2918afb8dc685",
            "type": "output",
            "content": [
                [{
                    "alias": "text",
                    "value": "bloq-convert-convert"
                }, {
                    "name": "d87e5e74-2bd4-43c8-acca-31131aaf54c3",
                    "alias": "bloqInput",
                    "bloqInputId": "NUMBER",
                    "acceptType": "number"
                }, {
                    "alias": "text",
                    "value": "bloq-convert-to"
                }, {
                    "options": [{
                        "label": "bloq-convert-dec",
                        "value": "DEC"
                    }, {
                        "label": "bloq-convert-hex",
                        "value": "HEX"
                    }, {
                        "label": "bloq-convert-oct",
                        "value": "OCT"
                    }, {
                        "label": "bloq-convert-bin",
                        "value": "BIN"
                    }],
                    "alias": "staticDropdown",
                    "id": "TYPE"
                }]
            ],
            "returnType": {
                "type": "simple",
                "value": "float"
            },
            "links": [{
                "rel": "self",
                "href": "https://resources-qa.bqws.io/v1.0/resource/bitbloq:Bloqs/558c145a38c2918afb8dc685"
            }]
        }, {
            "connectors": [{
                "type": "connector--output",
                "accept": "connector--input"
            }],
            "code": "{SERIAL}.readString()",
            "bloqClass": "bloq-serial-receiver",
            "name": "serialReceive",
            "id": "558c145a38c2918afb8dc686",
            "type": "output",
            "content": [
                [{
                    "options": "serialElements",
                    "alias": "dynamicDropdown",
                    "id": "SERIAL"
                }, {
                    "alias": "text",
                    "value": "bloq-serial-receiver-receive"
                }]
            ],
            "returnType": {
                "type": "simple",
                "value": "string"
            },
            "links": [{
                "rel": "self",
                "href": "https://resources-qa.bqws.io/v1.0/resource/bitbloq:Bloqs/558c145a38c2918afb8dc686"
            }]
        }, {
            "connectors": [{
                "type": "connector--top",
                "accept": "connector--bottom"
            }, {
                "type": "connector--bottom",
                "accept": "connector--top"
            }, {
                "name": "3158af01-fbea-4e4d-b317-0cbfc9ffa2b0",
                "type": "connector--input",
                "accept": "connector--output",
                "acceptType": "all"
            }],
            "code": "{SERIAL}.{FUNCTION}({DATA});",
            "bloqClass": "bloq-serial-send",
            "name": "serialSend",
            "id": "558c145a38c2918afb8dc687",
            "type": "statement",
            "content": [
                [{
                    "options": "serialElements",
                    "alias": "dynamicDropdown",
                    "id": "SERIAL"
                }, {
                    "alias": "text",
                    "value": "bloq-serial-send-send"
                }, {
                    "name": "3158af01-fbea-4e4d-b317-0cbfc9ffa2b0",
                    "alias": "bloqInput",
                    "bloqInputId": "DATA",
                    "acceptType": "all"
                }, {
                    "options": [{
                        "label": "bloq-serial-send-print",
                        "value": "print"
                    }, {
                        "label": "bloq-serial-send-println",
                        "value": "println"
                    }],
                    "alias": "staticDropdown",
                    "id": "FUNCTION"
                }]
            ],
            "links": [{
                "rel": "self",
                "href": "https://resources-qa.bqws.io/v1.0/resource/bitbloq:Bloqs/558c145a38c2918afb8dc687"
            }]
        }, {
            "connectors": [{
                "type": "connector--top",
                "accept": "connector--bottom"
            }, {
                "type": "connector--bottom",
                "accept": "connector--top"
            }, {
                "name": "b0fa287e-f9e4-458b-8389-39bccd29e538",
                "type": "connector--input",
                "accept": "connector--output",
                "acceptType": "all"
            }, {
                "name": "9ceca837-4001-417f-be44-a05cfd7ddaaa",
                "type": "connector--input",
                "accept": "connector--output",
                "acceptType": "all"
            }, {
                "name": "a0f74e81-053d-4218-b198-d7aad2457216",
                "type": "connector--input",
                "accept": "connector--output",
                "acceptType": "all"
            }],
            "code": "tone({BUZZER},{NOTE},{SECONDS});\ndelay({SECONDS});",
            "bloqClass": "bloq-buzzer-advance",
            "name": "buzzerAdvanced",
            "id": "558c145a38c2918afb8dc688",
            "type": "statement",
            "content": [
                [{
                    "alias": "text",
                    "value": "bloq-buzzer-advance-sound"
                }, {
                    "name": "b0fa287e-f9e4-458b-8389-39bccd29e538",
                    "alias": "bloqInput",
                    "bloqInputId": "BUZZER",
                    "acceptType": "all"
                }, {
                    "alias": "text",
                    "value": "bloq-buzzer-advance-note"
                }, {
                    "name": "9ceca837-4001-417f-be44-a05cfd7ddaaa",
                    "alias": "bloqInput",
                    "bloqInputId": "NOTE",
                    "acceptType": "all"
                }, {
                    "alias": "text",
                    "value": "bloq-buzzer-advance-for"
                }, {
                    "name": "a0f74e81-053d-4218-b198-d7aad2457216",
                    "alias": "bloqInput",
                    "bloqInputId": "SECONDS",
                    "acceptType": "all"
                }, {
                    "alias": "text",
                    "value": "bloq-buzzer-advance-ms"
                }]
            ],
            "links": [{
                "rel": "self",
                "href": "https://resources-qa.bqws.io/v1.0/resource/bitbloq:Bloqs/558c145a38c2918afb8dc688"
            }]
        }, {
            "connectors": [{
                "type": "connector--top",
                "accept": "connector--bottom"
            }, {
                "type": "connector--bottom",
                "accept": "connector--top"
            }, {
                "name": "ab502020-283c-4ed7-a827-572e56e3313d",
                "type": "connector--input",
                "accept": "connector--output",
                "acceptType": "all"
            }],
            "code": "{SERVO}.write({DIRECTION});",
            "bloqClass": "bloq-continuous-servo-start-advanced",
            "name": "continuousServoStartAdvanced",
            "id": "558c145b38c2918afb8dc689",
            "type": "statement",
            "content": [
                [{
                    "alias": "text",
                    "value": "bloq-continuous-servo-start-advanced-turn"
                }, {
                    "name": "ab502020-283c-4ed7-a827-572e56e3313d",
                    "alias": "bloqInput",
                    "bloqInputId": "SERVO",
                    "acceptType": "all"
                }, {
                    "alias": "text",
                    "value": "bloq-continuous-servo-start-advanced-direction"
                }, {
                    "options": [{
                        "label": "bloq-continuous-servo-start-advanced-clockwise",
                        "value": "0"
                    }, {
                        "label": "bloq-continuous-servo-start-advanced-counterclockwise",
                        "value": "180"
                    }],
                    "alias": "staticDropdown",
                    "id": "DIRECTION"
                }]
            ],
            "links": [{
                "rel": "self",
                "href": "https://resources-qa.bqws.io/v1.0/resource/bitbloq:Bloqs/558c145b38c2918afb8dc689"
            }]
        }];

    // Initialize the controller and a mock scope
    beforeEach(inject(function($controller, $rootScope, bloqsUtils) {
        /*scope = $rootScope.$new();
         $bloqsUtils = bloqsUtils;
         $httpBackend = $injector.get('$httpBackend');

         $httpBackend.whenGET('/v1.0/resource/bitbloq:Bloqs?api:page=0&api:pageSize=50').respond(function(method, url, data) {
         console.log("Getting bloqs 0");
         return [200, bloqs, {}];
         });

         MakeCtrl = $controller('MakeCtrl', {
         $scope: scope
         });*/
    }));

    it('work', function() {
        expect(true).toBe(true);
    });

    xit('Code generation', function() {
        console.log('scope.project');
        console.log(scope.project);
        scope.project = {
            "name": "asereje",
            "description": "adsadsasdasdasdasdasddd",
            "software": {
                "loop": {
                    "name": "loopBloq",
                    "childs": [],
                    "content": [
                        []
                    ]
                },
                "setup": {
                    "name": "setupBloq",
                    "childs": [],
                    "content": [
                        []
                    ]
                },
                "vars": {
                    "name": "varsBloq",
                    "childs": [],
                    "content": [
                        []
                    ]
                }
            },
            "hardware": {
                "components": [],
                "connections": []
            },
            "bloqsTags": [],
            "userTags": []
        };

        console.log(scope.bloqs);
        console.log('code:');
        console.log($bloqsUtils.getCode(scope.componentsArray, scope.bloqs));
        console.log();
        //expect(scope.awesomeThings.length).toBe(3);
    });
});
