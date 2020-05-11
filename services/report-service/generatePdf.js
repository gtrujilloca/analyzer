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
       `cd ${ROUTER_GENERATE_PDF}; export QT_QPA_FONTDIR=/usr/share/fonts/type1/gsfonts/; ./qt_pdf_prueba '${ruta[ruta.length - 2]}' '${ruta[ruta.length - 1]}' '${pathPaciente.dir}' -platform offscreen`;
       spinner.succeed(`${chalk.blue(command)}`)
      return runProcess(command);
    }).then(dataRunCommand => {
      if(dataRunCommand.code === 0){
        let date = new Date();
        return log(`${ROUTER_DOWNLOAD_BLOB}/${pathLog}`, `generando PDF ... ${pathPaciente.dir} ${date}`);
      }else{
        spinner.fail(`${chalk.red('Error al generar PDF')}`);
        return;
      }
    }).then(dataLog => {
      return veryPdf(pathPaciente.dir, `${ruta[ruta.length - 1]}.pdf`);
    }).then(async resVeryPdf => {
      let date = new Date();
      if(resVeryPdf){
        await log(`${ROUTER_DOWNLOAD_BLOB}/${pathLog}`, `PDF Generado ... ${date} => OK`);
        await log(`${ROUTER_DOWNLOAD_BLOB}/${pathLog}`, `Subiendo archivos al servidor ...${date} => OK`);
        searchFilesPro(pathPaciente, pathLog);
        spinner.succeed(`${chalk.green(`PDF Generado`)}`)
      }else{
        await log(`${ROUTER_DOWNLOAD_BLOB}/${pathLog}`, `PDF no generado ... ${date} => Error`);
        spinner.fail(`${chalk.red(`PDF no Generado ${resVeryPdf}`)}`)
      }
      
    }).catch(err => {
      let date = new Date();
      log(`${ROUTER_DOWNLOAD_BLOB}/${pathLog}`, `Error al genrar PDF... ${date} ${err} => ERROR`).then(data=>{
        });
      console.log(err)
    });
}

const veryPdf = (pathFile, nameFile) => {
  return new Promise((resolve, reject) => {
    spinner.text= `${chalk.yellow('Verificando creacion de PDF')}`
    let vecesVerificadas = 0;
    const verifyPdf = setInterval(() => {
      fs.readdir(pathFile, (err, files) => {
        if (err) reject(err);
        
        if (files.indexOf(nameFile) > -1) {
          spinner.succeed(`${chalk.red(`Verificacion finalizada`)}`)
          clearInterval(verifyPdf);
          resolve(true);
        }

        if(vecesVerificadas === 5){
          spinner.succeed(`${chalk.red(`Verificacion finalizada`)}`)
          resolve(false);
        }

        vecesVerificadas++;

      });
    }, 5000);
  });
}

module.exports = generatePdf;
