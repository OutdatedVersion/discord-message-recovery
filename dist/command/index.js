'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Command = undefined;
exports.registerCommand = registerCommand;
exports.hasCommand = hasCommand;
exports.setupHandler = setupHandler;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _logging = require('../logging');

var _logging2 = _interopRequireDefault(_logging);

var _config = require('../../config');

var _timers = require('timers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

console.log('one one onen oone one one one oncommoand');

class Command {
    constructor(executor, handler) {
        this.executors = Array.isArray(executor) ? executor : [executor];
        this.handler = handler;
    }
}

exports.Command = Command;

const registeredCommands = new Map();

function registerCommand(command) {
    const { executors, handler } = command;

    executors.forEach(executor => registeredCommands.set(executor, handler));

    _logging2.default.info(`registered command: ${executors}`);
}

function hasCommand(executor) {
    if (executor.startsWith(_config.command.prefix)) executor = executor.substring(_config.command.prefix.length);

    return registeredCommands.has(executor);
}

function setupHandler(client) {

    client.on('message', message => {
        const split = message.content.split(' ');

        if (split && split[0].startsWith(_config.command.prefix)) {
            const command = registeredCommands.get(split[0].substring(1));
            const timedReply = text => message.reply(text).then(msg => (0, _timers.setTimeout)(() => msg.delete(), 5000));

            if (command) {
                message.timedReply = timedReply;

                command(message, split.splice(1));
            } else timedReply('i have no command matching that..');
        }
    });
}

function parseDefintion(entry) {
    if (!entry.default) {
        for (let key in entry) parseDefintion({ default: entry[key] });

        return;
    } else entry = entry.default;

    if (!entry) throw new Error('Missing command definition');

    registerCommand(entry.executor, entry.handler);
}