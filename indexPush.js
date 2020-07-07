const express = require('express');
const { config } = require('./config/index');
const app = express();
const cron = require('node-cron');
const searchFilesOscann = require('./services/oscann_files.js');
const retryFileFailedUpload = require('./services/system-service/retryFileFailedUpload')

const Ora = require('ora');
const chalk = require('chalk');
const spinner = new Ora();

process.estadoServidor = false ;


try {  
  console.log(`${chalk.blue('Inicio Automator Este proceso se ejecutara cada minuto ...')}`);
  spinner.start();
      cron.schedule('  */30 * * * * *', () => {
        spinner.text= `${chalk.yellow('Buscando archivos para subir al servidor ...')}`
        if(!process.estadoServidor){
          searchFilesOscann();
          spinner.succeed(`${chalk.yellow('Busqueda finalizada...')}`);
        }
     });
} catch (error) {
  console.log("Tarea Detenida");
}
