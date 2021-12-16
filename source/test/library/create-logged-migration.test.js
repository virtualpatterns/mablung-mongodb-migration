import { CreateLoggedMigration } from '@virtualpatterns/mablung-mongodb-migration/test'
import { Database, Migration } from '@virtualpatterns/mablung-mongodb-migration'
import Test from 'ava'

Test.serial('CreateLoggedMigration(..., ...)', (test) => {
  test.notThrows(() => { CreateLoggedMigration(Migration, Database) })
})
