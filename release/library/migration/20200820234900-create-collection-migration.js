import { Migration as BaseMigration } from '../migration.js';

class Migration extends BaseMigration {

  constructor(path, database) {
    super(path, database);
  }

  async isInstalled() {

    await this._database.open();

    try {
      return await this._database.existsCollectionMigration();
    } finally {
      await this._database.close();
    }

  }

  install() {
    return this._database.createCollectionMigration();
  }

  uninstall() {
    return this._database.dropCollectionMigration();
  }}



export default Migration;
//# sourceMappingURL=20200820234900-create-collection-migration.js.map