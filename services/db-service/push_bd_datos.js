const path = require('path');
const starProcess = require("../system-service/runProcess");
const generatePdf = require("../report-service/generatePdf");
const {log} = require("../system-service/fs");

const Ora = require('ora');
const chalk = require('chalk');
const spinner = new Ora();

let runProcess = null;

const { ROUTER_UPLOAD_DB_DATOS} = process.env;


//singlenton de intancia de funcion para proceso de consola
if(!runProcess){
  runProcess = starProcess();
}


const uploadToDBToDatos = (pathPaciente, pathLog) => {
    spinner.start();
    spinner.text= `${chalk.yellow('Subiendo a base de datos DATOS')}`
    var command = `cd ${ROUTER_UPLOAD_DB_DATOS}; python ./uploadToDBfromCSV.py '${path.dirname(pathPaciente.dir)}'`;
    spinner.succeed(`${chalk.blue(command)}`);
    runProcess(command).then(data =>{
      spinner.succeed(`${chalk.green('Subida de datos a la BD DATOS finalizada ')}`);
      //generatePdf(pathPaciente, pathLog);
    }).catch(err =>{ 
        console.log(err);
    });
}

module.exports = uploadToDBToDatos;