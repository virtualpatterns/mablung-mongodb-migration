import Test from 'ava';

import { Database } from '../../index.js';
import { Migration } from './migration.js';

Test('Migration.getMigration(url, name)', async test => {

  let url = 'mongodb://localhost:27017';
  let name = 'getMigration';

  let migration = await Migration.getMigration(url, name);

  test.is(migration.length, 3);

  test.is(migration[0].name, '20200820234900-create-collection-migration');
  test.is(await migration[0].isInstalled(), false);
  test.is(migration[1].name, '20200820234901-create-index-migration');
  test.is(await migration[1].isInstalled(), false);
  test.is(migration[2].name, '20200823213000-null');
  test.is(await migration[2].isInstalled(), false);

});

Test('Migration.installMigration(url, name)', async test => {

  let url = 'mongodb://localhost:27017';
  let name = 'installMigration';

  await Migration.installMigration(url, name);

  try {

    let migration = await Migration.getMigration(url, name);

    test.is(migration.length, 3);

    test.is(await migration[0].isInstalled(), true);
    test.is(await migration[1].isInstalled(), true);
    test.is(await migration[2].isInstalled(), true);

  } finally {
    await Migration.uninstallMigration(url, name);
  }

});

Test('Migration.uninstallMigration(url, name)', async test => {

  let url = 'mongodb://localhost:27017';
  let name = 'uninstallMigration';

  await Migration.installMigration(url, name);
  await Migration.uninstallMigration(url, name);

  let migration = await Migration.getMigration(url, name);

  test.is(migration.length, 3);

  test.is(await migration[0].isInstalled(), false);
  test.is(await migration[1].isInstalled(), false);
  test.is(await migration[2].isInstalled(), false);

});

Test('migrationIndex', async test => {

  let url = 'mongodb://localhost:27017';
  let name = 'migrationIndex';

  await Migration.installMigration(url, name);

  try {

    let database = new Database(url, name);

    await database.open();

    try {

      let explanation = await database.explainIndexMigration('migrationIndex');
      let winningPlan = explanation.queryPlanner.winningPlan;

      test.log(winningPlan);
      test.is(winningPlan.stage, 'FETCH');
      test.is(winningPlan.inputStage.stage, 'IXSCAN');
      test.is(winningPlan.inputStage.indexName, 'migrationIndex');

    } finally {
      await database.close();
    }

  } finally {
    await Migration.uninstallMigration(url, name);
  }

});
//# sourceMappingURL=migration.test.js.map