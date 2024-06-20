import {ErrorCode} from '../../../constants/error-codes'
import {MongoCollection} from '../../../@types/collections'
import {ResolverContext} from '../../../@types/context'
import {logger} from '../../../config'
import {v4 as uuid} from 'uuid'

import {
    AccountInteractionType,
    AccountStateType,
    AccountVisibilityType,
    GenderType,
    UpdateUserConnectionInput,
    UpdateUserConnectionResponse,
    UserInteraction,
    VerificationStatusType
} from './../../../generated/graphql'
import {
    AuthMode,
    CheckDuplicateUserInput,
    CheckDuplicateUserResponse,
    SignInInput,
    SignInResponse,
    SignUpInput,
    TokenPayloadInput,
    UpdateUserInput,
    User,
    UserResponse
} from '../../../generated/graphql'
import {UserInteractionCollection, UsersCollection} from '../../../generated/mongo-types'
import {bcryptConfig, generateToken} from '../../../constants/auth/utils'
import {compare, hash} from 'bcrypt'
import {fetchDocumentByField, fetchRelationalData, insertDataInDB, updateDataInDB} from '../db/utils'
import {isEmail, isMobilePhone, isStrongPassword} from 'class-validator'

/**
 * Initiates the process of fetching all users from the database.
 * @param context The resolver context containing the MongoDB database instance.
 * @returns A Promise that resolves to an array of users, or null if no users are found.
 */
export async function getUsers(context: ResolverContext): Promise<User[] | null> {
    logger.info(`Initiating fetching all users from the database.`)
    return await fetchRelationalData<User>(context.mongodb, MongoCollection.USER)
}

/**
 * Checks if the provided username already exists in the database.
 * @param context The resolver context containing the MongoDB database instance.
 * @param input The input containing the username to check for duplication.
 * @returns A Promise that resolves to an object indicating whether the username is a duplicate.
 */
export async function checkUsernameIsDuplicate(
    context: ResolverContext,
    input: CheckDuplicateUserInput
): Promise<CheckDuplicateUserResponse> {
    logger.info(`Checking for duplicate username: ${input.username}`)
    const user = await fetchDocumentByField<User>(context.mongodb, MongoCollection.USER, 'username', input.username)
    logger.info(`User fetch result: ${user ? 'User exists' : 'No user found'}`)
    if (user) return {isDuplicate: true}
    return {isDuplicate: false}
}

/**
 * Creates a new user in the database.
 * @param context The resolver context containing the MongoDB database instance.
 * @param input The input data for creating a new user.
 * @returns A Promise that resolves to a UserResponse indicating success or failure.
 */
