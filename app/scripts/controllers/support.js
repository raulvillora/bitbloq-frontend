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
            '_id': 'index',
            'default': 'index',
            'dontShowHomeButton': true,
            'title': '¡Bienvenido a la página de soporte de Bitbloq!',
            'data': '<p>Ayudanos a diagnosticar tu caso para que podamos ayudarte.</p><p>¿Usas la <strong>versión Online</strong> de Bitbloq, o la versión <a href="http://bitbloq.bq.com/#/offline" class="icon--url">Offline</a></p>',
            'next': [{
                    '_id': 'online',
                    'class': 'btn--secondary',
                    'icon': 'icon--cloud icon--big',
                    'response': 'Uso la versión Online'
                }, {
                    '_id': 'offline',
                    'class': 'btn--secondary',
                    'icon': 'icon--desktop icon--big',
                    'response': 'Uso la versión Offline'
                }]
          }, {
            '_id': 'end',
            'default': 'end',
            'dontShowHomeButton': true,
            'title': '¡Gracias por utilizar el sistema de soporte de Bitbloq!',
            'data': '<span class="support--icon--giga support--icon--ok"><i class="fa fa-check-circle" aria-hidden="true"></i><span>',
            'next': [{
                    '_id': 'index',
                    'class': 'btn--primary',
                    'icon': 'icon--home icon--big',
                    'response': 'Volver a el índice'
                }]
          }, {
            '_id': '404',
            'default': '404',
            'dontShowHomeButton': true,
            'title': 'No encuentro la página de soporte que buscas...',
            'data': 'Puede que exista un error; Inténtalo de nuevo<br><span class="support--icon--giga support--icon--no"><svg class="svg-icon"><use xlink:href="#warning"></use></svg><span>',
            'next': [{
                    '_id': 'index',
                    'class': 'btn--primary',
                    'icon': 'icon--home icon--big',
                    'response': 'Volver a el índice'
                }]
          }, {
            '_id': 'form',
            'default': 'form',
            'dontShowHomeButton': true,
            'title': 'Contacta con nuestro servicio técnico',
            'extData': 'contactForm.html',
            'next': []
          }, {
              '_id': 'online',
              'title': 'Por favor, indicanos el motivo de tu consulta:',
              'next': [{
                      '_id': 'dontLoad',
                      'class': 'btn--secondary',
                      'icon': '',
                      'response': 'La web no carga',
                  }, {
                      '_id': 'w2b',
                      'class': 'btn--secondary',
                      'icon': '',
                      'response': 'Tengo dificultades con web2board',
                  }, {
                      '_id': 'hardware',
                      'class': 'btn--secondary',
                      'icon': '',
                      'response': 'Tengo una incidencia con un componente de hardware',
                  }
              ]
          }, {
              '_id': 'offline',
              'title': '',
              'data': '',
              'next': []
          }, {
              '_id': 'dontLoad',
              'title': '¿Tienes problemas cargando la web de Bitbloq?',
              'extData': 'dontLoad.html',
              'next': [{
                  '_id': 'end',
                  'class': 'btn--primary',
                  'icon': 'icon--ok icon--big',
                  'response': 'Si',
              }, {
                  '_id': 'dontLoadSchool',
                  'class': 'btn--primary btn--no',
                  'icon': 'icon--no icon--big',
                  'response': 'No',
              }]
          }, {
              '_id': 'dontLoadSchool',
              'title': '¿Estás en un centro educativo o en alguna infraestructura que pueda estar bajo un proxy?',
              'extData': 'dontLoadSchool.html',
              'next': [{
                  '_id': 'end',
                  'class': 'btn--primary',
                  'icon': 'icon--ok icon--big',
                  'response': 'Si',
              }, {
                  '_id': 'tetering',
                  'class': 'btn--primary btn--no',
                  'icon': 'icon--no icon--big',
                  'response': 'No',
              }]
          }, {
              '_id': 'tetering',
              'title': 'Prueba con el tetering del móvil',
              'data': '<p>Activando la opción de tetering de su móvil, y compartiendo la conexión con su computadora, puede comprobar si carga Bitbloq desde una red diferente.</p><p>Si consigue cargar, tiene un problema en la configuración de su red y/o software ajeno a Bitbloq; contacte con los administradores de la red.</p><p><strong>¿Has solucionado el problema?</strong></p>',
              'next': [{
                  '_id': 'end',
                  'class': 'btn--primary',
                  'icon': 'icon--ok icon--big',
                  'response': 'Si',
              }, {
                  '_id': 'form',
                  'class': 'btn--primary btn--no',
                  'icon': 'icon--no icon--big',
                  'response': 'No',
              }]
          }, {
              '_id': 'w2b',
              'title': '',
              'next': []
          }, {
              '_id': 'hardware',
              'title': '',
              'next': []
          }];

        var cardIndex = db.filter(function(card) {
            return card.default === 'index'
          }).pop()
        var cardEnd = db.filter(function(card) {
            return card.default === 'end'
          }).pop()
        var card404 = db.filter(function(card) {
            return card.default === '404'
          }).pop()

        var currentId = ($routeParams.id !== undefined) ? $routeParams.id : cardIndex._id

        $scope.card = db.filter(function(card) {
          return card._id === currentId
        }).pop()
        if ($scope.card === undefined || $scope.card.title === '') {
          $scope.card = card404
          currentId = card404._id
        }

        $scope.go = function (childId) {
          if (childId && childId !== cardIndex._id) {
            common.supportSteps.push(childId)
            $location.path('/support/' + childId)
          } else {
            common.supportSteps = []
            $location.path('/support')
          }
        }
    });
