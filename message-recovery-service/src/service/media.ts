import { getRepository } from 'typeorm'
import MessageMedia from '../database/entity/MessageMedia'
// @ts-ignore
import createRemoteReadStream from 'simple-get-stream'
import minio from '../storage/minio'
import { createWriteStream, unlink } from 'fs'
import uuid from 'uuid/v4'
import { URL } from 'url'

type MediaMeta = {
    objectName: string,
    uploadIndex: number,
    address: string
}

const BUCKET_NAME = 'removed-message-media'

export async function attatchMediaToMessage(removedMessageID: number, mediaAddresses: string[]): Promise<string[]> {
    const parsed: MediaMeta[] = mediaAddresses.map((address, index) => {
        const info = extractURLInfo(address)
        
        const objectName = `${removedMessageID}/${info.name}.${index}.${info.extension}`
        
        return {
            objectName,
            uploadIndex: index,
            address
        }
    })
    
    // All files will be uploaded in parallel
    const uploads = await Promise.all(parsed.map(meta => uploadMedia(meta.objectName, meta.address)))

    // save the meta
    

    return uploads
}

export async function uploadMedia(objectName: string, mediaAddress: string): Promise<string> {
    // We're going to go ahead and buffer this locally instead of orchestrating remote -> minio
    
    try {
        // Local buffer
        const path = await downloadRemoteMedia(mediaAddress)

        // Local -> Minio instance
        const etag = await minio.fPutObject(BUCKET_NAME, objectName, path, { })

        // Clean up after ourselves
        unlink(path, (error: Error) => { throw error })

        return etag
    }
    catch (error) {
        console.error(error.stack)
        return ''
    }
}

function downloadRemoteMedia(mediaAddress: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const path = `/tmp/${uuid()}`

        const stream = createRemoteReadStream(mediaAddress)
    
        stream.on('finish', () => resolve(path))
        stream.on('error', (error: Error) => console.error('stream.on(error)', error.stack))

        stream.pipe(createWriteStream(path))
    })    
}

function extractURLInfo(text: string) {
    try {
        const { pathname } = new URL(text)

        const extension = pathname.substring(pathname.lastIndexOf('.') + 1, pathname.length)
        const name = `${pathname.substring(pathname.lastIndexOf('/') + 1, pathname.length - (extension.length + 1))}.${Math.floor(Math.random() * 1000)}`

        return {
            full: `${name}.${extension}`,
            name,
            extension
        }
    }
    catch (ignored) {

    }
}