import {mongoMigrateCli} from 'mongo-migrate-ts'

mongoMigrateCli({
    uri: process.env.MONGODB_CONNECTION_STRING ?? '',
    database: process.env.MONGODB_DATABASE ?? '',
    migrationsDir: 'dist/migrations',
    migrationsCollection: 'migrationsChangelog'
})
