const express = require('express');
const app = express();
const cron = require('node-cron');

const { config } = require('./config/index');
const hospitalesApi = require('./routes/hospitales.js');

//libreria de path
const extname = require('path');
const runOctave = require('./services/runoctave.js');
const searchFilesOscann = require('./services/oscann_files.js');
const {searchFilesRunOctave, searchFilesRunOctaveOld} = require('./services/runoctave');

//const path = '/home/andresagudelo/Documentos/OCTAVEproyects/PATOLOGIAS/entradas/Hospital1/ControlesGrupoA/paciente_grupoA_1/paciente_grupoA_1.json';
const path = '/home/andresagudelo/Documentos/OCTAVEproyects/PATOLOGIAS/entradas/Hospital1/ControlesGrupoA/Paciente_bueno/paciente_grupoA.json';
const {searchJsonBlob} = require('./services/azure');
const generatePdf = require('./services/generatePdf');


//searchFilesOscann(path);
//searchFilesRunOctave(path);
const pathPaciente = extname.parse(path);
//runOctave(path);
generatePdf(pathPaciente);
//searchFilesRunOctaveOld(path);
// console.time();
// searchJsonBlob().then(() => {
//   console.log('Done...');
//   console.timeEnd();
//});

//  app.listen(config.port, function(){
//      console.log(`Listening http://localhost:${config.port}`);
//  });
