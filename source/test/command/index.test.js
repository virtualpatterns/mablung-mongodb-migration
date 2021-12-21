import { CreateLoggedProcess } from '@virtualpatterns/mablung-worker/test'
import { Migration } from '@virtualpatterns/mablung-mongodb-migration'
import { SpawnedProcess } from '@virtualpatterns/mablung-worker'
import FileSystem from 'fs-extra'
import Path from 'path'
import Test from 'ava'

const FilePath = __filePath
const Process = process
const Require = __require

const LogPath = FilePath.replace('/release/', '/data/').replace(/\.test\.js$/, '.log')
const LoggedProcess = CreateLoggedProcess(SpawnedProcess, LogPath)

const ConfigurationPath = Require.resolve('./database.json')
const ConfigurationName = FilePath.replace(`${Process.cwd()}/release/`, '')

Test.before(async () => {
  await FileSystem.ensureDir(Path.dirname(LogPath))
  await FileSystem.remove(LogPath)
})

Test.beforeEach(async () => {

  let database = Migration.createDatabase(ConfigurationName, ConfigurationPath) // new Database(ConfigurationName, ConfigurationPath)

  await database.open()

  try {
    await database.drop()
  } finally {
    await database.close()
  }

})

Test.serial('list', async (test) => {

  let process = new LoggedProcess('npx', [
    'mablung-migration',
    '--migration-path', Require.resolve('../../library/migration.js'),
    'list', ConfigurationName, ConfigurationPath
  ])

  test.is(await process.whenExit(), 0)

})

Test.serial('install', async (test) => {

  let process = new LoggedProcess('npx', [
    'mablung-migration',
    '--migration-path', Require.resolve('../../library/migration.js'),
    'install', ConfigurationName, ConfigurationPath
  ])

  test.is(await process.whenExit(), 0)
  
  let migration = await Migration.getMigration(Migration.defaultFrom, Migration.defaultTo, ConfigurationName, ConfigurationPath)

  test.is(migration.length, 3)
  test.is(await migration[0].isInstalled(), true)
  test.is(await migration[1].isInstalled(), true)
  test.is(await migration[2].isInstalled(), true)

})

Test.serial('uninstall', async (test) => {

  let process = null

  process = new LoggedProcess('npx', [
    'mablung-migration',
    '--migration-path', Require.resolve('../../library/migration.js'),
    'install', ConfigurationName, ConfigurationPath
  ])

  await process.whenExit()

  process = new LoggedProcess('npx', [
    'mablung-migration',
    '--migration-path', Require.resolve('../../library/migration.js'),
    'uninstall', ConfigurationName, ConfigurationPath
  ])

  test.is(await process.whenExit(), 0)

  let migration = await Migration.getMigration(Migration.defaultFrom, Migration.defaultTo, ConfigurationName, ConfigurationPath)

  test.is(migration.length, 3)
  test.is(await migration[0].isInstalled(), false)
  test.is(await migration[1].isInstalled(), false)
  test.is(await migration[2].isInstalled(), false)

})
