import {Db} from 'mongodb'
import {MigrationInterface} from 'mongo-migrate-ts'
import {readFileSync} from 'fs'

export class CreateCollections implements MigrationInterface {
    private collectionsToCreate = ['users']

    async up(db: Db): Promise<void> {
        const allCollectionsArray = await this.getAllCollectionNames(db)
        const matchingCollections = this.collectionsToCreate.filter(collection =>
            allCollectionsArray.includes(collection)
        )
        if (matchingCollections.length > 0) {
            throw new Error(`Collections already exists: ${matchingCollections.join(', ')}`)
        }
        for (const collection of this.collectionsToCreate) {
            const fileName = 'schemas/collections/' + collection + '.json'
            const file = readFileSync(fileName, 'utf8')
            const schema = `{"validator": {
                "$jsonSchema": ${file}}}`
            await db.createCollection(collection, JSON.parse(schema))
        }
    }
    async down(db: Db): Promise<void> {
        for (const collection of this.collectionsToCreate) {
            await db.collection(collection).drop()
        }
        console.log(`\nMigration down: Collections deleted successfully`)
    }

    async getAllCollectionNames(db: Db): Promise<string[]> {
        const collections = await db.listCollections().toArray()
        return collections.map(collection => collection.name)
    }
}
