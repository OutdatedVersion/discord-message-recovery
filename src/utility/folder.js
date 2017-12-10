import Files from 'fs'
import Path from 'path'

export function traverseDirectory(path, parser)
{
    Files.readdir(Path.resolve(path), (err, files) =>
    {
        if (err)
            throw err

        files.filter(file => file !== 'index.js')
             .map(file => require(Path.relative(__dirname, `${path}/${file}`)))
             .forEach(modul => Object.keys(modul).forEach(key => parser(modul[key], key)))
    })
}
