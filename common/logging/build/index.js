'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.updateLoggingLevel = exports.createLogger = exports.error = exports.debug = exports.info = exports.rename = undefined;

var _pino = require('pino');

var _pino2 = _interopRequireDefault(_pino);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _dateFns = require('date-fns');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const formattedLevels = {
    60: _chalk2.default.bgRed('FATAL'),
    50: _chalk2.default.red('ERROR'),
    40: _chalk2.default.yellow('WARN'),
    30: _chalk2.default.green('INFO'),
    20: _chalk2.default.blue('DEBUG'),
    10: _chalk2.default.grey('TRACE')
};

function formattedDate() {
    return (0, _dateFns.format)(new Date(), 'MMM/D h:mm:ssa');
}

const parent = (0, _pino2.default)({
    name: 'Main',
    prettyPrint: true,
    prettifier: options => {
        return data => `${formattedLevels[data.level]} ${_chalk2.default.gray(formattedDate())} ${_chalk2.default.magenta(data.name)} ${_chalk2.default.white('::')} ${data.msg}\n`;
    }
});

exports.default = parent;
const rename = exports.rename = newName => parent.name = newName;
const info = exports.info = message => parent.info(message);
const debug = exports.debug = message => parent.debug(message);
const error = exports.error = err => parent.error(err.message, err);
const createLogger = exports.createLogger = name => parent.child({ name });
const updateLoggingLevel = exports.updateLoggingLevel = to => parent.level = to;