import { CreateLoggedDatabase } from '@virtualpatterns/mablung-mongodb-migration/test'
import { Database } from '@virtualpatterns/mablung-mongodb-migration'
import FileSystem from 'fs-extra'
import Path from 'path'
import Test from 'ava'

import { Migration as CreateCollectionMigration } from '../../library/migration/1638502987605-create-collection-migration.js'
import { Migration as CreateIndexMigrationByName } from '../../library/migration/1638503015379-create-index-migration-by-name.js'
import { Migration as CreateIndexMigrationByNameIsInstalled } from '../../library/migration/1638503040026-create-index-migration-by-name-is-installed.js'

const FilePath = __filePath

const LogPath = FilePath.replace('/release/', '/data/').replace('.test.js', '.log')
const LoggedDatabase = CreateLoggedDatabase(Database, LogPath)

const DatabaseUrl = 'mongodb://localhost/test-library-database'
const DatabaseOption = { 'monitorCommands': true }

Test.before(async () => {
  await FileSystem.ensureDir(Path.dirname(LogPath))
  return FileSystem.remove(LogPath)
})

Test.beforeEach(async () => {

  let database = new Database(DatabaseUrl)

  await database.open()

  try {
    await database.drop()
  } finally {
    await database.close()
  }

})

Test.serial('Database(\'...\')', (test) => {
  test.notThrows(() => { new LoggedDatabase(DatabaseUrl) })
})

Test.serial('Database(\'...\', \'...\')', (test) => {
  test.notThrows(() => { new LoggedDatabase(DatabaseUrl, DatabaseOption) })
})

Test.serial('open()', async (test) => {
 
  let database = new LoggedDatabase(DatabaseUrl, DatabaseOption)

  await test.notThrowsAsync(database.open())
  return database.close()

})

Test.serial('close()', async (test) => {
 
  let database = new LoggedDatabase(DatabaseUrl, DatabaseOption)

  await database.open()
  return test.notThrowsAsync(database.close())

})

Test.serial('count', async (test) => {

  let database = new LoggedDatabase(DatabaseUrl, DatabaseOption)

  test.is(await database.open(), 1)
  
  try {
    test.is(await database.open(), 2)
    test.is(await database.close(), 1)
  } finally {
    test.is(await database.close(), 0)
  }

})

Test.serial('existsCollection(\'...\') returns false', async (test) => {

  let database = new LoggedDatabase(DatabaseUrl, DatabaseOption)

  await database.open()

  try {
    test.is(await database.existsCollection('migration'), false)
  } finally {
    await database.close()
  }

})

Test.serial('existsCollection(\'...\') returns true', async (test) => {

  let database = new LoggedDatabase(DatabaseUrl, DatabaseOption)

  await database.open()

  try {

    await (new CreateCollectionMigration(database)).install()

    test.is(await database.existsCollection('migration'), true)

  } finally {
    await database.close()
  }

})

Test.serial('existsIndex(\'...\', \'...\') returns false when collection does not exist', async (test) => {

  let database = new LoggedDatabase(DatabaseUrl, DatabaseOption)

  await database.open()

  try {

    test.is(await database.existsIndex('migration', 'migrationByName'), false)
    test.is(await database.existsIndex('migration', 'migrationByNameIsInstalled'), false)

  } finally {
    await database.close()
  }

})

Test.serial('existsIndex(\'...\', \'...\') returns false', async (test) => {

  let database = new LoggedDatabase(DatabaseUrl, DatabaseOption)

  await database.open()

  try {

    await (new CreateCollectionMigration(database)).install()

    test.is(await database.existsIndex('migration', 'migrationByName'), false)
    test.is(await database.existsIndex('migration', 'migrationByNameIsInstalled'), false)

  } finally {
    await database.close()
  }

})

Test.serial('existsIndex(\'...\', \'...\') returns true', async (test) => {

  let database = new LoggedDatabase(DatabaseUrl, DatabaseOption)

  await database.open()

  try {

    await (new CreateCollectionMigration(database)).install()
    await (new CreateIndexMigrationByName(database)).install()
    await (new CreateIndexMigrationByNameIsInstalled(database)).install()
    
    test.is(await database.existsIndex('migration', 'migrationByName'), true)
    test.is(await database.existsIndex('migration', 'migrationByNameIsInstalled'), true)

  } finally {
    await database.close()
  }

})

Test.serial('isMigrationInstalled(\'...\') returns false when not installed', async (test) => {

  let database = new LoggedDatabase(DatabaseUrl, DatabaseOption)

  await database.open()

  try {

    await (new CreateCollectionMigration(database)).install()
    await (new CreateIndexMigrationByName(database)).install()
    await (new CreateIndexMigrationByNameIsInstalled(database)).install()

    test.is(await database.isMigrationInstalled('test-migration'), false)

  } finally {
    await database.close()
  }

})

