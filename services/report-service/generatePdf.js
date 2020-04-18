const fs = require('fs');
const { readFilee, log } = require('../system-service/fs');
const searchFilesPro = require('../filesFisnishProcess');
const starProcess = require('../system-service/runProcess');

const Ora = require('ora');
const chalk = require('chalk');
const spinner = new Ora();

const ROUTER_DOWNLOAD_BLOB = process.env.ROUTER_DOWNLOAD_BLOB;
const ROUTER_GENERATE_PDF = process.env.ROUTER_GENERATE_PDF;

let runProcess = null;
//singlenton de intancia de funcion para proceso de consola
if (!runProcess) {
  runProcess = starProcess();
}

const generatePdf = (pathPaciente, pathLog) => {
  spinner.start();
  spinner.text= `${chalk.yellow('Iniciando servicio de generacon de PDF')}`
  let ruta = pathPaciente.dir.split('/');
  readFilee(`${pathPaciente.dir}/${pathPaciente.base}`)
    .then(data => {
      jsonpaciente = JSON.parse(data.toString());
      let command =
       `cd ${ROUTER_GENERATE_PDF}; ./qt_pdf_prueba '${ruta[ruta.length - 2]}' '${ruta[ruta.length - 1]}' '${pathPaciente.dir}'`;
       spinner.succeed(`${chalk.blue(command)}`)
      return runProcess(command);
    }).then(dataRunCommand => {
      let date = new Date();
      return log(`${ROUTER_DOWNLOAD_BLOB}/${pathLog}`, `PDF generado correctamente... ${pathPaciente.dir} \n Subiendo a azure los resultados pdf ... ${date}`);
    }).then(dataLog => {
      return veryPdf(pathPaciente.dir, `${ruta[ruta.length - 1]}.pdf`);
    }).then(resVeryPdf => {
      searchFilesPro(pathPaciente, pathLog);
      spinner.succeed(`${chalk.green(`PDF Generado ${resVeryPdf}`)}`)
      
    }).catch(err => {console.log(err)});
}

const veryPdf = (pathFile, nameFile) => {
  spinner.text= `${chalk.yellow('Verificando creacion de PDF')}`
  return new Promise((resolve, reject) => {
    const verifyPdf = setInterval(() => {
      fs.readdir(pathFile, (err, files) => {
        if (err) reject(err);
        
        if (files.indexOf(nameFile) > -1) {
          clearInterval(verifyPdf);
          resolve(true);
        }
      });
    }, 5000);
  });
}

module.exports = generatePdf;
