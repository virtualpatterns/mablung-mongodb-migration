import '@virtualpatterns/mablung-source-map-support/install'

import { Database, Migration } from '../index.js'

async function main() {

  try {

    let url = 'mongodb://localhost:27017'
    let name = 'sandbox'
  
    await Migration.installMigration(url, name)

    let database = new Database(url, name)
  
    await database.open()

    // await database.dropIndexMigration()

    // for (let index = 0; index < 100; index++) {
    //   await database.installMigration(`migration-${index}`)
    // }
  
    try {
  
      // console.log(await database.isMigrationInstalled('migration-50'))
      let explanation = await database.explainIndexMigration('migration-50')
      let winningPlan = explanation.queryPlanner.winningPlan
  
      console.dir(winningPlan, { 'depth': null })
  
    } finally {
      await database.close()
    }
  
  } catch (error) {
    console.error(error)
  }

}

main()