import {MongoCollection} from '../../../@types/collections'
import {logger} from '../../../config'
import {pipelines} from './pipelines'

import {Db, Document} from 'mongodb'

type PipelineCollectionNames = keyof typeof pipelines

export async function fetchRelationalData<T>(
    db: Db,
    collectionName: PipelineCollectionNames,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    query?: any
): Promise<T[]> {
    try {
        const collection = db.collection(collectionName)
        const finalQuery = JSON.parse(JSON.stringify(pipelines[collectionName]))
        if (query) finalQuery[0] = {$match: query}
        const result: T[] = (await collection.aggregate(finalQuery).toArray()) as T[]
        return result
    } catch (error) {
        logger.error(`Error fetching ${collectionName}s: ${error}`)
        throw error
    }
}

export async function insertDataInDB<T, U>(db: Db, collectionName: PipelineCollectionNames, document: T): Promise<U> {
    try {
        const collection = db.collection(collectionName)
        const insertedResult = await collection.insertOne(document as Document, {})
        if (insertedResult && insertedResult.acknowledged && insertedResult.insertedId) {
            const result: U[] = await fetchRelationalData<U>(db, collectionName, {
                _id: insertedResult.insertedId
            })
            return result[0]
        }
        throw new Error('Unable to insert data')
    } catch (error) {
        logger.error(`Error fetching data into ${collectionName}s collection: ${error}`)
        throw error
    }
}

export async function fetchDocumentByField<T>(
    db: Db,
    collectionName: MongoCollection,
    fieldName: keyof T,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fieldValue: any
): Promise<T | null> {
    try {
        const collection = db.collection(collectionName)
        const result = await collection.findOne({[fieldName]: fieldValue})
        return result as T
    } catch (error) {
        logger.error(`Error fetching ${collectionName}s data by ${[fieldName]}: ${error}`)
        throw error
    }
}

export async function updateDataInDB<T, U>(
    db: Db,
    collectionName: PipelineCollectionNames,
    id: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updateFields: Partial<T>
): Promise<U> {
    try {
        const collection = db.collection(collectionName)

        // Ensure the document exists
        const existingDocument = await collection.findOne({id})
        if (!existingDocument) {
            logger.error(`No document found with id ${id} not found`)
            throw new Error(`No document found with id ${id} not found`)
        }

        // Perform the update
        const updateResult = await collection.updateOne({id}, {$set: updateFields as Document})

        if (updateResult.modifiedCount === 0) {
            logger.error('Failed to update document')
            throw new Error('Failed to update document')
        }

        // Fetch the updated document
        const updatedDocuments = await fetchRelationalData<U>(db, collectionName, {id})
        return updatedDocuments[0]
    } catch (error) {
        logger.error(`Error updating ${collectionName}s data: ${error}`)
        throw error
    }
}
