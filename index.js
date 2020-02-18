const express = require('express');
const app = express();
const cron = require('node-cron');

const { config } = require ('./config/index');
const hospitalesApi = require('./routes/hospitales.js');

const searchFiles = require('./services/runoctave.js');

const path = "/home/andresagudelo/Documentos/OCTAVEproyects/PATOLOGIAS";


//falta instalar modulo node-cron
//cron.schedule('*/30 * * * * *', () => {
    //console.log('Verifico Archivos');
    searchFiles(path);
  //});
  


//hospitalesApi(app);


 app.listen(config.port, function(){
     console.log(`Listening http://localhost:${config.port}`);
 });

