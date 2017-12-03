'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.traverseDirectory = traverseDirectory;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function traverseDirectory(path, parser) {
    _fs2.default.readdir(_path2.default.resolve(path), (err, files) => {
        if (err) throw err;

        files.filter(file => file !== 'index.js').map(file => require(_path2.default.relative(__dirname, `${path}/${file}`))).forEach(modul => Object.keys(modul).forEach(key => parser(key, modul[key])));
    });
}