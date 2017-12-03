'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _discord = require('discord.js');

var _discord2 = _interopRequireDefault(_discord);

var _logging = require('./logging');

var _logging2 = _interopRequireDefault(_logging);

var _config = require('../config');

var _timers = require('timers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const client = new _discord2.default.Client();

client.on('ready', () => {
    setRandomGame();
    (0, _timers.setInterval)(setRandomGame, 600000);

    _logging2.default.info(`ready at ${client.user.tag}`);
});

function setRandomGame() {
    const game = _config.games[Math.floor(Math.random() * _config.games.length)];

    client.user.setGame(game);

    _logging2.default.info(`updated game to '${game}'`);
}

exports.default = client;