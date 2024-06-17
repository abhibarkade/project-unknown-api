import {Db} from 'mongodb'
import {TokenPayloadInput} from '../../generated/graphql'
import {checkAccessTokenIsValid} from '../../core/graph/services/access.token.service'
import {createOrUpdateAccessToken} from '../../core/graph/db/collections/access.token.db'
import jwt from 'jsonwebtoken'
import {serverConfig} from '../../config'

/**
 * Generate a JWT token with the provided payload.
 * @param payload The payload to be included in the JWT token.
 * @returns The generated JWT token.
 */
export async function generateToken(db: Db, payload: TokenPayloadInput): Promise<string> {
    const token = jwt.sign(payload, serverConfig.jwtSecreteKey, {
        expiresIn: serverConfig.jwtExpirationTime,
        algorithm: 'HS256'
    })
    await createOrUpdateAccessToken(db, token, payload)
    return token
}

/**
 * Verify the provided JWT token.
 * @param token The JWT token to verify.
 * @returns A boolean indicating whether the token is valid (true) or not (false).
 */
export async function verifyToken(db: Db, token: string): Promise<boolean> {
    try {
        const isActive = await checkAccessTokenIsValid(db, token)
        if (isActive) {
            await jwt.verify(token, serverConfig.jwtSecreteKey)
            return true
        }
        return false
    } catch (error) {
        return false
    }
}

export const bcryptConfig = {
    saltRounds: 12 // Increase the number of salt rounds for stronger hashing
}
