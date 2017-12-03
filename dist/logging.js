'use strict';

var _pino = require('pino');

var _pino2 = _interopRequireDefault(_pino);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

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
    return (0, _moment2.default)().format('MMM/D h:mm:ssa');
}

const pretty = _pino2.default.pretty({
    formatter: data => {
        return `${formattedLevels[data.level]} ${_chalk2.default.gray(formattedDate())} ${_chalk2.default.magenta(data.name)} ${_chalk2.default.white('::')} ${data.msg}`;
    }
});

pretty.pipe(process.stdout);

const parent = (0, _pino2.default)({
    name: 'Bot'
}, pretty);

module.exports = {
    info: message => parent.info(message),
    debug: message => parent.debug(message),
    error: message => parent.error(message),
    child: name => parent.child({ name }),
    chalk: _chalk2.default
};