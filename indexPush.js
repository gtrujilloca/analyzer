const express = require('express');
const { config } = require('./config/index');
const app = express();
const cron = require('node-cron');
const { downloadPdf , ListPdf} = require('./services/azure-service/azure');
const searchFilesOscann = require('./services/oscann_files.js');
const hospitalesApi = require('./routes/hospitales.js');
const azureApi = require('./routes/azure-routers/azure');
const Ora = require('ora');
const chalk = require('chalk');
const spinner = new Ora();

const pathEntrada = process.env.ROUTER_ENTRY_FILE;


try {  
  console.log(`${chalk.blue('Inicio Automator Este proceso se ejecutara cada 2 minutos ...')}`);
  spinner.start();
      //cron.schedule('  */2 * * * *', () => {
        spinner.text= `${chalk.yellow('Buscando archivos para subir al servidor ...')}`
          searchFilesOscann(pathEntrada);
          spinner.succeed(`${chalk.yellow('Busqueda finalizada...')}`);
     //});
} catch (error) {
  console.log("Tarea Detenida");
}


// azureApi(app);

//  app.listen(config.port, function(){
//      console.log(`Listening http://localhost:${config.port}`);
//  });
