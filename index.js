const express = require('express');
const app = express();
const cron = require('node-cron');
const {log} = require('./services/fs');

const { config } = require('./config/index');
const hospitalesApi = require('./routes/hospitales.js');
const extname = require('path');
//libreria de path
const searchFilesOscann = require('./services/oscann_files.js');

const ROUTER_DOWNLOAD_BLOB = process.env.ROUTER_DOWNLOAD_BLOB || '/home/andresagudelo/Documentos/OCTAVEproyects/PATOLOGIAS/enProceso';


//const path = '/home/andresagudelo/Documentos/OCTAVEproyects/PATOLOGIAS/entradas';
const path = '/home/andresagudelo/Documentos/OCTAVEproyects/PATOLOGIAS/entradas';
const path1 = '/home/andresagudelo/Documentos/OCTAVEproyects/PATOLOGIAS/enProceso/HUCV/patologia_PruebaAzure2/PruebaAzure2/PruebaAzure2.json';
const runAutomator = require('./services/runAutomator');
const searchFilesRunOctave = require('./services/runoctave');
//const {ListBlob} = require('./services/azure');


try {
      cron.schedule('  */5 * * * *', () => {
            console.log('Searching Blobs in Azure ...');
            console.time();
             runAutomator().then(() => {
             //searchFilesOscann(path);
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
