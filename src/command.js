export default client => 
{
    client.on('message', async message => 
    {
        const split = message.content.split(' ')
    
        if (split && split[0].startsWith('-'))
        {
            const command = split[0].substring(1)

            client.emit('command', message, command, split.slice(1))
        }
    })
}
