import angular from './angular';

var app = angular.module('propelSandbox', ['ngRoute', 'ui.codemirror', 'ui.bootstrap']);

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

// copy&pasted since maintaincer has no versions tagged and requires angular v1.2
app.directive('uiLadda', ['$timeout', function($timeout) {
    return {
        link: function(scope, element, attrs) {
            var ladda = window.Ladda.create(element[0]);
            scope.$watch(attrs.uiLadda, function(newVal) {
                if (angular.isNumber(newVal)) {
                    if (newVal >= 0 && newVal < 1) {
                        if (!ladda.isLoading()) {
                            ladda.start();
                            $timeout(function() {
                                ladda.setProgress(newVal);
                            }, 300);
                        }
                        else {
                            ladda.setProgress(newVal);
                        }
                    }
                    else {
                        if (ladda.isLoading()) {
                            ladda.stop();
                        }
                    }
                }
                else {
                    if (newVal) {
                        if (!ladda.isLoading()) {
                            ladda.start();
                        }
                    }
                    else {
                        if (ladda.isLoading()) {
                            ladda.stop();
                        }
                    }
                }
            }, true);
        }
    };
}]);