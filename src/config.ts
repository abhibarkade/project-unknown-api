import {isNil} from 'ramda'
import pino from 'pino'

/**
 * Parses an environment variable value or returns a default value if the variable is not set or invalid.
 *
 * @template T - The type of the value expected.
 * @param {string | undefined} envValue - The environment variable value to be parsed.
 * @param {T} defaultValue - The default value to use if the environment variable is not set or the parsed value is invalid.
 * @param {(value: string) => T} parser - A function to parse the environment variable value.
 * @returns {T} - The parsed value if valid, otherwise the default value.
 */
export const parseEnv = <T>(envValue: string | undefined, defaultValue: T, parser: (value: string) => T): T => {
    if (envValue) {
        const parsedValue = parser(envValue)
        if (!isNil(parsedValue)) return parsedValue
    }
    return defaultValue
}
export const stringParser = (value: string): string => value

export const serverConfig = {
    fastify: {
        name: 'project unknown',
        host: parseEnv(process.env.FASTIFY_HOST, '::', stringParser),
        port: parseEnv(process.env.FASTIFY_PORT, 3000, Number)
    },
    db: {
        dbUri: parseEnv(process.env.MONGODB_CONNECTION_STRING, '', stringParser),
        db: parseEnv(process.env.MONGODB_DATABASE, '', stringParser),
        poolSize: parseEnv(process.env.DB_POOL_SIZE, 20, Number)
    },
    jwt: {
        jwtSecreteKey: parseEnv(process.env.JWT_SECRET, '', stringParser),
        jwtExpirationTime: parseEnv(process.env.TOKEN_EXPIRATION, '1d', stringParser)
    },
    media: {
        maxFileSize: parseEnv(process.env.MAX_FILE_SIZE, 48, Number)
    }
}

export const logger = pino({
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true
        }
    }
})
