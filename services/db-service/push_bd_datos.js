require('dotenv').config();
const path = require('path');
const starProcess = require("../system-service/runProcess");
const {log} = require("../system-service/fs");
const logService = require('../log-service/log-service')

const Ora = require('ora');
const chalk = require('chalk');
const spinner = new Ora();

let runProcess = null;

//const ROUTER_UPLOAD_DB_DATOS='/Users/johnalexandergaleano/Documents/aura';
const { ROUTER_UPLOAD_DB_DATOS, ROUTER_DOWNLOAD_BLOB} = process.env;


//singlenton de intancia de funcion para proceso de consola
if(!runProcess){
  runProcess = starProcess();
}


const uploadToDBToDatos = (pathPaciente, dataPaciente) => {
  return new Promise ((resolve, reject) => {
    try {
      let date = new Date();
      spinner.start();
      spinner.text= `${chalk.yellow('Subiendo a base de datos DATOS')}`
      var command = `cd ${ROUTER_UPLOAD_DB_DATOS}; python ./uploadToDBfromCSV.py '${path.dirname(pathPaciente.dir)}'`;
      spinner.succeed(`${chalk.blue(command)}`);
      runProcess(command).then(async data =>{
       if(data){
        logService({
          label: dataPaciente.Label,
           labelGlobal:dataPaciente.Label, 
           accion:'Subida a BD',
           nombreProceso: 'Subida de DATOS a BD',
           estadoProceso: 'OK',
           codigoProceso: 200,
           descripcion: `Subida de datos del paciente a BD correctamente`,
           fecha: new Date()
          });
         spinner.succeed(`${chalk.green('Subida de datos a la BD DATOS finalizada ')}`);
         resolve(true);
        }else{
          logService({
            label: dataPaciente.Label,
             labelGlobal: dataPaciente.Label, 
             accion:'Subida a BD',
             nombreProceso: 'Subida de TESTs a BD',
             estadoProceso: 'ERROR',
             codigoProceso: 51,
             descripcion: `Error TEST no subidos a BD `,
             fecha: new Date()
            });
          spinner.fail(`${chalk.green('Error al subir Coleccion DATOS')}`)
          resolve(false);
        }
      }).catch(err =>{ 
        logService({
          label: dataPaciente.Label,
           labelGlobal: dataPaciente.Label, 
           accion:'Subida a BD',
           nombreProceso: 'Subida de TESTs a BD',
           estadoProceso: 'ERROR',
           codigoProceso: 52,
           descripcion: `Error TEST no subidos a BD ${err}`,
           fecha: new Date()
          });
        console.log(err);
      });
    } catch (error) {
      logService({
        label: dataPaciente.Label,
         labelGlobal: dataPaciente.Label, 
         accion:'Subida a BD',
         nombreProceso: 'Subida de DATOS a BD',
         estadoProceso: 'ERROR',
         codigoProceso: 53,
         descripcion: `Error DATOS no subidos a BD ${error}`,
         fecha: new Date()
        });
      reject(error);
    }
  })
}


module.exports = uploadToDBToDatos;