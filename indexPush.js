const express = require('express');
const { config } = require('./config/index');
const app = express();
const cron = require('node-cron');

const { downloadPdf , ListPdf} = require('./services/azure');
const searchFilesOscann = require('./services/oscann_files.js');
const hospitalesApi = require('./routes/hospitales.js');
const azureApi = require('./routes/azure');


const pathEntrada = process.env.ROUTER_ENTRY_FILE || '/home/andresagudelo/Documentos/OCTAVEproyects/PATOLOGIAS/entradas';




try {
  console.log('Inicio Automator Este proceso se ejecutara cada 2 minutos ...');
      cron.schedule('  */2 * * * *', () => {
            console.log('Searching Blobs in Azure ...');
            searchFilesOscann(pathEntrada);
            //  downloadPdf("HUCV","01081");
            //  ListPdf();
     });
} catch (error) {
  console.log("Tarea Detenida");
}


// azureApi(app);

//  app.listen(config.port, function(){
//      console.log(`Listening http://localhost:${config.port}`);
//  });
