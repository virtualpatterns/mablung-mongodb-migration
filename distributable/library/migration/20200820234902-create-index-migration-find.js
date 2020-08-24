import { Migration as BaseMigration } from '../migration.js';

class Migration extends BaseMigration {

  constructor(path, database) {
    super(path, database);
  }

  async isInstalled() {

    await this._database.open();

    try {
      return await this._database.existsIndexMigrationFind();
    } finally {
      await this._database.close();
    }

  }

  install() {
    return this._database.createIndexMigrationFind();
  }

  uninstall() {
    return this._database.dropIndexMigrationFind();
  }}



export default Migration;
//# sourceMappingURL=20200820234902-create-index-migration-find.js.map