export default class MainController {

    constructor($scope, $http, $routeParams, $q, $rootScope, $location, EXAMPLES) {
        this.scope = $scope;
        this.http = $http;
        this.q = $q;
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
        if (fiddleId && this.fiddleId === fiddleId) {
            return; //don't reload it
        }
        this.fiddleId = fiddleId;
        this.scope.example = '';
        if (fiddleId) {
            this.http.get(window._baseUrl + '/' + fiddleId+'.json')
                .success((response) => {
                    this.scope.fiddle = response.data;
                    this.scope.model = {
                        php: this.scope.fiddle.php,
                        title: this.scope.fiddle.title,
                        schema: this.scope.fiddle.schema
                    };
                    this.scope.editable = this.scope.fiddle.editable;
                })
                .error((response) => {
                    delete this.fiddleId;
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
        this.scope.forking = true;
        var promise = this.retrieveNewFiddleId();

        promise.success(() =>  {
            if (!this.scope.model.title) this.scope.model.title = '';
            this.scope.model.title += ' Fork';
            this.run();
            this.scope.forking = false;
        }).error(() => {
            this.scope.forking = false;
        });

        return promise;
    }

    openExample(exampleId) {
        if (!exampleId) return;
        this.open('/example/' + exampleId);
    }

    downloadFiddle() {
        if (!this.fiddleId && !this.scope.example) {
            //no fiddle or a example has ben loaded
            return;
        }

        this.scope.downloadZip = true; //show dialog
        this.scope.downloadingZip = true; //indicate we're loading now everything

        this.downloadZipCanceller = this.q.defer();
        delete this.scope.downloadZipError;

        if (!this.fiddleId && this.scope.example) {
            console.log('it is a example, run first');
            //its a example, we need to run it first. run() forks it already
            this.run()
                .then(() => this.downloadFiddle())
                .catch(() => {
                    this.scope.downloadingZip = false;
                    this.scope.downloadZipError = 'Could not fork the fiddle';
                });
            return;
        }
        if (this.fiddleId && this.fiddle && !this.fiddle.editable) {
            console.log('not editable');
            //we need to fork it first
            this.forkFiddle()
                .then(() => this.downloadFiddle())
                .catch(() => {
                    this.scope.downloadingZip = false;
                    this.scope.downloadZipError = 'Could not fork the fiddle';
                });
            return;
        }

        if (this.fiddleId && !this.scope.fiddle) {
            console.log('not run yet');
            //we need to save&run first
            this.run()
                .then(() => this.downloadFiddle())
                .catch(() => {
                    this.scope.downloadingZip = false;
                    this.scope.downloadZipError = 'Could not run the fiddle';
                });
            return;
        }

        this.http.post(window._baseUrl + '/prepare-download/' + this.fiddleId, {
            timeout: this.downloadZipCanceller.promise
        }).success((response) => {
            this.scope.zipFileName = response.data.name;
            this.scope.zipFileSize = response.data.size;
            this.scope.downloadingZip = false;
        }).error((response) => {
            this.scope.downloadingZip = false;
            this.scope.downloadZipError = 'Could not download zip file';
        })
    }

    cancelDownloadZip() {
        this.scope.downloadZip = false;
        this.downloadZipCanceller.resolve(); //cancel running download request
    }

    downloadPossible() {
        return this.fiddleId || this.scope.example;
    }

    loadExample(exampleId) {
        var example = this.EXAMPLES[exampleId];
        if (example) {
            this.scope.example = exampleId;
            this.scope.fiddle = false;

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

        var promise = this.http.put(window._baseUrl + '/');
        promise.success((response) => {
            if (response.data) {
                this.fiddleId = response.data;
                this.scope.example = '';
                this.open('/' + this.fiddleId);
                this.scope.loading = false;
                this.scope.editable = true;
            }
        });

        return promise;
    }

    run() {
        var data = this.scope.model;

        if (!this.scope.editable) {
            return;
        }

        this.scope.loading = true;
        this.scope.saving = true;

        if (!this.fiddleId) {
            var q = this.q.defer();
            this.retrieveNewFiddleId().success(() => {
                this.run()
                    .success((v) => q.resolve(v))
                    .error((v) => q.reject(v))
            }).error(() => q.reject());
            return q.promise;
        }

        var promise = this.http.post(window._baseUrl + '/' + this.fiddleId, data);
        promise.success((response) => {
                this.scope.fiddle = response.data;
                this.scope.loading = false;
                this.scope.saving = false;
                this.loadMyFiddles();
            })
            .error((response) => {
                this.scope.error = response;
                this.scope.loading = false;
                this.scope.saving = false;
            });

        return promise;
    }
}