//funciones para manejor de archivos file system
const { readFilee, log } = require('./fs');
const fs = require('fs');
// Vamos a requerir del modulo que provee Node.js
const searchFilesPro = require('./filesFisnishProcess');
//const { searchFiles } = require("./azure");
//clase para correr funciines de comando bash
const starProcess = require('./runProcess');
//inicializo consola vacia para ejecutar comandos
let runProcess = null;

const ROUTER_DOWNLOAD_BLOB =
  process.env.ROUTER_DOWNLOAD_BLOB ||
  '/home/andresagudelo/Documentos/OCTAVEproyects/PATOLOGIAS/enProceso';

//singlenton de intancia de funcion para proceso de consola
if (!runProcess) {
  runProcess = starProcess();
}

function generatePdf(pathPaciente, pathLog) {
  let ruta = pathPaciente.dir.split('/');
  readFilee(pathPaciente.dir + '/' + pathPaciente.base)
    .then(data => {
      jsonpaciente = JSON.parse(data.toString());
      console.log(jsonpaciente);
      return grupoPaciente(jsonpaciente.Age);
    })
    .then(clasificacionEdad => {
      console.log(clasificacionEdad);
      var command =
        "cd /home/andresagudelo/Documentos/QTproyects/qt_pdf_prueba; ./qt_pdf_prueba '" +
        ruta[ruta.length - 2] +
        "' '" +
        ruta[ruta.length - 1] +
        "' '" +
        pathPaciente.dir +
        "'";
      console.log(command);
      return runProcess(command);
    })
    .then(data => {
      var date = new Date();
      log(
        ROUTER_DOWNLOAD_BLOB + '/' + pathLog,
        'PDF generado correctamente... '+pathPaciente.dir+' \n Subiendo a azure los resultados pdf ...' +
          date
      ).then(data => {
        console.log(data);
        return veryPdf(pathPaciente.dir, ruta[ruta.length - 1] + '.pdf');
      }).then(res => {
        searchFilesPro(pathPaciente);
        console.log('genere pdf' + data);
      }).catch(err=>{

      });
    });
}


function veryPdf(pathFile, nameFile) {
  return new Promise((resolve, reject) => {
    const verifyPdf = setInterval(() => {
      fs.readdir(pathFile, (err, files) => {
        //verifico que la ruta sea correcta y que no haya ningun error
        if (err) {
          console.log('error al buscar archivo');
          reject(err);
        }
        if (files.indexOf(nameFile) > -1) {
          //resuelvo true si si lo encuentro
          clearInterval(verifyPdf);
          resolve(true);
        }
      });
    }, 5000);
  });
}

const grupoPaciente = edad => {
  return new Promise((resolve, reject) => {
    console.log(edad);
    if (edad >= 18 && edad < 41) {
      resolve('A');
    } else {
      if (edad >= 41 && edad < 51) {
        resolve('B');
      } else {
        if (edad >= 51 && edad < 61) {
          resolve('C');
        } else {
          if (edad > 60) {
            resolve('D');
          }
        }
      }
    }
  });
};

module.exports = generatePdf;
