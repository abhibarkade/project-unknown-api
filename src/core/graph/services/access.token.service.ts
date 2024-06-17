import {AccessTokensCollection} from '../../../generated/mongo-types'
import {Db} from 'mongodb'
import {MongoCollection} from '../../../@types/collections'
import {TokenStatus} from '../../../generated/graphql'
import {fetchDocumentByField} from '../db/utils'

/**
 * Generate a JWT token with the provided payload.
 * @param db The MongoDB database instance.
 * @param payload The payload to be included in the JWT token.
 * @returns The generated JWT token.
 */
export async function checkAccessTokenIsValid(db: Db, token: string): Promise<boolean> {
    const tokenData = await fetchDocumentByField<AccessTokensCollection>(
        db,
        MongoCollection.ACCESS_TOKEN,
        'token',
        token
    )
    return tokenData?.status === TokenStatus.Active
}
