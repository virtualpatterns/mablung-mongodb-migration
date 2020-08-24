import '@virtualpatterns/mablung-source-map-support/install'
import MongoDB from 'mongodb'

const { MongoClient } = MongoDB

async function main() {

  try {

    let client = await MongoClient.connect('mongodb://localhost:27017')
    let database = client.db('test')

    try {

      let migration = database.collection('migration')
      let data = await migration.findOne({ 'name': 'bobo', 'installed': { $ne: null }, 'uninstalled': null })
  
      console.dir(data, { 'depth': null })

    } finally {
      await client.close()
    }

  } catch (error) {
    console.error(error)
  }

}

main()