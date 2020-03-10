const express = require('express');
const app = express();
const cron = require('node-cron');
const fs = require('fs');

const { config } = require('./config/index');
const hospitalesApi = require('./routes/hospitales.js');

//libreria de path
const extname = require('path');
const runOctave = require('./services/runoctave.js');
const searchFilesOscann = require('./services/oscann_files.js');
const {searchFilesRunOctave, searchFilesRunOctaveOld} = require('./services/runoctave');


//const path = '/home/andresagudelo/Documentos/OCTAVEproyects/PATOLOGIAS/entradas';
const path = '/home/andresagudelo/Documentos/OCTAVEproyects/PATOLOGIAS/entradas';
const path1 = '/home/andresagudelo/Documentos/OCTAVEproyects/PATOLOGIAS/enProceso/HUCV/patologia_AlbertoCalvoElipe/PruebaAzure2/PruebaAzure2.json';
const {searchJsonBlob, veryBlob, deleteBlob} = require('./services/azure');
const generatePdf = require('./services/generatePdf');
const {upDateClasificadorJson} = require('./services/clasificadores')
const { copyFiles, deleteFolder,readFilee, log} = require('./services/fs');
const {updateJsonFiles} = require('./services/jsonEditFile');

// readFilee(path).then(data => {
//   console.log(data.toString());
//   console.log(extname.parse(path));
//   jsonpaciente = JSON.parse(data.toString());
//   upDateClasificadorJson(extname.parse(path), jsonpaciente).then(res=>{
//     console.log(res);
//     updateJsonFiles(path, res);
//   });
// }).catch(err =>{
//   console.log(err);
// });
//searchFilesOscann(path);
//log("/home/andresagudelo/Documentos/OCTAVEproyects/PATOLOGIAS/entradas/Hospital1/ControlesGrupoA/paciente_grupoA_20/logpaciente20.txt", "prueba1");

//searchFilesRunOctave(path);
//const pathPaciente = extname.parse(path);
//runOctave(path);
//generatePdf(pathPaciente);
//searchFilesRunOctaveOld(path);
console.time();
searchJsonBlob().then(() => {
  console.log('Done...');
  console.timeEnd();
});

//  app.listen(config.port, function(){
//      console.log(`Listening http://localhost:${config.port}`);
//  });
