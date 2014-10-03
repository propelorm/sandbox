export default class MainController {

    constructor($scope, $http) {
        this.scope = $scope;
        this.http = $http;
        this.fiddleId = window.config.fiddleId;
        this.editable = window.config.editable;

        this.examples = {
            'bookstore': {label: 'Bookstore'}
        };

        this.defaultModel = {
            php: 'echo "Hello World";',
            schema: '<database name="default">\n' +
            '\n' +
            '\n</database>'
        };

        this.scope.fiddle = {};
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

        this.scope.$watch('example', () => this.loadExample());

        this.scope.$watch('model.title', (value) => {
            if (value) {
                this.scope.pageTitle = value + ' - ';
            } else {
                this.scope.pageTitle = '';
            }
        });
    }

    newFiddle() {
        this.retrieveNewFiddleId().success(() => {
            this.scope.model.php = '';
            this.scope.model.schema = '';
            this.scope.model.title = 'New Fiddle';
            this.run();
        });
    }

    forkFiddle() {
        this.retrieveNewFiddleId().success(() =>  {
            this.scope.model.title += ' Fork';
            this.run();
        });
    }

    loadExample() {
        if (!this.example) return;
    }

    retrieveNewFiddleId(){
        this.scope.loading = true;

        var q = this.http.put('/');
        q.success((response) => {
            if (response.data) {
                this.fiddleId = response.data;
                this.scope.fiddle.id = response.data;
                this.scope.model.id = response.data;
                history.pushState({id: response.data}, "Fiddle " + response.data, window._baseUrl + "/" + response.data);
                this.scope.loading = false;
                this.editable = true;
            }
        });

        return q;
    }

    run() {
        var data = this.scope.model;

        this.scope.loading = true;

        if (!this.fiddleId) {
            this.retrieveNewFiddleId().success(() => this.run());
            return;
        }

        this.http.post(window._baseUrl + '/' + this.fiddleId, data)
            .success((response) => {
                this.scope.fiddle = response.data;
                this.scope.loading = false;
            })
            .error((response) => {
                this.scope.error = response;
                this.scope.loading = false;
            });
    }
}