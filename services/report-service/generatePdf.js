require('dotenv').config();
const fs = require('fs');
const { readFilee, log } = require('../system-service/fs');
const searchFilesPro = require('../filesFisnishProcess');
const starProcess = require('../system-service/runProcess');
const logService = require('../log-service/log-service')

const Ora = require('ora');
const chalk = require('chalk');
const spinner = new Ora();

const {ROUTER_DOWNLOAD_BLOB, ROUTER_GENERATE_PDF} = process.env;


let runProcess = null;
//singlenton de intancia de funcion para proceso de consola
if (!runProcess) {
  runProcess = starProcess();
}

const generatePdf = (pathPaciente, dataPaciente) => {
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
        return veryPdf(pathPaciente.dir, `${ruta[ruta.length - 1]}.pdf`);
      }else{
        spinner.fail(`${chalk.red('Error al generar PDF')}`);
        return;
      }
      }).then(async resVeryPdf => {
      let date = new Date();
      if(resVeryPdf){
        logService({
          label: dataPaciente.Label,
           labelGlobal:dataPaciente.Label, 
           accion:'Generacion de PDF',
           nombreProceso: 'Generacion de resultados en PDF',
           estadoProceso: 'OK',
           codigoProceso: 200,
           descripcion: `Generacion de PDF correctamente`,
           fecha: new Date()
          });
        searchFilesPro(pathPaciente, dataPaciente);
        spinner.succeed(`${chalk.green(`PDF Generado`)}`)
      }else{
        logService({
          label: dataPaciente.Label,
           labelGlobal:dataPaciente.Label, 
           accion:'Generacion de PDF',
           nombreProceso: 'Generacion de resultados en PDF',
           estadoProceso: 'ERROR',
           codigoProceso: 61,
           descripcion: `PDF no generado`,
           fecha: new Date()
          });
        spinner.fail(`${chalk.red(`PDF no Generado ${resVeryPdf}`)}`)
      }
      
    }).catch(err => {
      logService({
        label: dataPaciente.Label,
         labelGlobal:dataPaciente.Label, 
         accion:'Generacion de PDF',
         nombreProceso: 'Generacion de resultados en PDF',
         estadoProceso: 'ERROR',
         codigoProceso: 61,
         descripcion: `Error al generar pdf ${err}`,
         fecha: new Date()
        });
      console.log(err)
    });
}

const veryPdf = (pathFile, nameFile) => {
  return new Promise((resolve, reject) => {
    spinner.text= `${chalk.yellow('Verificando creacion de PDF')}`
    let vecesVerificadas = 0;
    const verifyPdf = setInterval(() => {
      fs.exists(`${pathFile}/${nameFile}`,function(exists){
        if(exists){
          spinner.succeed(`${chalk.red(`Verificacion finalizada`)}`)
          clearInterval(verifyPdf);
          resolve(true);
        }else{
          vecesVerificadas++;
          if(vecesVerificadas>5){
            spinner.fail(`${chalk.red(`files ${files}`)}`);
            clearInterval(verifyPdf);
            resolve(false);
          }
        }
      });
    }, 4000);
  });
}

module.exports = generatePdf;
