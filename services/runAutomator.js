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
    spinner.text= `${chalk.yellow('Buscando Blobs in Azure ...')}`
    await azure.searchJsonBlob();
    spinner.succeed(`${chalk.green('Busqueda Finalizada')}`);
  } catch (error) {
    //spinner.failed(`${chalk.red(error)}`);
  }
}


module.exports = initAutomator;
