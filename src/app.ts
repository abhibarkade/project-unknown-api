import {fastifyApolloPlugin} from './plugins/apollo-plugin'
import {logger} from './config'
import {restApiPlugin} from './plugins/rest-api-plugin'

import fastify, {FastifyBaseLogger, FastifyInstance} from 'fastify'

export default (): FastifyInstance => {
    const app = async (childInstance: FastifyInstance): Promise<void> => {
        childInstance.register(fastifyApolloPlugin)
        childInstance.register(restApiPlugin)
    }
    const server: FastifyInstance = fastify({
        caseSensitive: false,
        maxParamLength: 200,
        trustProxy: true,
        logger: logger as FastifyBaseLogger,
        pluginTimeout: 10000
    })
    server.register(app)
    return server
}
