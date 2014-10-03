export default class MainController {

    constructor($scope, $http, $routeParams, $rootScope, $location, EXAMPLES) {
        this.scope = $scope;
        this.http = $http;
        this.location = $location;
        this.scope.examples = this.EXAMPLES = EXAMPLES;

        this.defaultModel = {
            php: 'echo "Hello World";',
            schema: '<database name="default">\n' +
            '\n' +
            '\n</database>'
        };

        this.scope.fiddle = false;
        this.scope.pageTitle = '';
        this.scope.editable = false;

        this.scope.$watch('editable', (value) => {
            this.scope.phpCodemirrorOptions.readOnly = !value;
            this.scope.schemaCodemirrorOptions.readOnly = !value;
        });

        $rootScope.$on("$routeChangeSuccess", (event, current) => {
            if ($routeParams.exampleId) {
                this.loadExample($routeParams.exampleId);
            } else {
                this.loadFiddle($routeParams.fiddleId);
            }
        });

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

        this.scope.$watch('example', (v) => this.openExample(v));

        this.scope.$watch('model.title', (value) => {
            if (value) {
                this.scope.pageTitle = value + ' - ';
            } else {
                this.scope.pageTitle = '';
            }
        });

        this.loadMyFiddles();
    }

    openFiddle(id) {
        this.open('/' + id);
    }

    loadMyFiddles(){
        this.http.get(window._baseUrl + '/my-fiddles')
            .success((response) => {
                this.scope.myFiddles = response.data;
            })
            .error((response) => {
                this.scope.myFiddles = [];
            });
    }

    loadFiddle(fiddleId) {
        delete this.scope.notFound;
        if (fiddleId) {
            if (this.fiddleId === fiddleId) {
                return; //don't reload it
            }
            this.http.get(window._baseUrl + '/' + fiddleId+'.json')
                .success((response) => {
                    this.fiddleId = fiddleId;
                    this.scope.example = '';
                    this.scope.fiddle = response.data;
                    this.scope.model = {
                        php: this.scope.fiddle.php,
                        title: this.scope.fiddle.title,
                        schema: this.scope.fiddle.schema
                    };
                    this.scope.editable = this.scope.fiddle.editable;
                })
                .error((response) => {
                    this.scope.notFound = fiddleId;
                });
        } else {
            this.loadNew();
        }
    }

    loadNew() {
        delete this.scope.notFound;
        this.fiddleId = null;
        this.scope.example = '';
        this.scope.model = this.defaultModel;
        this.scope.editable = true;
    }

    newFiddle() {
        this.scope.example = '';
        this.open('/');
    }

    forkFiddle() {
        this.retrieveNewFiddleId().success(() =>  {
            this.scope.model.title += ' Fork';
            this.run();
        });
    }

    openExample(exampleId) {
        if (!exampleId) return;
        this.open('/example/' + exampleId);
    }

    loadExample(exampleId) {
        var example = this.EXAMPLES[exampleId];
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
    }

    open(path) {
        this.location.path(window._baseUrl + path);
    }

    retrieveNewFiddleId(){
        this.scope.loading = true;

        var q = this.http.put(window._baseUrl + '/');
        q.success((response) => {
            if (response.data) {
                this.fiddleId = response.data;
                this.scope.example = '';
                this.open('/' + this.fiddleId);
                this.scope.loading = false;
                this.scope.editable = true;
            }
        });

        return q;
    }

    run() {
        var data = this.scope.model;

        if (!this.scope.editable) {
            return;
        }

        this.scope.loading = true;

        if (!this.fiddleId) {
            this.retrieveNewFiddleId().success(() => this.run());
            return;
        }

        this.http.post(window._baseUrl + '/' + this.fiddleId, data)
            .success((response) => {
                this.scope.fiddle = response.data;
                this.scope.loading = false;
                this.loadMyFiddles();
            })
            .error((response) => {
                this.scope.error = response;
                this.scope.loading = false;
            });
    }
}