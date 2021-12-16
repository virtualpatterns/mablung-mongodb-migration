import Is from '@pwn/is'

import { Migration as BaseMigration } from '../migration.js'

const FilePath = __filePath

class Migration extends BaseMigration {

  constructor(path, database) {
    super(Is.string(path) ? path : FilePath, Is.string(path) ? database : path)
  }

  async isInstalled() {

    let isInstalled = null

    await this.database.open()

    try {
      isInstalled = await this.database.existsIndex('migration', 'migrationByName')
    } finally {
      await this.database.close()
    }

    return isInstalled

  }

  install() {
    return this.database
      .collection('migration')
      .createIndex(
        { 'name': 1 },
        {
          'name': 'migrationByName',
          'unique': true
        }
      )
  }

  uninstall() {
    return this.database
      .collection('migration')
      .dropIndex('migrationByName')
  } 

}

export { Migration }
