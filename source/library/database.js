import { Configuration } from '@virtualpatterns/mablung-configuration'
import { MongoClient } from 'mongodb'
import Is from '@pwn/is'

class Database {

  constructor(userUrl, userOption = {}) {

    this.databaseUrl = userUrl
    this.databaseOption = Configuration.getOption(this.defaultOption, userOption)

    this.client = null
    this.database = null
    this.count = 0

  }

  get defaultOption() {
    return {}
  }

  async open() {

    if (Is.equal(this.count, 0)) {

      let client = await MongoClient.connect(this.databaseUrl, this.databaseOption)
      let database = await client.db()

      this.client = client
      this.database = database

    }

    return ++this.count

  }

  drop() {
    return this.database.dropDatabase()
  }

  async close() {

    if (Is.equal(this.count, 1)) {

      await this.client.close()

      // this.database = null
      // this.client = null

    }

    return --this.count

  }

  async existsCollection(name) {

    let cursor = this.database.listCollections({ 'name': name })
    let data = await cursor.toArray()

    return data.length > 0 ? true : false

  }

  async existsIndex(collectionName, indexName) {

    if (await this.existsCollection(collectionName)) {

      let collection = this.database.collection(collectionName)

      return collection.indexExists(indexName)

    } else {
      return false
    }

  }

  async isMigrationInstalled(name) {

    let migration = await this.database
      .collection('migration')
      .findOne(
        {
          'name': name,
          'isInstalled': true
        },
        {
          'hint': {
            'name': 1,
            'isInstalled': 1
          },
          'project': {}
        }
      )

    return Is.not.null(migration)

  }

  installMigration(name) {

    return this.database
      .collection('migration')
      .updateOne(
        { 'name': name },
        {
          '$setOnInsert': { 'name': name },
          '$set': { 'isInstalled': true },
          '$currentDate': { 'whenInstalled': true },
          '$unset': { 'whenUnInstalled': '' }
        },
        {
          'hint': { 'name': 1 },
          'upsert': true
        }
      )
    
  }

  async uninstallMigration(name) {

    // let migration = await this.database
    //   .collection('migration')
    //   .findOne({ 'name': name })
    
    // if (Is.not.null(migration)) {

    //   let history = null
    //   history = migration.history
    //     .map((history, index) => ({ index, 'uninstalled': history.uninstalled }))
    //     .filter((history) => Is.null(history.uninstalled))
    //     .reverse()

    //   history = history[0]

    //   if (Is.not.nil(history)) {

    //     return this.database
    //       .collection('migration')
    //       .updateOne(
    //         { 'name': name },
    //         {
    //           '$inc': { 'installed': -1 },
    //           '$set': {
    //             'updated': new Date(),
    //             [`history.${history.index}.uninstalled`]: new Date()
    //           }
    //         }
    //       )

    //   }

    // }

    return this.database
      .collection('migration')
      .updateOne(
        { 'name': name },
        {
          '$set': { 'isInstalled': false },
          '$currentDate': { 'whenUnInstalled': true }
        },
        { 'hint': { 'name': 1 } }
      )

  }

}

[
  'createCollection',
  'dropCollection',
  'collection'
].forEach((methodName) => {
  Database.prototype[methodName] = function (...argument) {
    return this.database[methodName](...argument)
  }
})

export { Database }
