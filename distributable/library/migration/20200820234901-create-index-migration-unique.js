import { Migration as BaseMigration } from '../migration.js';

class Migration extends BaseMigration {

  constructor(path, database) {
    super(path, database);
  }

  async isInstalled() {

    await this._database.open();

    try {
      return await this._database.existsIndexMigrationUnique();
    } finally {
      await this._database.close();
    }

  }

  install() {
    return this._database.createIndexMigrationUnique();
  }

  uninstall() {
    return this._database.dropIndexMigrationUnique();
  }}



export default Migration;
//# sourceMappingURL=20200820234901-create-index-migration-unique.js.map