const fs = require('fs');
const { readFilee, log } = require('../system-service/fs');
const searchFilesPro = require('../filesFisnishProcess');
const starProcess = require('../system-service/runProcess');

const ROUTER_DOWNLOAD_BLOB = process.env.ROUTER_DOWNLOAD_BLOB;
const ROUTER_GENERATE_PDF = process.env.ROUTER_GENERATE_PDF;

let runProcess = null;
//singlenton de intancia de funcion para proceso de consola
if (!runProcess) {
  runProcess = starProcess();
}

const generatePdf = (pathPaciente, pathLog) => {
  console.log('Iniciando servicio de generacon de PDF')
  let ruta = pathPaciente.dir.split('/');
  readFilee(`${pathPaciente.dir}/${pathPaciente.base}`)
    .then(data => {
      jsonpaciente = JSON.parse(data.toString());
      console.log(jsonpaciente);
      let command =
       `cd ${ROUTER_GENERATE_PDF}; ./qt_pdf_prueba '${ruta[ruta.length - 2]}' '${ruta[ruta.length - 1]}' '${pathPaciente.dir}'`;
        console.log(command);
      return runProcess(command);
    }).then(dataRunCommand => {
      let date = new Date();
      return log(`${ROUTER_DOWNLOAD_BLOB}/${pathLog}`, `PDF generado correctamente... ${pathPaciente.dir} \n Subiendo a azure los resultados pdf ... ${date}`);
    }).then(dataLog => {
      console.log(dataLog);
      return veryPdf(pathPaciente.dir, `${ruta[ruta.length - 1]}.pdf`);
    }).then(resVeryPdf => {
      console.log(resVeryPdf);
        searchFilesPro(pathPaciente, pathLog);
        console.log('genere pdf');
      
    }).catch(err => {console.log(err)});
}

const veryPdf = (pathFile, nameFile) => {
  console.log("verificando creacion del pdf...")
  return new Promise((resolve, reject) => {
    const verifyPdf = setInterval(() => {
      fs.readdir(pathFile, (err, files) => {
        if (err) reject(err);
        
        if (files.indexOf(nameFile) > -1) {
          //resuelvo true si si lo encuentro
          console.log("Pdf encontrado");
          clearInterval(verifyPdf);
          resolve(true);
        }
      });
    }, 5000);
  });
}

module.exports = generatePdf;