Test.serial('isMigrationInstalled(\'...\') returns true when installed', async (test) => {

  let database = new LoggedDatabase(DatabaseUrl, DatabaseOption)

  await database.open()

  try {

    await (new CreateCollectionMigration(database)).install()
    await (new CreateIndexMigrationByName(database)).install()
    await (new CreateIndexMigrationByNameIsInstalled(database)).install()

    await database.installMigration('test-migration')

    test.is(await database.isMigrationInstalled('test-migration'), true)

  } finally {
    await database.close()
  }

})

Test.serial('isMigrationInstalled(\'...\') returns false when uninstalled', async (test) => {

  let database = new LoggedDatabase(DatabaseUrl, DatabaseOption)

  await database.open()

  try {

    await (new CreateCollectionMigration(database)).install()
    await (new CreateIndexMigrationByName(database)).install()
    await (new CreateIndexMigrationByNameIsInstalled(database)).install()

    await database.installMigration('test-migration')
    await database.uninstallMigration('test-migration')

    test.is(await database.isMigrationInstalled('test-migration'), false)

  } finally {
    await database.close()
  }

})

Test.serial('isMigrationInstalled(\'...\') returns true when reinstalled', async (test) => {

  let database = new LoggedDatabase(DatabaseUrl, DatabaseOption)

  await database.open()

  try {

    await (new CreateCollectionMigration(database)).install()
    await (new CreateIndexMigrationByName(database)).install()
    await (new CreateIndexMigrationByNameIsInstalled(database)).install()

    await database.installMigration('test-migration')
    await database.uninstallMigration('test-migration')
    await database.installMigration('test-migration')

    test.is(await database.isMigrationInstalled('test-migration'), true)

  } finally {
    await database.close()
  }

})

Test.serial('isMigrationInstalled(\'...\') returns false when reuninstalled', async (test) => {

  let database = new LoggedDatabase(DatabaseUrl, DatabaseOption)

  await database.open()

  try {

    await (new CreateCollectionMigration(database)).install()
    await (new CreateIndexMigrationByName(database)).install()
    await (new CreateIndexMigrationByNameIsInstalled(database)).install()

    await database.installMigration('test-migration')
    await database.uninstallMigration('test-migration')
    await database.installMigration('test-migration')
    await database.uninstallMigration('test-migration')

    test.is(await database.isMigrationInstalled('test-migration'), false)

  } finally {
    await database.close()
  }

})

Test.serial('installMigration(\'...\')', async (test) => {

  let database = new LoggedDatabase(DatabaseUrl, DatabaseOption)

  await database.open()

  try {

    await (new CreateCollectionMigration(database)).install()
    await (new CreateIndexMigrationByName(database)).install()
    await (new CreateIndexMigrationByNameIsInstalled(database)).install()

    await test.notThrowsAsync(database.installMigration('test-migration'))

  } finally {
    await database.close()
  }

})

Test.serial('installMigration(\'...\') when reinstalled', async (test) => {

  let database = new LoggedDatabase(DatabaseUrl, DatabaseOption)

  await database.open()

  try {

    await (new CreateCollectionMigration(database)).install()
    await (new CreateIndexMigrationByName(database)).install()
    await (new CreateIndexMigrationByNameIsInstalled(database)).install()

    await database.installMigration('test-migration')
    await test.notThrowsAsync(database.installMigration('test-migration'))

  } finally {
    await database.close()
  }

})

Test.serial('uninstallMigration(\'...\')', async (test) => {

  let database = new LoggedDatabase(DatabaseUrl, DatabaseOption)

  await database.open()

  try {

    await (new CreateCollectionMigration(database)).install()
    await (new CreateIndexMigrationByName(database)).install()
    await (new CreateIndexMigrationByNameIsInstalled(database)).install()

    await database.installMigration('test-migration')
    await test.notThrowsAsync(database.uninstallMigration('test-migration'))

  } finally {
    await database.close()
  }

})

Test.serial('uninstallMigration(\'...\') when reuninstalled', async (test) => {

  let database = new LoggedDatabase(DatabaseUrl, DatabaseOption)

  await database.open()

  try {

    await (new CreateCollectionMigration(database)).install()
    await (new CreateIndexMigrationByName(database)).install()
    await (new CreateIndexMigrationByNameIsInstalled(database)).install()

    await database.installMigration('test-migration')
    await database.uninstallMigration('test-migration')
    await test.notThrowsAsync(database.uninstallMigration('test-migration'))

  } finally {
    await database.close()
  }

})

Test.serial('uninstallMigration(\'...\') when not installed', async (test) => {

  let database = new LoggedDatabase(DatabaseUrl, DatabaseOption)

  await database.open()

  try {

    await (new CreateCollectionMigration(database)).install()
    await (new CreateIndexMigrationByName(database)).install()
    await (new CreateIndexMigrationByNameIsInstalled(database)).install()

    await test.notThrowsAsync(database.uninstallMigration('test-migration'))

  } finally {
    await database.close()
  }

})
