const express = require('express');
const app = express();
const cron = require('node-cron');

const { config } = require('./config/index');
const hospitalesApi = require('./routes/hospitales.js');

const runOctave = require('./services/runoctave.js');
const searchFilesOscann = require('./services/oscann_files.js');
const searchFilesRunOctave = require('./services/runoctave');

const path = '/home/andresagudelo/Documentos/OCTAVEproyects/PATOLOGIAS/enProceso/HUCV/paciente_grupoA_1/paciente_grupoA_1.json';
const {searchJsonBlob} = require('./services/azure');

//searchFilesOscann(path);
//searchFilesRunOctave(path);
console.time();
searchJsonBlob().then(() => {
  console.log('Done...');
  console.timeEnd();
});

//  app.listen(config.port, function(){
//      console.log(`Listening http://localhost:${config.port}`);
//  });
