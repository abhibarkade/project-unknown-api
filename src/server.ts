import app from './app'

import {logger, serverConfig} from './config'

const {host, port} = serverConfig

const startServer = async (): Promise<void> => {
    try {
        const server = app()
        server.listen({port, host}, error => {
            if (error) {
                logger.error(error)
                process.exit(1)
            }
            logger.info(`router radix tree\n${server.printRoutes()}`)
        })
    } catch (error) {
        logger.error(error)
        process.exit(1)
    }
}

startServer()
