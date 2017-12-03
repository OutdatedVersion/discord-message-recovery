'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.command = undefined;

var _discord = require('../discord');

var _discord2 = _interopRequireDefault(_discord);

var _data = require('../data');

var _command = require('../command');

var _dateFns = require('date-fns');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_discord2.default.on('messageDelete', async message => {
    const { content, channel, author } = message;

    if (author.id == _discord2.default.user.id || content.startsWith('-')) return;

    const from = formatName(author);

    await new _data.RemovedMessage({
        content,
        from,
        sentIn: channel.id,
        at: new Date().getTime()
    }).save();

    log.info(`saved message from ${from} - ${content}`);
});

const command = exports.command = new _command.Command('deleted', async (message, args) => {
    console.log('why');
    const limit = parseInt(args[0]);

    if (!limit) {
        message.reply('you missed the history count');
        return;
    }

    let results = await _data.RemovedMessage.find().limit(limit).sort('-at').exec();

    const { length } = results;

    results = results.map(result => {
        const date = (0, _dateFns.distanceInWords)(new Date().getTime(), result.at, { addSuffix: true });

        return `:white_small_square: ${date} ${result.from} said '${result.content}'`;
    }).join('\n');

    message.reply(`here are the previously ${length} removed message${length > 1 ? 's' : ''} for you:\n${results}`);
});