import angular from './angular';

var app = angular.module('propelFiddle', ['ngRoute', 'ui.codemirror', 'ui.bootstrap']);

import MainController from './controller/MainController';
import toArray from './filters/toArray';

import examples from './examples';

app.controller('MainController', MainController);
app.filter('toArray', () => toArray);
app.constant('EXAMPLES', examples);
app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    // use the HTML5 History API
    $locationProvider.html5Mode(true);

    $routeProvider
        .when(window._baseUrl + '/', {})
        .when(window._baseUrl + '/:fiddleId', {})
        .when(window._baseUrl + '/example/:exampleId', {});
}]);

app.run(function($route) {});