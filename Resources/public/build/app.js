System.register("../angular", [], function() {
  "use strict";
  var __moduleName = "../angular";
  var $__default = window.angular;
  return {get default() {
      return $__default;
    }};
});
System.register("../controller/MainController", [], function() {
  "use strict";
  var __moduleName = "../controller/MainController";
  var MainController = function MainController($scope, $http) {
    var $__0 = this;
    this.scope = $scope;
    this.http = $http;
    this.fiddleId = window.config.fiddleId;
    this.editable = window.config.editable;
    this.examples = {'bookstore': {label: 'Bookstore'}};
    this.defaultSchema = '<database name="default">\n' + '   <table name="book"></table>\n' + '</database>';
    this.defaultPhp = 'use Propel\\Runtime\\Propel\n' + '\n' + '$book = new Book();';
    this.defaultModel = {
      php: 'echo "Hello World";',
      schema: '<database></database>'
    };
    if (window.model) {
      this.scope.model = window.model;
      this.scope.fiddle = window.model;
    } else {
      this.scope.model = this.defaultModel;
    }
    if (!this.scope.model)
      this.scope.model.title = '';
    this.scope.schemaNeedsUpdate = true;
    this.scope.pageTitle = '';
    this.scope.schemaCodemirrorOptions = {
      mode: 'xml',
      lineNumbers: true,
      styleActiveLine: true
    };
    this.scope.phpCodemirrorOptions = {
      mode: 'application/x-httpd-php-open',
      matchBrackets: true,
      styleActiveLine: true,
      lineNumbers: true
    };
    this.scope.$watch('example', (function() {
      return $__0.loadExample();
    }));
    this.scope.$watch('model.title', (function(value) {
      if (value) {
        $__0.scope.pageTitle = value + ' - ';
      } else {
        $__0.scope.pageTitle = '';
      }
    }));
  };
  ($traceurRuntime.createClass)(MainController, {
    newFiddle: function() {
      var $__0 = this;
      this.retrieveNewFiddleId().success((function() {
        $__0.scope.model.php = '';
        $__0.scope.model.schema = '';
        $__0.scope.model.title = 'New Fiddle';
        $__0.run();
      }));
    },
    forkFiddle: function() {
      var $__0 = this;
      this.retrieveNewFiddleId().success((function() {
        $__0.scope.model.title += ' Fork';
        $__0.run();
      }));
    },
    loadExample: function() {
      if (!this.example)
        return;
    },
    retrieveNewFiddleId: function() {
      var $__0 = this;
      this.scope.loading = true;
      var q = this.http.put('/');
      q.success((function(response) {
        if (response.data) {
          $__0.fiddleId = response.data;
          $__0.scope.fiddle.id = response.data;
          $__0.scope.model.id = response.data;
          history.pushState({id: response.data}, "Fiddle " + response.data, window._baseUrl + "/" + response.data);
          $__0.scope.loading = false;
          $__0.editable = true;
        }
      }));
      return q;
    },
    run: function() {
      var $__0 = this;
      var data = this.scope.model;
      this.scope.loading = true;
      if (!this.fiddleId) {
        this.retrieveNewFiddleId().success((function() {
          return $__0.run();
        }));
        return;
      }
      this.http.post(window._baseUrl + '/' + this.fiddleId, data).success((function(response) {
        $__0.scope.fiddle = response.data;
        $__0.scope.loading = false;
      })).error((function(response) {
        $__0.scope.error = response;
        $__0.scope.loading = false;
      }));
    }
  }, {});
  var $__default = MainController;
  return {get default() {
      return $__default;
    }};
});
System.register("../filters/toArray", [], function() {
  "use strict";
  var __moduleName = "../filters/toArray";
  function toArray(obj) {
    if (!(obj instanceof Object)) {
      return obj;
    }
    return Object.keys(obj).map(function(key) {
      if ('object' === $traceurRuntime.typeof(obj[$traceurRuntime.toProperty(key)])) {
        return Object.defineProperty(obj[$traceurRuntime.toProperty(key)], '$key', {
          __proto__: null,
          value: key
        });
      } else {
        return obj[$traceurRuntime.toProperty(key)];
      }
    });
  }
  var $__default = toArray;
  return {get default() {
      return $__default;
    }};
});
System.register("../app", [], function() {
  "use strict";
  var __moduleName = "../app";
  var angular = System.get("../angular").default;
  var app = angular.module('propelFiddle', ['ui.codemirror', 'ui.bootstrap']);
  var MainController = System.get("../controller/MainController").default;
  var toArray = System.get("../filters/toArray").default;
  app.controller('MainController', MainController);
  app.filter('toArray', (function() {
    return toArray;
  }));
  return {};
});
System.get("../app" + '');

//# sourceMappingURL=app.map
