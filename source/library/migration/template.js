
import { Migration as BaseMigration } from '../migration.js'

const FilePath = __filePath

class Migration extends BaseMigration {

  constructor(database) {
    super(FilePath, database)
  }

  async install() {
    await super.install()
  }

  async uninstall() {
    await super.uninstall()
  }

}

export default Migration
