
import { Migration as BaseMigration } from '../migration.js'

const FilePath = __filePath

class Migration extends BaseMigration {

  constructor(database) {
    super(FilePath, database)
  }

  async isInstalled() {

    let isInstalled = null

    await this.database.open()

    try {
      isInstalled = await this.database.existsIndex('migration', 'migrationByNameIsInstalled')
    } finally {
      await this.database.close()
    }

    return isInstalled

  }

  install() {
    return this.database
      .collection('migration')
      .createIndex(
        [
          { 'name': 1 },
          { 'isInstalled': 1 }
        ],
        { 'name': 'migrationByNameIsInstalled' }
      )
  }

  uninstall() {
    return this.database
      .collection('migration')
      .dropIndex('migrationByNameIsInstalled')
  } 

}

export { Migration }
