'use strict';

/**
 * @ngdoc function
 * @name bitbloqApp.controller:SupportCtrl
 * @description
 * # SupportCtrl
 * Controller of the bitbloqApp
 */
angular.module('bitbloqApp')
    .controller('SupportCtrl', function($scope, $location, $routeParams) {
        var db = [
          {
            '_id': '0',
            'title': 'Indice de FAQ',
            'data': '',
            'next': [{
                    '_id': '1',
                    'class': 'btn--secondary',
                    'response': 'default short'
                }, {
                    '_id': '3',
                    'class': 'btn--primary',
                    'response': 'si'
                }, {
                    '_id': '100',
                    'class': 'btn--secondary',
                    'response': 'default very very very very very long'
                }, {
                    '_id': '1000',
                    'class': 'btn--primary btn--no',
                    'response': 'no'
                }]
          }, {
              '_id': '1',
              'title': '¿La web no carga y/o aparece en blanco?',
              'data': '',
              'next': [{
                      '_id': '2',
                      'class': 'btn--primary',
                      'response': 'si',
                  },
                  {
                      '_id': '3',
                      'response': 'no',
                      'class': 'btn--primary btn--no'
                  }
              ]
          }, {
              '_id': '2',
              'title': '¿Ha refrescado la caché?',
              'data': '',
              'next': [{
                      '_id': '1',
                      'class': 'btn--primary',
                      'response': 'si',
                  },
                  {
                      '_id': '3',
                      'response': 'no',
                      'class': 'btn--primary btn--no'
                  }
              ]
          }, {
              '_id': '3',
              'title': '¿Se instala web2board?',
              'data': '',
              'next': [{
                      '_id': '1',
                      'class': 'btn--primary',
                      'response': 'si',
                  },
                  {
                      '_id': '2',
                      'response': 'no',
                      'class': 'btn--primary btn--no'
                  }
              ]
          }];

        if ($routeParams.id !== undefined) {
            $scope.card = db.filter(card => card._id === $routeParams.id).pop();
            $scope.show_back = true;
        } else {
            $scope.card = db.filter(card => card._id === '0').pop();
            $scope.show_back = false;
        }

        $scope.go = function(childId) {
          if(childId) {
            $location.path(`/support/${childId}`);
          } else {
            $location.path(`/support/`);
          }
        };
        console.log($scope.card);
    });
