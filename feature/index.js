const files = require('fs')
const path = require('path')

module.exports = (client, log) =>
{
    log.info('Searching for features to load..')

    files.readdirSync(path.join(__dirname, 'feature')).forEach(file => {
        
    })
}