'use strict';

/**
 * @ngdoc function
 * @name bitbloqApp.controller:3DCtrl
 * @description
 * # AlertsCtrl
 * Controller of the bitbloqApp
 */
angular.module('bitbloqApp')
    .controller('3DCtrl', function ($scope, bloqsApi, bloqs, arduinoGeneration) {
        console.log('3d start');
        $scope.$bloqsField = $('#bloqs--field').last();
        $scope.componentsArray = [];
        $scope.mainBloq = null;
        var gProcessor = new OpenJsCad.Processor(document.getElementById('viewer'));

        //gProcessor.setDebugging(true);
        gProcessor.setUseSync(true);
        $scope.openScadCode = 'sphere(r=10);';
        $scope.reload = function () {
            console.log('reload');
            var openScadCode = $scope.openScadCode;
            var openJSCadCode = openscadOpenJscadParser.parse(openScadCode);
            gProcessor.setJsCad(openJSCadCode);
        };

        bloqsApi.itsLoaded().then(function () {
            var bloqsOptions = {
                fieldOffsetLeft: 0,
                fieldOffsetRight: 0,
                fieldOffsetTopSource: ['header'],
                bloqSchemas: bloqsApi.schemas,
                suggestionWindowParent: $scope.$bloqsField[0],
                dotsMatrixWindowParent: $scope.$bloqsField[0]
            };

            bloqs.setOptions(bloqsOptions);
            $scope.mainBloq = bloqs.buildBloqWithContent({ name: 'varsBloq' }, $scope.componentsArray, bloqsApi.schemas, $scope.$bloqsField);
            $scope.$bloqsField.append($scope.mainBloq.$bloq);
            $scope.mainBloq.enable(true);
            $scope.mainBloq.doConnectable();


            bloqs.updateDropdowns();
            bloqs.startBloqsUpdate($scope.componentsArray);
            createBloq('sphere');
            //createBloq('cube');
        });
        function createBloq(name) {
            //Create a if bloq from the bloqsSchemas loaded
            var bloq = new bloqs.Bloq({
                bloqData: bloqsApi.schemas[name],
                componentsArray: $scope.componentsArray,
                $field: $scope.$bloqsField
            });
            //append it to the field
            $scope.$bloqsField.append(bloq.$bloq);
            //enable if you want
            bloq.enable(true);
            //do connectable to allow anothers bloqs to connect to them
            bloq.doConnectable();
        };

        $scope.updateBloqsCode = function () {
            $scope.openScadCode = arduinoGeneration.getCode({
                varsBloq: $scope.mainBloq.getBloqsStructure(true)
            }, {});
            $scope.reload();
        };

    });
