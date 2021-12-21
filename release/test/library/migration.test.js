import { createRequire as _createRequire } from "module";
import _URL from "url";
import { CreateLoggedDatabase, CreateLoggedMigration } from '@virtualpatterns/mablung-mongodb-migration/test';
import { Database, Migration } from '@virtualpatterns/mablung-mongodb-migration';
import FileSystem from 'fs-extra';
import Path from 'path';
import Sinon from 'sinon';
import Test from 'ava';
import { Migration as CreateCollectionMigration } from '../../library/migration/1638502987605-create-collection-migration.js';
import { Migration as CreateIndexMigrationByName } from '../../library/migration/1638503015379-create-index-migration-by-name.js';
import { Migration as CreateIndexMigrationByNameIsInstalled } from '../../library/migration/1638503040026-create-index-migration-by-name-is-installed.js';

const FilePath = _URL.fileURLToPath(import.meta.url);

const FolderPath = Path.dirname(FilePath);
const Process = process;

const Require = _createRequire(import.meta.url);

const LogPath = FilePath.replace('/release/', '/data/').replace('.test.js', '.log');
const LoggedDatabase = CreateLoggedDatabase(Database, LogPath);
const LoggedMigration = CreateLoggedMigration(Migration, LoggedDatabase);
const LoggedCreateCollectionMigration = CreateLoggedMigration(CreateCollectionMigration, LoggedDatabase);
const LoggedCreateIndexMigrationByName = CreateLoggedMigration(CreateIndexMigrationByName, LoggedDatabase);
const LoggedCreateIndexMigrationByNameIsInstalled = CreateLoggedMigration(CreateIndexMigrationByNameIsInstalled, LoggedDatabase);
const ConfigurationPath = Require.resolve('./database.json');
const ConfigurationName = FilePath.replace(`${Process.cwd()}/release/`, '');
Test.before(async () => {
  await FileSystem.ensureDir(Path.dirname(LogPath));
  return FileSystem.remove(LogPath);
});
Test.beforeEach(async () => {
  let database = Migration.createDatabase(ConfigurationName, ConfigurationPath); // new Database(ConfigurationName, ConfigurationPath)

  await database.open();

  try {
    await database.drop();
  } finally {
    await database.close();
  }
});
Test.serial('Migration(...)', test => {
  test.notThrows(() => {
    new LoggedCreateCollectionMigration(LoggedMigration.createDatabase(ConfigurationName, ConfigurationPath));
  });
});
Test.serial('isInstalled() returns false when not installed', async test => {
  let database = LoggedMigration.createDatabase(ConfigurationName, ConfigurationPath);
  await database.open();

  try {
    await new LoggedCreateCollectionMigration(database).install();
    await new LoggedCreateIndexMigrationByName(database).install();
    await new LoggedCreateIndexMigrationByNameIsInstalled(database).install();
    let migration = new LoggedMigration(Path.normalize(`${FolderPath}/../../library/migration/does-not-exist.js`), database);
    test.is(await migration.isInstalled(), false);
  } finally {
    await database.close();
  }
});
Test.serial('isInstalled() returns true when installed', async test => {
  let database = LoggedMigration.createDatabase(ConfigurationName, ConfigurationPath);
  await database.open();

  try {
    await new LoggedCreateCollectionMigration(database).install();
    await new LoggedCreateIndexMigrationByName(database).install();
    await new LoggedCreateIndexMigrationByNameIsInstalled(database).install();
    let migration = new LoggedMigration(Path.normalize(`${FolderPath}/../../library/migration/does-not-exist.js`), database);
    await migration.install();
    test.is(await migration.isInstalled(), true);
  } finally {
    await database.close();
  }
});
Test.serial('isInstalled() returns false when uninstalled', async test => {
  let database = LoggedMigration.createDatabase(ConfigurationName, ConfigurationPath);
  await database.open();

  try {
    await new LoggedCreateCollectionMigration(database).install();
    await new LoggedCreateIndexMigrationByName(database).install();
    await new LoggedCreateIndexMigrationByNameIsInstalled(database).install();
    let migration = new LoggedMigration(Path.normalize(`${FolderPath}/../../library/migration/does-not-exist.js`), database);
    await migration.install();
    await migration.uninstall();
    test.is(await migration.isInstalled(), false);
  } finally {
    await database.close();
  }
});
Test.serial('isInstalled() throws Error', async test => {
  let database = LoggedMigration.createDatabase(ConfigurationName, ConfigurationPath);
  let isMigrationInstalledStub = Sinon.stub(database, 'isMigrationInstalled').rejects(new Error());

  try {
    await database.open();

    try {
      await new LoggedCreateCollectionMigration(database).install();
      await new LoggedCreateIndexMigrationByName(database).install();
      await new LoggedCreateIndexMigrationByNameIsInstalled(database).install();
      await test.throwsAsync(new LoggedMigration(Path.normalize(`${FolderPath}/../../library/migration/does-not-exist.js`), database).isInstalled(), {
        'instanceOf': Error
      });
    } finally {
      await database.close();
    }
  } finally {
    isMigrationInstalledStub.restore();
  }
});
Test.serial('install()', async test => {
  let database = LoggedMigration.createDatabase(ConfigurationName, ConfigurationPath);
  await database.open();

  try {
    await new LoggedCreateCollectionMigration(database).install();
    await new LoggedCreateIndexMigrationByName(database).install();
    await new LoggedCreateIndexMigrationByNameIsInstalled(database).install();
    let migration = new LoggedMigration(Path.normalize(`${FolderPath}/../../library/migration/does-not-exist.js`), database);
    await test.notThrowsAsync(migration.install());
  } finally {
    await database.close();
  }
});
Test.serial('uninstall()', async test => {
  let database = LoggedMigration.createDatabase(ConfigurationName, ConfigurationPath);
  await database.open();

  try {
    await new LoggedCreateCollectionMigration(database).install();
    await new LoggedCreateIndexMigrationByName(database).install();
    await new LoggedCreateIndexMigrationByNameIsInstalled(database).install();
    let migration = new LoggedMigration(Path.normalize(`${FolderPath}/../../library/migration/does-not-exist.js`), database);
    await migration.install();
    await test.notThrowsAsync(migration.uninstall());
  } finally {
    await database.close();
  }
});
Test.serial('getMigration(default, default, \'...\', \'...\')', async test => {
  let migration = await LoggedMigration.getMigration(Migration.defaultFrom, Migration.defaultTo, ConfigurationName, ConfigurationPath);
  test.is(migration.length, 3);
  test.is(migration[0].name, '1638502987605-create-collection-migration');
  test.is(await migration[0].isInstalled(), false);
  test.is(migration[1].name, '1638503015379-create-index-migration-by-name');
  test.is(await migration[1].isInstalled(), false);
  test.is(migration[2].name, '1638503040026-create-index-migration-by-name-is-installed');
  test.is(await migration[2].isInstalled(), false);
});
Test.serial('getMigration(default, default, ...)', async test => {
  let database = LoggedMigration.createDatabase(ConfigurationName, ConfigurationPath);
  await database.open();

  try {
    let migration = await LoggedMigration.getMigration(Migration.defaultFrom, Migration.defaultTo, database);
    test.is(migration.length, 3);
    test.is(migration[0].name, '1638502987605-create-collection-migration');
    test.is(await migration[0].isInstalled(), false);
    test.is(migration[1].name, '1638503015379-create-index-migration-by-name');
    test.is(await migration[1].isInstalled(), false);
    test.is(migration[2].name, '1638503040026-create-index-migration-by-name-is-installed');
    test.is(await migration[2].isInstalled(), false);
  } finally {
    await database.close();
  }
});
Test.serial('installMigration(default, default, \'...\', \'...\')', async test => {
  await LoggedMigration.installMigration(Migration.defaultFrom, Migration.defaultTo, ConfigurationName, ConfigurationPath);
  let migration = await LoggedMigration.getMigration(Migration.defaultFrom, Migration.defaultTo, ConfigurationName, ConfigurationPath);
  test.is(migration.length, 3);
  test.is(migration[0].name, '1638502987605-create-collection-migration');
  test.is(await migration[0].isInstalled(), true);
  test.is(migration[1].name, '1638503015379-create-index-migration-by-name');
  test.is(await migration[1].isInstalled(), true);
  test.is(migration[2].name, '1638503040026-create-index-migration-by-name-is-installed');
  test.is(await migration[2].isInstalled(), true);
});
Test.serial('installMigration(default, default, ...)', async test => {
  let database = LoggedMigration.createDatabase(ConfigurationName, ConfigurationPath);
  await database.open();

  try {
    await LoggedMigration.installMigration(Migration.defaultFrom, Migration.defaultTo, database);
    let migration = await LoggedMigration.getMigration(Migration.defaultFrom, Migration.defaultTo, database);
    test.is(migration.length, 3);
    test.is(migration[0].name, '1638502987605-create-collection-migration');
    test.is(await migration[0].isInstalled(), true);
    test.is(migration[1].name, '1638503015379-create-index-migration-by-name');
    test.is(await migration[1].isInstalled(), true);
    test.is(migration[2].name, '1638503040026-create-index-migration-by-name-is-installed');
    test.is(await migration[2].isInstalled(), true);
  } finally {
    await database.close();
  }
});
Test.serial('uninstallMigration(default, default, \'...\', \'...\')', async test => {
  await LoggedMigration.installMigration(Migration.defaultFrom, Migration.defaultTo, ConfigurationName, ConfigurationPath);
  await LoggedMigration.uninstallMigration(Migration.defaultFrom, Migration.defaultTo, ConfigurationName, ConfigurationPath);
  let migration = await LoggedMigration.getMigration(Migration.defaultFrom, Migration.defaultTo, ConfigurationName, ConfigurationPath);
  test.is(migration.length, 3);
  test.is(migration[0].name, '1638502987605-create-collection-migration');
  test.is(await migration[0].isInstalled(), false);
  test.is(migration[1].name, '1638503015379-create-index-migration-by-name');
  test.is(await migration[1].isInstalled(), false);
  test.is(migration[2].name, '1638503040026-create-index-migration-by-name-is-installed');
  test.is(await migration[2].isInstalled(), false);
});
Test.serial('uninstallMigration(default, default, ...)', async test => {
  let database = LoggedMigration.createDatabase(ConfigurationName, ConfigurationPath);
  await database.open();

  try {
    await LoggedMigration.installMigration(Migration.defaultFrom, Migration.defaultTo, database);
    await LoggedMigration.uninstallMigration(Migration.defaultFrom, Migration.defaultTo, database);
    let migration = await LoggedMigration.getMigration(Migration.defaultFrom, Migration.defaultTo, database);
    test.is(migration.length, 3);
    test.is(migration[0].name, '1638502987605-create-collection-migration');
    test.is(await migration[0].isInstalled(), false);
    test.is(migration[1].name, '1638503015379-create-index-migration-by-name');
    test.is(await migration[1].isInstalled(), false);
    test.is(migration[2].name, '1638503040026-create-index-migration-by-name-is-installed');
    test.is(await migration[2].isInstalled(), false);
  } finally {
    await database.close();
  }
});

//# sourceMappingURL=migration.test.js.map