import { CreateLoggedDatabase } from '@virtualpatterns/mablung-mongodb-migration/test'
import { Database } from '@virtualpatterns/mablung-mongodb-migration'
import { MongoServerError } from 'mongodb'
import FileSystem from 'fs-extra'
import Path from 'path'
import Sinon from 'sinon'
import Test from 'ava'

const FilePath = __filePath

const LogPath = FilePath.replace('/release/', '/data/').replace('.test.js', '.log')

const DatabaseUrl = 'mongodb://localhost/test-library-create-logged-database-on'
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

Test.serial('onCommandStarted() throws Error', async (test) => {

  let database = new (CreateLoggedDatabase(Database, LogPath))(DatabaseUrl, DatabaseOption)

  let error = new Error()
  let onCommandStartedStub = Sinon
    .stub(database, 'onCommandStarted')
    .throws(error)

  try {

    await database.open()

    try {

      await Promise.all([
        new Promise((resolve, reject) => {

          let errorStub = Sinon
            .stub(database.console, 'error')
            .callsFake(function (...argument) {

              try {

                test.is(argument.length, 1)
                test.is(argument[0], error)

                resolve()

              /* c8 ignore next 3 */
              } catch (error) {
                reject(error)
              } finally {
                errorStub.restore()
              }

            })

        }),
        database.existsCollection('migration')
      ])

    } finally {
      await database.close()
    }

  } finally {
    onCommandStartedStub.restore()
  }

})

Test.serial('onCommandSucceeded() throws Error', async (test) => {

  let database = new (CreateLoggedDatabase(Database, LogPath))(DatabaseUrl, DatabaseOption)

  let error = new Error()
  let onCommandSucceededStub = Sinon
    .stub(database, 'onCommandSucceeded')
    .throws(error)

  try {

    await database.open()

    try {

      await Promise.all([
        new Promise((resolve, reject) => {

          let errorStub = Sinon
            .stub(database.console, 'error')
            .callsFake(function (...argument) {

              try {

                test.is(argument.length, 1)
                test.is(argument[0], error)

                resolve()

              /* c8 ignore next 3 */
              } catch (error) {
                reject(error)
              } finally {
                errorStub.restore()
              }

            })

        }),
        database.existsCollection('migration')
      ])

    } finally {
      await database.close()
    }

  } finally {
    onCommandSucceededStub.restore()
  }

})

Test.serial('onCommandFailed()', async (test) => {

  let database = new (CreateLoggedDatabase(Database, LogPath))(DatabaseUrl, DatabaseOption)

  await database.open()

  try {

    await test.throwsAsync(
      database
        .collection('migration')
        .aggregate([ { '$atch': {} } ])
        .toArray(),
      { 'instanceOf': MongoServerError })

  } finally {
    await database.close()
  }

})

Test.serial('onCommandFailed() throws Error', async (test) => {

  let database = new (CreateLoggedDatabase(Database, LogPath))(DatabaseUrl, DatabaseOption)

  let error = new Error()
  let onCommandFailedStub = Sinon
    .stub(database, 'onCommandFailed')
    .throws(error)

  try {

    await database.open()

    try {

      await test.throwsAsync(
        Promise.all([
          new Promise((resolve, reject) => {

            let errorStub = Sinon
              .stub(database.console, 'error')
              .callsFake(function (...argument) {

                try {

                  test.is(argument.length, 1)
                  test.is(argument[0], error)

                  resolve()

                /* c8 ignore next 3 */
                } catch (error) {
                  reject(error)
                } finally {
                  errorStub.restore()
                }

              })

          }),
          database
            .collection('migration')
            .aggregate([{ '$atch': {} }])
            .toArray()
        ]),
        { 'instanceOf': MongoServerError })

    } finally {
      await database.close()
    }

  } finally {
    onCommandFailedStub.restore()
  }

})