export async function signup(context: ResolverContext, input: SignUpInput): Promise<UserResponse> {
    logger.info(`Initiating user sign-up with ${input.authMode == AuthMode.PhonePass ? input.phone : input.email}`)
    try {
        if (!input.password) throw new Error(ErrorCode.MISSING_PASSWORD)
        if (!isStrongPassword(input.password)) throw new Error(ErrorCode.WEAK_PASSWORD)

        if (input.authMode === AuthMode.EmailPass || !input.authMode) {
            if (!input.email) throw new Error(ErrorCode.MISSING_EMAIL)
            if (!isEmail(input.email)) throw new Error(ErrorCode.INVALID_EMAIL_FORMAT)
        } else if (input.authMode === AuthMode.PhonePass) {
            if (!input.phone) throw new Error(ErrorCode.MISSING_PHONE)
            if (!isMobilePhone(input.phone)) throw new Error(ErrorCode.INVALID_PHONE_FORMAT)
        }

        if (input.email) await checkDuplicateUser(context, 'email', input.email, ErrorCode.DUPLICATE_EMAIL)
        if (input.phone) await checkDuplicateUser(context, 'phone', input.phone, ErrorCode.DUPLICATE_PHONE)
        await checkDuplicateUser(context, 'username', input.username, ErrorCode.USERNAME_UNAVAILABLE)

        const id = uuid()
        const userDocument: UsersCollection = {
            id,
            ...input,
            fullName: input.fullName ?? '',
            username: input.username?.toLowerCase(),
            email: input.email?.toLowerCase(),
            phone: input.phone?.toLowerCase(),
            bio: '',
            birthday: input.birthday ?? '',
            password: await hash(input.password ?? id, bcryptConfig.saltRounds),
            gender: input?.gender ?? GenderType.PreferNotSay,
            accountState: AccountStateType.Active,
            accountVisibility: AccountVisibilityType.Public,
            verificationStatus: VerificationStatusType.UnverifiedPlayer,
            preferredGames: [],
            achievements: [],
            skills: [],
            highlights: [],
            createdAt: new Date().toISOString()
        }

        const createdUser = await insertDataInDB<UsersCollection, User>(
            context.mongodb,
            MongoCollection.USER,
            userDocument
        )
        logger.info(`User onboarding ${createdUser ? 'Successful' : 'Failed'}`)
        if (createdUser) return {success: true, context: ErrorCode.USER_CREATION_SUCCESS, user: createdUser}
        return {success: !!createdUser, context: ErrorCode.USER_CREATION_FAILED, user: null}
    } catch (error) {
        logger.error(`Error creating user`)
        logger.error(error)
        throw error
    }
}

export async function updateUser(context: ResolverContext, input: UpdateUserInput): Promise<UserResponse> {
    logger.info(`Initiating user update for userID: ${input.id}`)

    try {
        const user = await fetchDocumentByField<User>(context.mongodb, MongoCollection.USER, 'id', input.id)
        if (!user) {
            logger.error(`User not found with id: ${input.id}`)
            throw new Error(ErrorCode.USER_NOT_FOUND)
        }

        const updateFields: Partial<UsersCollection> = {}

        if (input.password) {
            if (!isStrongPassword(input.password)) {
                logger.error(`Weak password provided`)
                throw new Error(ErrorCode.WEAK_PASSWORD)
            }
            updateFields.password = await hash(input.password, bcryptConfig.saltRounds)
        }

        if (input.email) {
            if (!isEmail(input.email)) {
                logger.error(`Invalid email format: ${input.email}`)
                throw new Error(ErrorCode.INVALID_EMAIL_FORMAT)
            }
            if (user.email != input.email) {
                await checkDuplicateUser(context, 'email', input.email, ErrorCode.DUPLICATE_EMAIL)
                updateFields.email = input.email
            }
        }

        if (input.phone) {
            if (!isMobilePhone(input.phone)) {
                logger.error(`Invalid phone number format: ${input.phone}`)
                throw new Error(ErrorCode.INVALID_PHONE_FORMAT)
            }
            if (user.phone != input.phone) {
                await checkDuplicateUser(context, 'phone', input.phone, ErrorCode.DUPLICATE_PHONE)
                updateFields.phone = input.phone
            }
        }

        if (input.username) {
            if (input.username.length < 6) {
                logger.error(`Invalid username length: ${input.username}`)
                throw new Error(ErrorCode.INVALID_USERNAME_LENGTH)
            }
            if (user.username != input.username) {
                await checkDuplicateUser(context, 'username', input.username, ErrorCode.USERNAME_UNAVAILABLE)
                updateFields.username = input.username
            }
        }
        if (input.fullName && input.fullName != user.fullName) updateFields.fullName = input.fullName
        if (input.bio && input.bio != user.bio) updateFields.bio = input.bio
        if (input.gender && input.gender != user.gender) updateFields.gender = input.gender
        if (input.accountVisibility && input.accountVisibility != user.accountVisibility)
            updateFields.accountVisibility = input.accountVisibility
        if (input.accountState && input.accountState != user.accountState)
            updateFields.accountState = input.accountState
        if (input.verificationStatus && input.verificationStatus != user.verificationStatus)
            updateFields.verificationStatus = input.verificationStatus

        if (Object.keys(updateFields).length > 0) {
            updateFields.updatedAt = new Date().toISOString()
            const updatedUser = await updateDataInDB<UsersCollection, User>(
                context.mongodb,
                MongoCollection.USER,
                user.id,
                updateFields
            )

            logger.info(`User update successful for userID: ${input.id}`)
            return {
                success: !!updatedUser,
                context: updatedUser ? ErrorCode.USER_UPDATED : ErrorCode.USER_UPDATE_FAILED,
                user: updatedUser
            }
        }
        return {
            success: false,
            context: ErrorCode.NO_FIELDS_TO_UPDATE
        }
    } catch (error) {
        logger.error(`Error updating user with userID: ${input.id} with: ${error}`)
        throw error
    }
}

