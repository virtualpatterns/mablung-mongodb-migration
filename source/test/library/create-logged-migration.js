
export function CreateLoggedMigration(migrationClass, databaseClass) {
    
  class LoggedMigration extends migrationClass {

    constructor(...argument) {
      super(...argument)
    }

    static createDatabase(...argument) { // argument is [ name, path ]
      return new databaseClass(...this.getDatabaseConfiguration(...argument))
    }

  }

  return LoggedMigration

}
