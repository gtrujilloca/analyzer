// const chalk = require('chalk');
const fs = require('fs');
const azure = require('./azure-service/azure');
const Ora = require('ora');
const chalk = require('chalk');
const spinner = new Ora();


async function initAutomator() {
  try {
    spinner.start();
    spinner.text= `${chalk.red('Conectando a Azure ...')}`
    await azure.initServiceClient();
    spinner.succeed(`${chalk.yellow('Conectado con Azure ...')}`);
    await azure.searchJsonBlob();
    spinner.succeed(`${chalk.green('Busqueda Finalizada')}`);
  } catch (error) {
    //spinner.failed(`${chalk.red(error)}`);
  }
}
//V013GDAURA

module.exports = initAutomator;