export async function signIn(context: ResolverContext, input: SignInInput): Promise<SignInResponse> {
    logger.info(`Initiating user sign-in with ${input.authMode == AuthMode.PhonePass ? input.phone : input.email}`)

    if (input.authMode === AuthMode.PhonePass) {
        if (!input.phone) {
            logger.error(`Phone number is required for phone-based sign-in`)
            return {success: false, context: ErrorCode.MISSING_PHONE}
        }
        if (!input.password) {
            logger.error(`Password is required for phone-based sign-in`)
            return {success: false, context: ErrorCode.MISSING_PASSWORD}
        }
        const user = await fetchDocumentByField<UsersCollection>(
            context.mongodb,
            MongoCollection.USER,
            'phone',
            input.phone
        )
        if (!user) {
            logger.error(`User not found with phone number: ${input.phone}`)
            return {success: false, context: ErrorCode.INCORRECT_PHONE}
        }
        const flg = await compare(input.password, user.password)
        if (!flg) return {success: false, context: ErrorCode.INCORRECT_PASSWORD}
        const payload: TokenPayloadInput = {
            id: user.id,
            createdAt: user.createdAt ?? `${user.createdAt}`
        }
        const token = await generateToken(context.mongodb, payload)
        return {success: !!token, context: token ? ErrorCode.TOKEN_GRANTED : ErrorCode.TOKEN_DENIED, token: token}
    } else if (input.authMode == AuthMode.EmailPass) {
        if (!input.email) {
            logger.error(`Phone number is required for phone-based sign-in`)
            return {success: false, context: ErrorCode.MISSING_EMAIL}
        }
        if (!input.password) {
            logger.error(`Password is required for phone-based sign-in`)
            return {success: false, context: ErrorCode.MISSING_PASSWORD}
        }
        const user = await fetchDocumentByField<UsersCollection>(
            context.mongodb,
            MongoCollection.USER,
            'email',
            input.email
        )
        if (!user) throw Error(ErrorCode.INCORRECT_EMAIL)
        input.email = input.email?.toLowerCase()
        const flg = await compare(input.password, user.password)
        if (!flg) return {success: false, context: ErrorCode.INCORRECT_PASSWORD}
        const payload: TokenPayloadInput = {
            id: user.id,
            createdAt: user.createdAt ?? `${user.createdAt}`
        }
        const token = await generateToken(context.mongodb, payload)
        return {success: !!token, context: token ? ErrorCode.TOKEN_GRANTED : ErrorCode.TOKEN_DENIED, token: token}
    } else {
        if (!input.email) {
            logger.error(`Email is required for social-based sign-in.`)
            return {success: false, context: ErrorCode.MISSING_EMAIL}
        }

        const user = await fetchDocumentByField<UsersCollection>(
            context.mongodb,
            MongoCollection.USER,
            'email',
            input.email
        )
        if (!user) throw Error(ErrorCode.INCORRECT_EMAIL)
        if (user.authMode == AuthMode.EmailPass || user.authMode == AuthMode.PhonePass) {
            return {success: false, context: ErrorCode.INVALID_USER_AUTH_MODE}
        }
        const payload: TokenPayloadInput = {
            id: user.id,
            createdAt: user.createdAt ?? `${user.createdAt}`
        }
        const token = await generateToken(context.mongodb, payload)
        return {success: !!token, context: token ? ErrorCode.TOKEN_GRANTED : ErrorCode.TOKEN_DENIED, token: token}
    }
}

