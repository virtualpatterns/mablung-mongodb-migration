import EventEmitter from 'events'
import Is from '@pwn/is'
import MongoDB from 'mongodb'

const { MongoClient } = MongoDB

class Database extends EventEmitter {

  constructor(url, name) {
    super()

    this._url = url
    this._name = name

    this._client = null
    this._database = null
    this._count = 0

  }

  /* c8 ignore next 3 */
  get url() {
    return this._url
  }

  /* c8 ignore next 3 */
  get name() {
    return this._name
  }

  async open() {

    if (this._count === 0) {
        
      let client = await MongoClient.connect(this._url, { 'useUnifiedTopology': true })
      let database = await client.db(this._name)

      this._client = client
      this._database = database

    }

    this._count++

  }

  existsCollectionMigration() {
    return this.existsCollection('migration')
  }

  createCollectionMigration() {
    return this._database.createCollection('migration')
  }

  dropCollectionMigration() {
    return this._database.dropCollection('migration')
  }

  existsIndexMigration() {
    return this.existsIndex('migration', 'migrationIndex')
  }

  createIndexMigration() {
    return this._database.collection('migration').createIndex({ 'name': 1 }, { 'name': 'migrationIndex', 'unique': true })
  }

  dropIndexMigration() {
    return this._database.collection('migration').dropIndex('migrationIndex')
  }

  explainIndexMigration(name) {
    return this._database.collection('migration').find({ 'name': name }).explain()
  }

  // existsIndexMigrationFind() {
  //   return this.existsIndex('migration', 'migrationIndexFind')
  // }

  // createIndexMigrationFind() {
  //   return this._database.collection('migration').createIndex({ 'name': 1, 'installed': 1, 'uninstalled': 1 }, { 'name': 'migrationIndexFind' })
  // }

  // dropIndexMigrationFind() {
  //   return this._database.collection('migration').dropIndex('migrationIndexFind')
  // }

  async isMigrationInstalled(name) {

    let migration = await this._database.collection('migration').findOne({ 'name': name }) //, 'installed': { $ne: null }, 'uninstalled': null })

    return Is.not.null(migration) && Is.not.null(migration.installed) && Is.null(migration.uninstalled) // Is.null(data) ? false : true

  }

  installMigration(name) { 
    // findOneAndReplace because a record may not exist
    return this._database.collection('migration').findOneAndReplace(
      { 'name': name }, 
      { 'name': name, 'installed': new Date(), 'uninstalled': null }, 
      { 'upsert': true })
  }

  uninstallMigration(name) {
    return this._database.collection('migration').findOneAndUpdate(
      { 'name': name }, // 'installed': { $ne: null }, 'uninstalled': null }, 
      { '$set': { 'uninstalled': new Date() } })
  }

  async existsCollection(name) {

    let cursor = this._database.listCollections()

    let data = null
    data = await cursor.toArray()
    data = data.filter((collection) => collection.name === name)

    return data.length > 0 ? true : false

  }

  async existsIndex(collectionName, indexName) {

    if (await this.existsCollection(collectionName)) {

      let collection = this._database.collection(collectionName)
      let cursor = collection.listIndexes()
  
      let data = null
      data = await cursor.toArray()
      data = data.filter((index) => index.name === indexName)
  
      return data.length > 0 ? true : false

    } else { 
      return false 
    }

  }

  async close() {

    if (this._count === 1) {

      await this._client.close()

      this._database = null
      this._client = null

    }

    this._count--

  }

}

export { Database }
