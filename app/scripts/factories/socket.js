'use strict';
angular.module('bitbloqApp')

.factory('mySocket', function (socketFactory) {
    var myIoSocket = io.connect('/some/path');

    mySocket = socketFactory({
        ioSocket: myIoSocket
    });

    return mySocket;
});
