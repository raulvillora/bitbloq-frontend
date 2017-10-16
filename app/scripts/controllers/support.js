'use strict';

/**
 * @ngdoc function
 * @name bitbloqApp.controller:SupportCtrl
 * @description
 * # SupportCtrl
 * Controller of the bitbloqApp
 */
angular.module('bitbloqApp')
    .controller('SupportCtrl', function($scope, $location, $routeParams, common) {
        var db = [
          {
            '_id': 'Support--Index',
            'idNum': '1',
            'title': '¡Bienvenido a la página de soporte de Bitbloq!',
            'data': '<p>Ayudanos a diagnosticar tu caso para que podamos ayudarte.</p><p>¿Usas la <strong>versión Online</strong> de Bitbloq, o la versión <a href="http://bitbloq.bq.com/#/offline" class="icon--url">Offline</a></p>',
            'next': [{
                    '_id': 'Support--Online',
                    'class': 'btn--secondary',
                    'icon': 'icon--cloud icon--big',
                    'response': 'Uso la versión Online'
                }, {
                    '_id': 'Support--Offline',
                    'class': 'btn--secondary',
                    'icon': 'icon--desktop icon--big',
                    'response': 'Uso la versión Offline'
                }]
          }, {
            '_id': 'Support--End',
            'title': '¡Gracias por utilizar el sistema de soporte de Bitbloq!',
            'data': '<span class="support--icon--giga support--icon--ok"><i class="fa fa-check-circle" aria-hidden="true"></i><span>',
            'next': [{
                    '_id': 'Support--Index',
                    'class': 'btn--primary',
                    'icon': 'icon--home icon--big',
                    'response': 'Volver a el índice'
                }]
          }, {
            '_id': 'Support--404',
            'title': 'No encuentro la página de soporte que buscas...',
            'data': 'Puede que exista un error; Inténtalo de nuevo<br><span class="support--icon--giga support--icon--no"><i class="fa fa-times-circle" aria-hidden="true"></i><span>',
            'next': [{
                    '_id': 'Support--Index',
                    'class': 'btn--primary',
                    'icon': 'icon--home icon--big',
                    'response': 'Volver a el índice'
                }]
          }, {
              '_id': 'Support--Online',
              'title': 'Por favor, indicanos el motivo de tu consulta:',
              'data': '',
              'next': [{
                      '_id': 'Support--DontLoad',
                      'class': 'btn--secondary',
                      'icon': '',
                      'response': 'La web no carga',
                  }, {
                      '_id': 'Support--W2B',
                      'class': 'btn--secondary',
                      'icon': '',
                      'response': 'Tengo dificultades con web2board',
                  }, {
                      '_id': 'Support--Hardware',
                      'class': 'btn--secondary',
                      'icon': '',
                      'response': 'Tengo una incidencia con un componente de hardware',
                  }
              ]
          }, {
              '_id': 'Support--Offline',
              'title': '',
              'data': '',
              'next': []
          }, {
              '_id': 'Support--DontLoad',
              'title': '¿Tienes problemas cargando la web de Bitbloq?',
              'data': '<p>¿Has <strong>refrescado la caché</strong> del navegador?</p><p>La caché del navegador es una función que tienen los principales navegadores web, que permite cargar las páginas web más rápido guardando en el ordenador parte de la información que previamente se ha solicitado</p><p>Para <i>refrescar la cache</i>:</p><ul>' + '<li class="icon--windows"><strong> Windows:</strong><p>Presiona la combinación de teclas <span class="icon--fx--keycap">Ctrl</span> + <span class="icon--fx--keycap">⇧ Mayús</span> + <span class="icon--fx--keycap">R</span>, y <strong>vuelve a repetir la acción justo en el momento en el que lapágina comienza a cargarse</strong></p></li>' + '<li class="icon--mac"><strong> Mac:</strong><p>Presiona la combinación de teclas <span class="icon--fx--keycap">⌘ CMD</span> + <span class="icon--fx--keycap">⇧ Mayus.</span> + <span class="icon--fx--keycap">R</span>, y <strong>vuelve a repetir la acción justo en el momento en el que lapágina comienza a cargarse</strong></p></li>' + '<li class="icon--linux"><strong> Linux:</strong></strong><p>Presiona la combinación de teclas <span class="icon--fx--keycap">Ctrl</span> + <span class="icon--fx--keycap">⇧ Mayús</span> + <span class="icon--fx--keycap">R</span>, y <strong>vuelve a repetir la acción justo en el momento en el que lapágina comienza a cargarse</strong></p></li></ul><p><strong>¿Refrescar la caché ha solucionado el problema?</strong></p>',
              'next': [{
                  '_id': 'Support--End',
                  'class': 'btn--primary',
                  'icon': 'icon--ok icon--big',
                  'response': 'Si',
              }, {
                  '_id': 'Support--DontLoad--School',
                  'class': 'btn--primary btn--no',
                  'icon': 'icon--no icon--big',
                  'response': 'No',
              }]
          }, {
              '_id': 'Support--DontLoad--School',
              'title': '',
              'data': '',
              'next': []
          }, {
              '_id': 'Support--W2B',
              'title': '',
              'data': '',
              'next': []
          }, {
              '_id': 'Support--Hardware',
              'title': '',
              'data': '',
              'next': []
          }];

        var currentId = ($routeParams.id !== undefined) ? $routeParams.id : 'Support--Index'

        $scope.card = db.filter(function(card) {
          return card._id === currentId
        }).pop()
        console.log('card =', $scope.card)
        if ($scope.card === undefined || $scope.card.title === '') {
          $scope.card = db.filter(function(card) {
            return card._id === 'Support--404'
          }).pop()
          currentId = 'Support--404'
        }

        $scope.showBack = !['Support--End', 'Support--Index', 'Support--404'].includes(currentId)

        $scope.go = function (childId) {
          if (childId && childId !== 'Support--Index') {
            common.supportSteps.push(childId)
            $location.path('/support/' + childId)
          } else {
            common.supportSteps = []
            $location.path('/support')
          }
        }

        console.log(common.supportSteps);
    });
