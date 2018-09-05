import { getRepository, getManager } from 'typeorm'
import MessageMedia from '../database/entity/MessageMedia'
// @ts-ignore
import createRemoteReadStream from 'simple-get-stream'
import minio from '../storage/minio'
import { URL } from 'url'
import { NoSuchMessageError, fetchMessageByID } from './message'

type MediaMeta = {
    objectName: string,
    fileName: string,
    fileExtension: string,
    uploadIndex: number,
    address: string,
}

type UploadResult = {
    etag: string,
    meta: MediaMeta
}

/**
 * The name of the storage bucket in which media will be stored. 
 */
const BUCKET_NAME = 'removed-message-media'

/**
 * Retrieve all media associated with the provided message.
 * 
 * @param removedMessageID The ID of the message that was removed
 * @throws {NoSuchMessageError} In the case that the provided message (by ID) does not exist
 */
export async function fetchMedia(removedMessageID: number): Promise<MessageMedia[]> {
    const parentMessage = await fetchMessageByID(removedMessageID)

    if (!parentMessage) {
        throw new NoSuchMessageError()
    }
    
    const repository = getRepository(MessageMedia)

    return repository.find({ message: { id: removedMessageID } })
}

/**
 * Retrieve the provided remote media and upload it to our own storage service. Then
 * associate it with a removed message.
 * 
 * @param removedMessageID The ID of the message
 * @param mediaAddresses The remote addresses of media to retrieve
 * @returns {[ { id: number, etag: string, meta: MediaMeta } ]}
 * @throws {NoSuchMessageError} In the case that the provided message (by ID) does not exist
 */
export async function attatchMediaToMessage(removedMessageID: number, mediaAddresses: string[]): Promise<UploadResult[]> {
    const parentMessage = await fetchMessageByID(removedMessageID)

    if (!parentMessage) {
        throw new NoSuchMessageError()
    }

    const parsed: MediaMeta[] = mediaAddresses.map((address, index) => {
        const info = extractURLInfo(address)

        const objectName = `${removedMessageID}/${info.name}.${index}.${info.extension}`
        
        return {
            objectName,
            uploadIndex: index,
            address,
            fileName: info.name,
            fileExtension: info.extension
        }
    })
    
    // All files will be uploaded in parallel
    const uploadResults = await Promise.all(parsed.map(uploadRemoteMedia))

    const entities = []
    
    for (const result of uploadResults) {
        if (result.etag) {
            const entity = getManager().create(MessageMedia, {
                message: { id: removedMessageID },
                fileName: result.meta.fileName,
                fileType: result.meta.fileExtension,
                uploadIndex: result.meta.uploadIndex,
            })

            entities.push(entity)
        }
    }

    const repository = getRepository(MessageMedia)

    const result = await repository.createQueryBuilder()
                                   .insert()
                                   .into(MessageMedia)
                                   .values(entities)
                                   .returning('id')
                                   .execute()
                                   .then(result => result.identifiers.map(row => row.id))

    return uploadResults.filter(result => result.etag)
                        .map((uploadResult, index) => ({
                            id: result[index],
                            etag: uploadResult.etag,
                            meta: uploadResult.meta
                        }))
}

/**
 * Upload media, by their remote URL, to our storage service. We merely
 * act as a 'network proxy' between the two.
 * 
 * @param meta The information to use when uploading media
 * @returns {{ etag: string, meta: MediaMeta }}
 */
async function uploadRemoteMedia(meta: MediaMeta): Promise<UploadResult> {
    try {
        const stream = createRemoteReadStream(meta.address)
        const etag = await minio.putObject(BUCKET_NAME, meta.objectName, stream)

        return {
            etag,
            meta
        }
    }
    catch (error) {
        console.error('uploadRemoteMedia', error.stack)

        // TODO(ben): Bugsnag report

        return {
            etag: null,
            meta
        }
    }
}

function extractURLInfo(text: string) {
    try {
        const { pathname } = new URL(text)

        const extension = pathname.substring(pathname.lastIndexOf('.') + 1, pathname.length)
        const name = pathname.substring(pathname.lastIndexOf('/') + 1, pathname.length - (extension.length + 1))

        return {
            full: `${name}.${extension}`,
            name,
            extension
        }
    }
    catch (ignored) {

    }
}