const path = require('path');
const starProcess = require("./runProcess");
const generatePdf = require("./generatePdf");
const {log} = require("./fs");

let runProcess = null;

const ROUTER_DOWNLOAD_BLOB = process.env.ROUTER_DOWNLOAD_BLOB || '/home/andresagudelo/Documentos/OCTAVEproyects/PATOLOGIAS/enProceso';
const ROUTER_UPLOAD_DB_DATOS = process.env.ROUTER_UPLOAD_DB_DATOS;

//singlenton de intancia de funcion para proceso de consola
if(!runProcess){
  runProcess = starProcess();
}


const uploadToDBToDatos = (pathPaciente, pathLog) => {
    var command = `cd ${ROUTER_UPLOAD_DB_DATOS}; python ./uploadToDBfromCSV.py '${path.dirname(pathPaciente.dir)}'`;
    runProcess(command).then(data =>{
      var date = new Date();
      log(`${ROUTER_DOWNLOAD_BLOB}/${pathLog}`, `Subiendo datos del paciente subidos a la base de datos... ${pathPaciente.dir} \n Generando pdf ... ${date}`).then(data=>{
          console.log(data);
      });
      generatePdf(pathPaciente, pathLog);
    }).catch(err =>{  
      var date = new Date();
      log(`${ROUTER_DOWNLOAD_BLOB}/${pathLog}`, 'Error al subir datos del paciente a base de datos ...'+err+" "+ date).then(data=>{
          console.log(data);
        });
        console.log(err);
    });
}



module.exports = uploadToDBToDatos;