import { CreateMigration, Migration as BaseMigration } from '@virtualpatterns/mablung-migration'
import FileSystem from 'fs-extra'
import Is from '@pwn/is'
import Path from 'path'

import { Database } from './database.js'

const FilePath = __filePath
const FolderPath = Path.dirname(FilePath)
const Require = __require

class Migration extends CreateMigration(BaseMigration, Path.normalize(`${FolderPath}/../../source/library/migration`), Path.normalize(`${FolderPath}/../../source/library/migration/template.js`), `${FolderPath}/migration`) {

  constructor(path, database) {
    super(Is.string(path) ? path : FilePath)
    this.database = Is.string(path) ? database : path
  }

  async isInstalled() {

    let isInstalled = null

    await this.database.open()

    try {
      isInstalled = await this.database.isMigrationInstalled(this.name)
    } finally {
      await this.database.close()
    }

    return isInstalled

  }

  install() {
    return this.database.installMigration(this.name)
  }

  uninstall() {
    return this.database.uninstallMigration(this.name)
  }

  static createDatabase(...argument) { // argument is [ name, path ]
    return new Database(...this.getDatabaseConfiguration(...argument))
  }

  static getDatabaseConfiguration(name = 'default', path = Require.resolve('./database.json')) {

    let configuration = FileSystem.readJsonSync(path, { 'encoding': 'utf-8' })
    let url = configuration[name].url
    let option = configuration[name]?.option || {}

    return [ url, option ]

  }

  static getRawMigration(includeFrom, includeTo, ...argument) { // argument is [ database ] or [ name, path ]
    return super.getRawMigration(includeFrom, includeTo, (argument[0] instanceof Database) ? argument[0] : this.createDatabase(...argument))
  }

  static async installMigration(includeFrom, includeTo, ...argument) { // argument is [ database ] or [ name, path ]

    let database = (argument[0] instanceof Database) ? argument[0] : this.createDatabase(...argument)

    await database.open()

    try {
      await super.installMigration(includeFrom, includeTo, database)
    } finally {
      await database.close()
    }

  }

  static async uninstallMigration(includeFrom, includeTo, ...argument) { // argument is [ database ] or [ name, path ]
  
    let database = (argument[0] instanceof Database) ? argument[0] : this.createDatabase(...argument)

    await database.open()

    try {
      await super.uninstallMigration(includeFrom, includeTo, database)
    } finally {
      await database.close()
    }

  }

}

export { Migration }
