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
            'title': '¡Bienvenido a la página de soporte de BitBloq!',
            'data': '<p>Mediante una serie de preguntas y respuestas simples, te iremos guiando por nuestro sistema de soporte.</p><p>En la parte inferior tienes la lista de las preguntas más frecuentes</p>',
            'next': [{
                    '_id': '1',
                    'class': 'btn--secondary',
                    'response': 'default short'
                }, {
                    '_id': '3',
                    'class': 'btn--primary',
                    'response': 'Sí'
                }, {
                    '_id': '100',
                    'class': 'btn--secondary',
                    'response': 'default very very very very very long'
                }, {
                    '_id': '1000',
                    'class': 'btn--primary btn--no',
                    'response': 'No'
                }]
          }, {
              '_id': '1',
              'title': '¿La web no carga y/o aparece en blanco?',
              'data': '<p>Majavi <strong>daundebugi</strong> an de wini di pi?<p>',
              'next': [{
                      '_id': '2',
                      'class': 'btn--primary',
                      'response': 'Sí',
                  },
                  {
                      '_id': '3',
                      'response': 'No',
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
                      'response': 'Sí',
                  },
                  {
                      '_id': '3',
                      'response': 'No',
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
                      'response': 'Sí',
                  },
                  {
                      '_id': '2',
                      'response': 'No',
                      'class': 'btn--primary btn--no'
                  }
              ]
          }];

        var currentId = ($routeParams.id !== undefined) ? `${$routeParams.id}` : '0'

        $scope.card = db.filter(card => card._id === currentId).pop()
        $scope.showBack = $routeParams.id !== undefined;

        $scope.go = (childId) => $location.path((childId) ? `/support/${childId}` : `/support`)
    });
