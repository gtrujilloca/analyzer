const config = require('./config/index');
const cron = require('node-cron');
const runAutomator = require('./services/runAutomator');
const Ora = require('ora');
const chalk = require('chalk');
const spinner = new Ora();

// const searchFilesRunOctave = require('./services/octave-service/runoctave');
// const ROUTER_DOWNLOAD_BLOB = process.env.ROUTER_DOWNLOAD_BLOB;
// const path = "/home/andresagudelo/Documentos/OCTAVEproyects/PATOLOGIAS/enProceso/HUCV/patologia_AURA219/paciente_AURA219";
// const jsonName = 'paciente_AURA219.json';
//forever start index.js  o nohup node index.js &
//forever list
//kill foreverNumber-hilo

try {
  console.log(`${chalk.blue('OSCANN ANALYZER Este proceso se ejecutara cada minuto ...')}`);
  spinner.start();
     //cron.schedule('  */1 * * * *', () => {
        spinner.succeed(`${chalk.blue('Buscando Blobs en Azure ...')}`)
            spinner.color = 'green';
              runAutomator();
              //searchFilesRunOctave(`${path}/${jsonName}`, path); 
      //});
} catch (error) {
              console.log("Tarea Detenida");
}