/**
 * Checks for existing user by a specified field in a case-insensitive manner.
 * @param context The resolver context containing the MongoDB database instance.
 * @param field The field to check (e.g., 'email', 'phone', 'username').
 * @param value The value to check.
 * @param errorCode The error code to throw if a duplicate is found.
 * @throws Error if a duplicate is found.
 */
async function checkDuplicateUser(
    context: ResolverContext,
    field: string,
    value: string,
    errorCode: ErrorCode
): Promise<void> {
    logger.info(`Checking duplicate field for user with ${field}: ${value}`)
    if (
        value &&
        (await fetchDocumentByField<UsersCollection>(context.mongodb, MongoCollection.USER, field, value.toLowerCase()))
    ) {
        throw new Error(errorCode)
    }
}

export async function updateUserConnection(
    context: ResolverContext,
    input: UpdateUserConnectionInput
): Promise<UpdateUserConnectionResponse> {
    logger.info(`Received request from ${input.actor} to ${input.actionType} ${input.target}`)
    const actionSuccessMessages = {
        [AccountInteractionType.Follow]: ErrorCode.FOLLOW_USER_SUCCESS,
        [AccountInteractionType.Unfollow]: ErrorCode.UNFOLLOW_USER_SUCCESS,
        [AccountInteractionType.Block]: ErrorCode.BLOCK_USER_SUCCESS
    }
    const actionFailureMessages = {
        [AccountInteractionType.Follow]: ErrorCode.FOLLOW_USER_FAILED,
        [AccountInteractionType.Unfollow]: ErrorCode.UNFOLLOW_USER_FAILED,
        [AccountInteractionType.Block]: ErrorCode.BLOCK_USER_FAILED
    }

    try {
        const actionType = input.actionType
        const query = {actor: input.actor, target: input.target}
        const existingRecord = await fetchRelationalData<UserInteraction>(
            context.mongodb,
            MongoCollection.USER_INTERACTION,
            query
        )
        if (existingRecord[0]) {
            const updateFields: Partial<UserInteractionCollection> = {}
            if (input.actionType != existingRecord[0].actionType) updateFields.actionType = input.actionType
            updateFields.updatedAt = new Date().toISOString()
            const updatedRecord = await updateDataInDB<UserInteractionCollection, UserInteraction>(
                context.mongodb,
                MongoCollection.USER_INTERACTION,
                existingRecord[0].id,
                updateFields
            )
            if (updatedRecord) {
                logger.info(`Updating record successful for recordId: ${existingRecord[0].id}`)
                return {success: true, context: actionSuccessMessages[actionType]}
            } else {
                logger.info(`Updating record failed for recordId: ${existingRecord[0].id}`)
                return {success: false, context: actionFailureMessages[actionType]}
            }
        } else {
            logger.info(`No existing record found, creating new one`)
            const document: UserInteractionCollection = {
                id: uuid(),
                ...input,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }

            const createdInteraction = await insertDataInDB<UserInteractionCollection, UserInteraction>(
                context.mongodb,
                MongoCollection.USER_INTERACTION,
                document
            )

            if (createdInteraction) {
                logger.info(`Request completed successfully: ${input.actor} ${actionType} ${input.target}`)
                return {success: true, context: actionSuccessMessages[actionType]}
            } else {
                logger.info(`Request failed: ${input.actor} ${actionType} ${input.target}`)
                return {success: false, context: actionFailureMessages[actionType]}
            }
        }
    } catch (error) {
        logger.error(`Error during ${input.actionType} ${input.target} for ${input.actor}`, error)
        logger.error(error)
        return {success: false, context: ErrorCode.GENERIC_ERROR}
    }
}
