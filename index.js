const express = require('express');
const app = express();
const cron = require('node-cron');
const {log} = require('./services/fs');

const { config } = require('./config/index');
const hospitalesApi = require('./routes/hospitales.js');
const extname = require('path');
//libreria de path
const searchFilesOscann = require('./services/oscann_files.js');


//const path = '/home/andresagudelo/Documentos/OCTAVEproyects/PATOLOGIAS/entradas';
const path = '/home/andresagudelo/Documentos/OCTAVEproyects/PATOLOGIAS/entradas';
const path1 = '/home/andresagudelo/Documentos/OCTAVEproyects/PATOLOGIAS/enProceso/HUCV/patologia_AlbertoCalvoElipe/PruebaAzure2/PruebaAzure2.json';
const runAutomator = require('./services/runAutomator');



// const generatePdf = require('./services/generatePdf');
// const {upDateClasificadorJson} = require('./services/clasificadores')
// const { copyFiles, deleteFolder,readFilee, log} = require('./services/fs');
// const {updateJsonFiles} = require('./services/jsonEditFile');

//filesFisnishProcess(extname.parse(path1));

// try {
//   cron.schedule(' */1 * * * *', () => {
//     console.log('Searching files ...');
// var ts = new Date();
     searchFilesOscann(path);
//     log("/home/andresagudelo/Documentos/OCTAVEproyects/PATOLOGIAS/entradas/logProcesoSubida.txt", "Seaching Files... "+ts.toDateString());
//   });
// } catch (error) {
//   console.log("Tarea Detenida");
//   log("/home/andresagudelo/Documentos/OCTAVEproyects/PATOLOGIAS/entradas/Hospital1/ControlesGrupoA/paciente_grupoA_20/logpaciente20.txt", "prueba1");
// }
// try {
    //   cron.schedule(' */30 * * * * *', () => {
        //     console.log('Searching Blobs in Azure ...');
        //     console.time();
    // runAutomator().then(() => {
        //      console.log("Process Pdf");
        //  });
        //     //log("/home/andresagudelo/Documentos/OCTAVEproyects/PATOLOGIAS/entradas/logProcesoSubida.txt", "Seaching Files... "+Date.now());
        //   });
// } catch (error) {
//   console.log("Tarea Detenida");
//   //log("/home/andresagudelo/Documentos/OCTAVEproyects/PATOLOGIAS/entradas/Hospital1/ControlesGrupoA/paciente_grupoA_20/logpaciente20.txt", "prueba1");
// }

//searchFilesRunOctave(path);
//const pathPaciente = extname.parse(path);
//runOctave(path);
//generatePdf(pathPaciente);
//searchFilesRunOctaveOld(path);


//  app.listen(config.port, function(){
//      console.log(`Listening http://localhost:${config.port}`);
//  });
