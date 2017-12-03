'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.setup = setup;

var _command = require('../command');

var _folder = require('../utility/folder');

function setup(client) {
    (0, _folder.traverseDirectory)(__dirname, (name, val) => {
        if (name.match(/command/i)) (0, _command.registerCommand)(val);
    });
}