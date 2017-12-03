'use strict';

var _discord = require('./discord');

var _discord2 = _interopRequireDefault(_discord);

var _logging = require('./logging');

var _logging2 = _interopRequireDefault(_logging);

var _config = require('../config');

var _command = require('./command');

var _feature = require('./feature');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _command.setupHandler)(_discord2.default);
(0, _feature.setup)(_discord2.default);

_discord2.default.login(_config.token);