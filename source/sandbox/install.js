import '@virtualpatterns/mablung-source-map-support/install'

import { Database } from '../library/database.js'

async function main() {

  try {
 
    let database = new Database('mongodb://localhost:27017', 'test')
    
    await database.open()

    try {
      await database.installMigration('babo')
      console.log(await database.isMigrationInstalled('babo'))
    } finally {
      await database.close()
    }

  } catch (error) {
    console.error(error)
  }

}

main()