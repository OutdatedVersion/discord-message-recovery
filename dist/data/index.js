'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.RemovedMessage = undefined;

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

var _logging = require('../logging');

var _logging2 = _interopRequireDefault(_logging);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_mongoose2.default.connect('mongodb://localhost/kratos', { useMongoClient: true });
_mongoose2.default.Promise = Promise;

const RemovedMessage = exports.RemovedMessage = _mongoose2.default.model('removed_message', {
    from: String,

    content: String,

    sentIn: String,

    at: Number
});