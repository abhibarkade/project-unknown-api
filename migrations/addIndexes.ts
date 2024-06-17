import {MigrationInterface} from 'mongo-migrate-ts'

import {Db, IndexDescription} from 'mongodb'

export class addIndexes implements MigrationInterface {
    private collectionsIndex: CollectionsToIndex = {
        migrationsChangelog: [{key: {timestamp: 1}}],
        users: [{key: {id: 1}, unique: true}]
    }

    async up(db: Db): Promise<void> {
        await this.updateIndexes(db, 'createIndexes')
    }
    async down(db: Db): Promise<void> {
        await this.updateIndexes(db, 'dropIndex')
    }

    private async updateIndexes(db: Db, operation: 'createIndexes' | 'dropIndex'): Promise<void> {
        for (const collectionName in this.collectionsIndex) {
            const indexes = this.collectionsIndex[collectionName]
            if (indexes) {
                for (const index of indexes) {
                    index.name = collectionName
                    for (const key in index.key) {
                        index.name += '_' + key
                    }
                    index.name += '_1'
                    if (operation === 'createIndexes') {
                        await db.collection(collectionName).createIndexes([index])
                    } else if (operation === 'dropIndex' && index.name) {
                        await db.collection(collectionName).dropIndex(index.name)
                    }
                    console.log(` -- Index ${operation} for ${collectionName}: ${index.name || index.key}`)
                }
            }
        }
    }
}

interface CollectionsToIndex {
    [collectionName: string]: IndexDescription[] | null
}
