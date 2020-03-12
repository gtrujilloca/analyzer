const express = require('express');
const app = express();
const cron = require('node-cron');
const {log} = require('./services/fs');



const { config } = require('./config/index');
const hospitalesApi = require('./routes/hospitales.js');
//libreria de path


const ROUTER_DOWNLOAD_BLOB = process.env.ROUTER_DOWNLOAD_BLOB || '/home/andresagudelo/Documentos/OCTAVEproyects/PATOLOGIAS/enProceso';

const runAutomator = require('./services/runAutomator');




try {
  console.log('Inicio Automator Este proceso se ejecutara cada 4 minutos ...');
      cron.schedule('  */4 * * * *', () => {
            console.log('Searching Blobs in Azure ...');
             runAutomator().then(() => {
                 const date = new Date();
                 console.log("Finish Search in Azure => "+ date);
                 log(ROUTER_DOWNLOAD_BLOB+'/logProcess.txt', 'Inicio Cron Buscar... => '+ date).then(data=>{
                  console.log(data);
                });
             });
     });
} catch (error) {
  console.log("Tarea Detenida");
}


//  app.listen(config.port, function(){
//      console.log(`Listening http://localhost:${config.port}`);
//  });
