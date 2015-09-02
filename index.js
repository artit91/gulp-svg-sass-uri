
/*jslint node: true, this: true */

(function () {

    'use strict';

    var through = require('through2'),
        File = require('gulp-util').File,
        path = require('path'),
        SVGO = require('svgo'),
        svgo = new SVGO();

    module.exports = function (filename) {

        var files = [];

        function transform(params) {
            var template = ".{{name}}{background-image:url('data:image/svg+xml;charset=utf-8,{{data}}');width:{{width}};height:{{height}};background-repeat:no-repeat;}",
                keys = Object.keys(params);

            keys.forEach(function (param) {
                template = template.replace(new RegExp("\\{\\{" + param + "\\}\\}", "gi"), params[param]);
            });

            return template;
        }

        function toSASSURI(file, ignore, callback) {
            if (file.isNull()) {
                return callback(null, file);
            }
            if (file.isStream()) {
                return callback(new Error('gulp-svg-sass-uri: Streaming not supported'));
            }
            svgo.optimize(file.contents.toString(), function (result) {
                var params = {
                    name: 'svg-' + path.basename(file.history[0]).replace('.svg', ''),
                    data: encodeURIComponent(result.data),
                    width: result.info.width + 'px',
                    height: result.info.height + 'px'
                };
                files.push(transform(params));
                callback(null, file);
            });
        }

        function endStream(callback) {
            var file = new File();
            file.path = filename || 'svg.scss';
            file.contents = new Buffer(files.join('\n'));
            this.push(file);
            callback();
        }

        return through.obj(toSASSURI, endStream);
    };
}());