const path = require('path');
const starProcess = require("../system-service/runProcess");
//const generatePdf = require("../report-service/generatePdf");
//const {log} = require("../system-service/fs");

const Ora = require('ora');
const chalk = require('chalk');
const spinner = new Ora();

let runProcess = null;

//const ROUTER_UPLOAD_DB_DATOS='/Users/johnalexandergaleano/Documents/aura';
const { ROUTER_UPLOAD_DB_DATOS} = process.env;


//singlenton de intancia de funcion para proceso de consola
if(!runProcess){
  runProcess = starProcess();
}


const uploadToDBToDatos = (pathPaciente, pathLog) => {
  return new Promise ((resolve, reject) => {
    try {
      spinner.start();
      spinner.text= `${chalk.yellow('Subiendo a base de datos DATOS')}`
      var command = `cd ${ROUTER_UPLOAD_DB_DATOS}; python ./uploadToDBfromCSV.py '${path.dirname(pathPaciente.dir)}'`;
      //var command = `cd ${ROUTER_UPLOAD_DB_DATOS}; python ./uploadToDBfromCSV.py '${pathPaciente}'`;
      spinner.succeed(`${chalk.blue(command)}`);
      runProcess(command).then(data =>{
        console.log(data);
        //debugger;
       if(data){
         //generatePdf(pathPaciente, pathLog);
         resolve(true);
         spinner.succeed(`${chalk.green('Subida de datos a la BD DATOS finalizada ')}`);
       }else{
         resolve(false);
         spinner.fail(`${chalk.green('Error al subir Coleccion DATOS')}`)
       }
  
      }).catch(err =>{ 
        //debugger;
          console.log(err);
      });
    } catch (error) {
      debugger;
      reject(error);
    }
  })
}

//uploadToDBToDatos('/Users/johnalexandergaleano/Documents/aura/procesos/enProceso/HUCV/patologia_01080', '');

module.exports = uploadToDBToDatos;