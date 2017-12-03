import { registerCommand } from '../command'
import { traverseDirectory } from '../utility/folder'


export function setup(client)
{
    traverseDirectory(__dirname, (name, val) => 
    {
        if (name.match(/command/i))
            registerCommand(val)
    })
}
