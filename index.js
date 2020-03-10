const express = require('express');
const app = express();
const cron = require('node-cron');

const { config } = require('./config/index');
const hospitalesApi = require('./routes/hospitales.js');
const extname = require('path');
//libreria de path
const searchFilesOscann = require('./services/oscann_files.js');


//const path = '/home/andresagudelo/Documentos/OCTAVEproyects/PATOLOGIAS/entradas';
const path = '/home/andresagudelo/Documentos/OCTAVEproyects/PATOLOGIAS/entradas';
const path1 = '/home/andresagudelo/Documentos/OCTAVEproyects/PATOLOGIAS/enProceso/HUCV/patologia_AlbertoCalvoElipe/PruebaAzure2/PruebaAzure2.json';
const {searchJsonBlob} = require('./services/azure');
const filesFisnishProcess = require('./services/filesFisnishProcess');


// const generatePdf = require('./services/generatePdf');
// const {upDateClasificadorJson} = require('./services/clasificadores')
// const { copyFiles, deleteFolder,readFilee, log} = require('./services/fs');
// const {updateJsonFiles} = require('./services/jsonEditFile');

filesFisnishProcess(extname.parse(path1));

//searchFilesOscann(path);
//log("/home/andresagudelo/Documentos/OCTAVEproyects/PATOLOGIAS/entradas/Hospital1/ControlesGrupoA/paciente_grupoA_20/logpaciente20.txt", "prueba1");

//searchFilesRunOctave(path);
//const pathPaciente = extname.parse(path);
//runOctave(path);
//generatePdf(pathPaciente);
//searchFilesRunOctaveOld(path);
// console.time();
// searchJsonBlob().then(() => {
//   console.log('Done...');
//   console.timeEnd();
// });

//  app.listen(config.port, function(){
//      console.log(`Listening http://localhost:${config.port}`);
//  });
