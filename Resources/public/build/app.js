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
  var MainController = function MainController($scope, $http, $routeParams, $rootScope, $location, EXAMPLES) {
    var $__0 = this;
    this.scope = $scope;
    this.http = $http;
    this.location = $location;
    this.scope.examples = this.EXAMPLES = EXAMPLES;
    this.defaultModel = {
      php: 'echo "Hello World";',
      schema: '<database name="default">\n' + '\n' + '\n</database>'
    };
    this.scope.fiddle = false;
    this.scope.pageTitle = '';
    this.scope.editable = false;
    this.scope.$watch('editable', (function(value) {
      $__0.scope.phpCodemirrorOptions.readOnly = !value;
      $__0.scope.schemaCodemirrorOptions.readOnly = !value;
    }));
    $rootScope.$on("$routeChangeSuccess", (function(event, current) {
      if ($routeParams.exampleId) {
        $__0.loadExample($routeParams.exampleId);
      } else {
        $__0.loadFiddle($routeParams.fiddleId);
      }
    }));
    this.scope.model = {};
    this.scope.schemaCodemirrorOptions = {
      mode: 'xml',
      lineNumbers: true,
      styleActiveLine: true,
      readOnly: !this.editable
    };
    this.scope.phpCodemirrorOptions = {
      mode: 'application/x-httpd-php-open',
      matchBrackets: true,
      styleActiveLine: true,
      lineNumbers: true,
      readOnly: !this.editable
    };
    this.scope.$watch('example', (function(v) {
      return $__0.openExample(v);
    }));
    this.scope.$watch('model.title', (function(value) {
      if (value) {
        $__0.scope.pageTitle = value + ' - ';
      } else {
        $__0.scope.pageTitle = '';
      }
    }));
    this.loadMyFiddles();
  };
  ($traceurRuntime.createClass)(MainController, {
    openFiddle: function(id) {
      this.open('/' + id);
    },
    loadMyFiddles: function() {
      var $__0 = this;
      this.http.get(window._baseUrl + '/my-fiddles').success((function(response) {
        $__0.scope.myFiddles = response.data;
      })).error((function(response) {
        $__0.scope.myFiddles = [];
      }));
    },
    loadFiddle: function(fiddleId) {
      var $__0 = this;
      delete this.scope.notFound;
      if (fiddleId) {
        if (this.fiddleId === fiddleId) {
          return;
        }
        this.http.get(window._baseUrl + '/' + fiddleId + '.json').success((function(response) {
          $__0.fiddleId = fiddleId;
          $__0.scope.example = '';
          $__0.scope.fiddle = response.data;
          $__0.scope.model = {
            php: $__0.scope.fiddle.php,
            title: $__0.scope.fiddle.title,
            schema: $__0.scope.fiddle.schema
          };
          $__0.scope.editable = $__0.scope.fiddle.editable;
        })).error((function(response) {
          $__0.scope.notFound = fiddleId;
        }));
      } else {
        this.loadNew();
      }
    },
    loadNew: function() {
      delete this.scope.notFound;
      this.fiddleId = null;
      this.scope.example = '';
      this.scope.model = this.defaultModel;
      this.scope.editable = true;
    },
    newFiddle: function() {
      this.scope.example = '';
      this.open('/');
    },
    forkFiddle: function() {
      var $__0 = this;
      this.retrieveNewFiddleId().success((function() {
        $__0.scope.model.title += ' Fork';
        $__0.run();
      }));
    },
    openExample: function(exampleId) {
      if (!exampleId)
        return;
      this.open('/example/' + exampleId);
    },
    loadExample: function(exampleId) {
      var example = this.EXAMPLES[$traceurRuntime.toProperty(exampleId)];
      if (example) {
        this.scope.example = exampleId;
        this.scope.fiddle = {};
        this.fiddleId = null;
        this.scope.model = {
          title: example.label,
          php: example.php,
          schema: example.schema
        };
        this.scope.editable = true;
      }
    },
    open: function(path) {
      this.location.path(window._baseUrl + path);
    },
    retrieveNewFiddleId: function() {
      var $__0 = this;
      this.scope.loading = true;
      var q = this.http.put(window._baseUrl + '/');
      q.success((function(response) {
        if (response.data) {
          $__0.fiddleId = response.data;
          $__0.scope.example = '';
          $__0.open('/' + $__0.fiddleId);
          $__0.scope.loading = false;
          $__0.scope.editable = true;
        }
      }));
      return q;
    },
    run: function() {
      var $__0 = this;
      var data = this.scope.model;
      if (!this.scope.editable) {
        return;
      }
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
        $__0.loadMyFiddles();
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
System.register("../examples", [], function() {
  "use strict";
  var __moduleName = "../examples";
  var examples = {};
  examples.bookstore = {
    label: 'Simple Bookstore',
    php: "$book = new Book();\n$book->setTitle('My Heros');\n$book->setIsbn('123154');\n\n$author = new Author();\n$author->setFirstName('Hans');\n$author->setLastName('Zimmer');\n\n$book->setAuthor($author);\n$book->save();\n\nvar_dump($book->toArray());",
    schema: "<database name=\"default\">\n  <table name=\"book\">\n    <column name=\"id\" type=\"integer\" required=\"true\" primaryKey=\"true\" autoIncrement=\"true\"/>\n    <column name=\"title\" type=\"varchar\" size=\"255\" required=\"true\" />\n    <column name=\"isbn\" type=\"varchar\" size=\"24\" required=\"true\" phpName=\"ISBN\"/>\n    <column name=\"author_id\" type=\"integer\" required=\"true\"/>\n    <foreign-key foreignTable=\"author\">\n      <reference local=\"author_id\" foreign=\"id\"/>\n    </foreign-key>\n  </table>\n  <table name=\"author\">\n    <column name=\"id\" type=\"integer\" required=\"true\" primaryKey=\"true\" autoIncrement=\"true\"/>\n    <column name=\"first_name\" type=\"varchar\" size=\"128\" required=\"true\"/>\n    <column name=\"last_name\" type=\"varchar\" size=\"128\" required=\"true\"/>\n  </table>\n</database>"
  };
  examples.timestample = {
    label: 'Timestample Behavior',
    php: "$book = new Book();\n$book->setTitle('Fancy Title');\n$book->save();\n\necho sprintf(\"created at %s\\n\", $book->getCreatedAt()->format('c'));\necho sprintf(\"created at %s\\n\", $book->getUpdatedAt()->format('c'));\n\nsleep(1);\n$book->setTitle('Another title');\n$book->save();\n\necho \"---\\n\";\n\necho sprintf(\"created at %s\\n\", $book->getCreatedAt()->format('c'));\necho sprintf(\"created at %s\\n\", $book->getUpdatedAt()->format('c'));",
    schema: "<database name=\"default\">\n  <table name=\"book\">\n    <column name=\"id\" type=\"integer\" required=\"true\" primaryKey=\"true\" autoIncrement=\"true\"/>\n    <column name=\"title\" type=\"varchar\" size=\"255\" required=\"true\" />\n    <behavior name=\"timestampable\" />\n  </table>\n</database>"
  };
  examples.versionable = {
    label: 'Versionable Behavior',
    php: "$book = new Book();\n\n// automatic version increment\n$book->setTitle('War and Peas');\n$book->save();\nvar_dump($book->getVersion()); // 1\n$book->setTitle('War and Peace');\n$book->save();\nvar_dump($book->getVersion()); // 2\n\n// reverting to a previous version\n$book->toVersion(1);\necho $book->getTitle(); // 'War and Peas'\n// saving a previous version creates a new one\n$book->save();\nvar_dump($book->getVersion());  // 3\n\n// checking differences between versions\nprint_r($book->compareVersions(1, 2));\n",
    schema: "<database name=\"default\">\n  <table name=\"book\">\n    <column name=\"id\" required=\"true\" primaryKey=\"true\" autoIncrement=\"true\" type=\"integer\" />\n    <column name=\"title\" type=\"varchar\" required=\"true\" />\n    <behavior name=\"versionable\" />\n  </table>\n</database>"
  };
  var $__default = examples;
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
  var app = angular.module('propelFiddle', ['ngRoute', 'ui.codemirror', 'ui.bootstrap']);
  var MainController = System.get("../controller/MainController").default;
  var toArray = System.get("../filters/toArray").default;
  var examples = System.get("../examples").default;
  app.controller('MainController', MainController);
  app.filter('toArray', (function() {
    return toArray;
  }));
  app.constant('EXAMPLES', examples);
  app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $locationProvider.html5Mode(true);
    $routeProvider.when(window._baseUrl + '/', {}).when(window._baseUrl + '/:fiddleId', {}).when(window._baseUrl + '/example/:exampleId', {});
  }]);
  app.run(function($route) {});
  return {};
});
System.get("../app" + '');

//# sourceMappingURL=app.map
