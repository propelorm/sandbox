import angular from './angular';

var app = angular.module('propelFiddle', ['ui.codemirror', 'ui.bootstrap']);

import MainController from './controller/MainController';
import toArray from './filters/toArray';

app.controller('MainController', MainController);
app.filter('toArray', () => toArray);
