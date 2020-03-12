const path = require('path');
//clase para correr funciines de comando bash
const starProcess = require("./runProcess");
//llamo fenerar pdf
const generatePdf = require("./generatePdf");
//inicializo consola vacia para ejecutar comandos
const {log} = require("./fs");

let runProcess = null;

const ROUTER_DOWNLOAD_BLOB = process.env.ROUTER_DOWNLOAD_BLOB || '/home/andresagudelo/Documentos/OCTAVEproyects/PATOLOGIAS/enProceso';

//singlenton de intancia de funcion para proceso de consola
if(!runProcess){
  runProcess = starProcess();
}


function uploadToDBToDatos(pathPaciente, pathLog) {
    var command = "cd /home/andresagudelo/Documentos; python ./uploadToDBfromCSV.py '"+path.dirname(pathPaciente.dir)+"'";
    runProcess(command).then(data =>{
      var date = new Date();
      log(ROUTER_DOWNLOAD_BLOB+'/'+pathLog, 'Datos del paciente subidos a la base de datos correctamente... '+pathPaciente.dir+' \n Generando pdf ...'+ date).then(data=>{
          console.log(data);
      });
      generatePdf(pathPaciente, pathLog);
    }).catch(err =>{  
      var date = new Date();
      log(ROUTER_DOWNLOAD_BLOB+'/'+pathLog, 'Error al subir datos del paciente a base de datos ...'+err+" "+ date).then(data=>{
          console.log(data);
        });
        console.log(err);
    });
    //generateDocument(pathPaciente.dir, "db_datosPy" );  
}



module.exports = uploadToDBToDatos;