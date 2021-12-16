import { Console } from '@virtualpatterns/mablung-console'
import Is from '@pwn/is'

export function CreateLoggedDatabase(databaseClass, userLogPath, userLogOption = {}, userConsoleOption = {}) {

  class LoggedDatabase extends databaseClass {

    constructor(...argument) {
      super(...argument)
    }

    async open() {

      let count = await super.open()

      if (Is.equal(count, 1)) {

        let logPath = userLogPath
        let logOption = userLogOption

        let consoleOption = userConsoleOption

        this.console = new Console(logPath, logOption, consoleOption)
        
        // this.console.log('- Database#open() --------------------------------')
        // this.console.log()

        this.client.on('commandStarted', this.onCommandStartedHandler = (command) => {

          try {
            this.onCommandStarted(command)
          } catch (error) {
            // this.console.error('this.client.on(\'commandStarted\', this.onCommandStartedHandler = (command) => { ... })')
            this.console.error(error)
          }

        })

        this.client.on('commandSucceeded', this.onCommandSucceededHandler = (command) => {

          try {
            this.onCommandSucceeded(command)
          } catch (error) {
            // this.console.error('this.client.on(\'commandSucceeded\', this.onCommandSucceededHandler = (command) => { ... })')
            this.console.error(error)
          }

        })

        this.client.on('commandFailed', this.onCommandFailedHandler = (command) => {

          try {
            this.onCommandFailed(command)
          } catch (error) {
            // this.console.error('this.client.on(\'commandFailed\', this.onCommandFailedHandler = (command) => { ... })')
            this.console.error(error)
          }

        })

      }

      return count

    }

    onCommandStarted(command) {
      this.console.log(`${databaseClass.name}.onCommandStarted(command)`)
      if (command.command) { this.console.dir(command.command) }
    }

    onCommandSucceeded(command) {
      this.console.log(`${databaseClass.name}.onCommandSucceeded(command)`)
      if (command.reply) { this.console.dir(command.reply) }
    }

    onCommandFailed(command) {
      this.console.error(`${databaseClass.name}.onCommandFailed(command)`)
      if (command.failure) { this.console.dir(command.failure) }
    }

    async close() {

      let count = await super.close()

      if (Is.equal(count, 0)) {

        this.client.off('commandFailed', this.onCommandFailedHandler)
        delete this.onCommandFailedHandler

        this.client.off('commandSucceeded', this.onCommandSucceededHandler)
        delete this.onCommandSucceededHandler

        this.client.off('commandStarted', this.onCommandStartedHandler)
        delete this.onCommandStartedHandler

        // this.console.log('- Database#close() -------------------------------')
        // this.console.close()

      }

      return count

    }

  }

  return LoggedDatabase

}
