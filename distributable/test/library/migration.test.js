import Test from 'ava';

import { Migration } from './migration.js';

Test.before(async test => {
  test.context.url = 'mongodb://localhost:27017';
  test.context.name = 'test-migration';
});

Test.serial('Migration.getMigration(url, name)', async test => {

  let migration = await Migration.getMigration(test.context.url, test.context.name);

  test.is(migration.length, 4);

  test.is(migration[0].name, '20200820234900-create-collection-migration');
  test.is(await migration[0].isInstalled(), false);
  test.is(migration[1].name, '20200820234901-create-index-migration-unique');
  test.is(await migration[1].isInstalled(), false);
  test.is(migration[2].name, '20200820234902-create-index-migration-find');
  test.is(await migration[2].isInstalled(), false);
  test.is(migration[3].name, '20200823213000-null');
  test.is(await migration[3].isInstalled(), false);

});

Test.serial('Migration.installMigration(url, name)', async test => {

  await Migration.installMigration(test.context.url, test.context.name);

  let migration = await Migration.getMigration(test.context.url, test.context.name);

  test.is(migration.length, 4);

  test.is(await migration[0].isInstalled(), true);
  test.is(await migration[1].isInstalled(), true);
  test.is(await migration[2].isInstalled(), true);
  test.is(await migration[3].isInstalled(), true);

});

Test.serial('Migration.uninstallMigration(url, name)', async test => {

  await Migration.uninstallMigration(test.context.url, test.context.name);

  let migration = await Migration.getMigration(test.context.url, test.context.name);

  test.is(migration.length, 4);

  test.is(await migration[0].isInstalled(), false);
  test.is(await migration[1].isInstalled(), false);
  test.is(await migration[2].isInstalled(), false);
  test.is(await migration[3].isInstalled(), false);

});
//# sourceMappingURL=migration.test.js.map