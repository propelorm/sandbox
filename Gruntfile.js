module.exports = function(grunt) {
    grunt.initConfig({
        shell: {
            make_traceur_app: {
                command: 'cd Resources/public; ../../node_modules/traceur/traceur --out build/app.js app.js --experimental --source-maps'
            }
        },

        uglify: {
            build: {
                options: {
                    compress: false,
                    mangle: false,
                    sourceMap: true,
                    sourceMapIncludeSources: true
                },
                files: {
                    'Resources/public/build/complete-app.js': [
                        'node_modules/traceur/bin/traceur-runtime.js',
                        'Resources/public/libs/angular/angular.js',
                        'Resources/public/libs/codemirror/lib/codemirror.js',
                        'Resources/public/libs/codemirror/mode/xml/xml.js',
                        'Resources/public/libs/codemirror/mode/htmlmixed/htmlmixed.js',
                        'Resources/public/libs/codemirror/mode/clike/clike.js',
                        'Resources/public/libs/codemirror/mode/php/php.js',
                        'Resources/public/libs/angular-ui-codemirror/ui-codemirror.min.js',
                        'Resources/public/libs/ladda/js/spin.js',
                        'Resources/public/libs/ladda/dist/ladda.min.js',
                        'Resources/public/libs/angular-route/angular-route.js',
                        'Resources/public/libs/angular-bootstrap/ui-bootstrap.min.js',
                        'Resources/public/libs/angular-bootstrap/ui-bootstrap-tpls.min.js',
                        'Resources/public/build/app.js'
                    ]
                }
            }
        },

        sass: {
            dist: {
                options: {
                    style: 'expanded'
                },
                files: {
                    'Resources/public/build/app.css': 'Resources/public/css/app.scss'
                }
            }
        },

        watch: {
            scripts: {
                files: [
                    'Resources/public/*.js',
                    'Resources/public/controller/*.js',
                    'Resources/public/filters/*.js'
                ],
                tasks: ['shell', 'uglify'],
                options: {
                    interrupt: true,
                    debounceDelay: 50
                }
            },
            styles: {
                files: 'Resources/public/css/*',
                tasks: ['sass'],
                options: {
                    interrupt: true,
                    debounceDelay: 50
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-sass');

    grunt.registerTask('default', ['shell', 'uglify', 'sass']);
};
