// errors.ts
export enum ErrorCode {
    // General errors
    GENERIC_ERROR = 'GENERIC_ERROR',
    INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',

    // Server errors
    DATABASE_CONNECTION = 'DATABASE_CONNECTION',

    // User creation errors
    DUPLICATE_EMAIL = 'DUPLICATE_EMAIL',
    DUPLICATE_PHONE = 'DUPLICATE_PHONE',
    USERNAME_UNAVAILABLE = 'USERNAME_UNAVAILABLE',
    INVALID_USERNAME_LENGTH = 'INVALID_USERNAME_LENGTH',
    USER_CREATION_SUCCESS = 'USER_CREATION_SUCCESS',
    USER_CREATION_FAILED = 'USER_CREATION_FAILED',

    // User update errors
    EMAIL_ALREADY_USED = 'EMAIL_ALREADY_USED',
    PHONE_ALREADY_USED = 'PHONE_ALREADY_USED',
    USERNAME_NOT_AVAILABLE = 'USERNAME_NOT_AVAILABLE',
    USER_UPDATED = 'USER_UPDATED',
    USER_UPDATE_FAILED = 'USER_UPDATE_FAILED',
    NO_FIELDS_TO_UPDATE = 'NO_FIELDS_TO_UPDATE',

    // Sign-in errors
    USER_NOT_FOUND = 'USER_NOT_FOUND',
    INCORRECT_PASSWORD = 'INCORRECT_PASSWORD',

    // Authentication errors
    MISSING_EMAIL = 'MISSING_EMAIL',
    INCORRECT_EMAIL = 'INCORRECT_EMAIL',
    INCORRECT_PHONE = 'INCORRECT_PHONE',
    MISSING_PHONE = 'MISSING_PHONE',
    MISSING_PASSWORD = 'MISSING_PASSWORD',
    INVALID_EMAIL_FORMAT = 'INVALID_EMAIL_FORMAT',
    INVALID_PHONE_FORMAT = 'INVALID_PHONE_FORMAT',
    WEAK_PASSWORD = 'WEAK_PASSWORD',
    INVALID_USER_AUTH_MODE = 'INVALID_USER_AUTH_MODE',

    // Token and authentication errors
    NOT_AUTHENTICATED = 'NOT_AUTHENTICATED',
    INVALID_TOKEN = 'INVALID_TOKEN',
    TOKEN_GRANTED = 'TOKEN_GRANTED',
    TOKEN_DENIED = 'TOKEN_DENIED',

    // Media Upload
    INVALID_MEDIA_TYPE = 'INVALID_MEDIA_TYPE',
    MEDIA_UPLOAD_FAILED = 'MEDIA_UPLOAD_FAILED',
    MEDIA_NOT_ATTACHED = 'MEDIA_NOT_ATTACHED',
    MEDIA_UPLOAD_SUCCESS = 'MEDIA_UPLOAD_SUCCESS',
    FILE_NOT_FOUND = 'FILE_NOT_FOUND',

    // Following
    FOLLOW_USER_SUCCESS = 'FOLLOW_USER_SUCCESS',
    FOLLOW_USER_FAILED = 'FOLLOW_USER_FAILED',
    UNFOLLOW_USER_SUCCESS = 'UNFOLLOW_USER_SUCCESS',
    UNFOLLOW_USER_FAILED = 'UNFOLLOW_USER_FAILED',
    BLOCK_USER_SUCCESS = 'BLOCK_USER_SUCCESS',
    BLOCK_USER_FAILED = 'BLOCK_USER_FAILED'
}

export const ErrorMessage: Record<ErrorCode, string> = {
    // General errors
    [ErrorCode.GENERIC_ERROR]: 'An error occurred',
    [ErrorCode.INTERNAL_SERVER_ERROR]: 'Something went wrong',

    [ErrorCode.DATABASE_CONNECTION]: 'Unable to connect database',

    // User creation errors
    [ErrorCode.DUPLICATE_EMAIL]: 'Email already exists',
    [ErrorCode.DUPLICATE_PHONE]: 'Phone number already exists',
    [ErrorCode.USERNAME_UNAVAILABLE]: 'Username is not available',
    [ErrorCode.INVALID_USERNAME_LENGTH]: 'Username must contain atleast 6 characters',
    [ErrorCode.USER_CREATION_SUCCESS]: 'User created successfully',
    [ErrorCode.USER_CREATION_FAILED]: 'User creation failed',

    // User update errors
    [ErrorCode.EMAIL_ALREADY_USED]: 'Email is already in use',
    [ErrorCode.PHONE_ALREADY_USED]: 'Phone number is already in use',
    [ErrorCode.USERNAME_NOT_AVAILABLE]: 'Username is not available',
    [ErrorCode.USER_UPDATED]: 'Users data updated',
    [ErrorCode.USER_UPDATE_FAILED]: 'User data update failed',
    [ErrorCode.NO_FIELDS_TO_UPDATE]: 'No data found to update',

    // Sign-in errors
    [ErrorCode.USER_NOT_FOUND]: 'User not found',
    [ErrorCode.INCORRECT_PASSWORD]: 'Incorrect password',

    // Authentication errors
    [ErrorCode.MISSING_EMAIL]: 'Email is missing',
    [ErrorCode.INCORRECT_EMAIL]: 'No user found with email',
    [ErrorCode.INCORRECT_PHONE]: 'No user found with phone',
    [ErrorCode.MISSING_PHONE]: 'Phone number is missing',
    [ErrorCode.MISSING_PASSWORD]: 'Password is missing',
    [ErrorCode.INVALID_EMAIL_FORMAT]: 'Invalid email format',
    [ErrorCode.INVALID_PHONE_FORMAT]: 'Invalid phone number format',
    [ErrorCode.WEAK_PASSWORD]: 'Weak password',
    [ErrorCode.INVALID_USER_AUTH_MODE]:
        'User has created account with google, facebook or apple. Try with EMAIL_PASS instead.',

    // Token and authentication errors
    [ErrorCode.NOT_AUTHENTICATED]: 'Not authenticated',
    [ErrorCode.INVALID_TOKEN]: 'Invalid token',
    [ErrorCode.TOKEN_GRANTED]: 'Token created for user',
    [ErrorCode.TOKEN_DENIED]: 'Token not created for user',

    // Media Upload
    [ErrorCode.INVALID_MEDIA_TYPE]: 'Invalid media type',
    [ErrorCode.MEDIA_UPLOAD_FAILED]: 'Media upload failed',
    [ErrorCode.MEDIA_UPLOAD_SUCCESS]: 'Media uploaded successfully',
    [ErrorCode.MEDIA_NOT_ATTACHED]: 'No media found in request',
    [ErrorCode.FILE_NOT_FOUND]: 'No file found to download',

    // Following
    [ErrorCode.FOLLOW_USER_SUCCESS]: 'User followed another user',
    [ErrorCode.FOLLOW_USER_FAILED]: 'Following user failed',
    [ErrorCode.UNFOLLOW_USER_SUCCESS]: 'User un-followed another user',
    [ErrorCode.UNFOLLOW_USER_FAILED]: 'Unfollowing user failed',
    [ErrorCode.BLOCK_USER_SUCCESS]: 'User blocked other used',
    [ErrorCode.BLOCK_USER_FAILED]: 'Blocking user failed'
}
