import {FastifyInstance} from 'fastify'
import fastifyMongo from '@fastify/mongodb'
import fastifyPlugin from 'fastify-plugin'
import {serverConfig} from '../config'

/**
 * Plugin function to connect to MongoDB
 * @param fastify - FastifyInstance
 */
async function dbConnector(fastify: FastifyInstance): Promise<void> {
    fastify.register(fastifyMongo, {
        url: `${serverConfig.db.dbUri}${serverConfig.db}`,
        forceClose: true
    })
}

export default fastifyPlugin(dbConnector)
