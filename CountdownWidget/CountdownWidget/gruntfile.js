
/*
This file in the main entry point for defining grunt tasks and using grunt plugins.
Click here to learn more. http://go.microsoft.com/fwlink/?LinkID=513275&clcid=0x409
*/
module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        typings: {
            install: {}
        },
        exec: {
            package: {
                command: "tfx extension create --manifest-globs vss-extension-me.json",
                stdout: true,
                stderr: true
            },
            publish: {
                command: "tfx extension publish --token @INSERT-YOUR-ACCESS-TOKEN-HERE@ --manifest-globs vss-extension-me.json",
                stdout: true,
                stderr: true
            }
        },
        copy: {
            main: {
                files: [
                  {
                      expand: true,
                      flatten: true,
                      src: [
                          'node_modules/vss-web-extension-sdk/lib/VSS.SDK.js',
                          'node_modules/moment/moment.js',
                          'node_modules/jquery/dist/jquery.js',
                          'node_modules/spectrum-colorpicker/spectrum.js',
                          'node_modules/spectrum-colorpicker/spectrum.css'
                      ],
                      dest: 'scripts/lib',
                      filter: 'isFile'
                  },
                  {
                      expand: true,
                      flatten: true,
                      src: [
                          'node_modules/moment/moment.js',
                      ],
                      dest: './',
                      filter: 'isFile'
                  },
                {
                    expand: true,
                    flatten: true,
                    src: [
                        'node_modules/moment/moment.js',
                    ],
                    dest: 'tests/',
                    filter: 'isFile'
                }
                ]
            }
        },
        typescript: {
            compile: {
                src: ['scripts/*.ts'],
                dest: 'scripts',
                options: {
                    module: 'amd',
                    target: 'es5',
                    sourceMap: true,
                    declaration: false,
                    references: ["typings/**/*.d.ts"]
                }
            }
        }
    });

    grunt.loadNpmTasks("grunt-exec");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-contrib-jasmine");
    grunt.loadNpmTasks("grunt-typescript");
    grunt.loadNpmTasks('grunt-typings');
};