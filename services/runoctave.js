//libreria de file system
const fs = require('fs');
//libreria de path
const extname = require('path');
// Vamos a requerir del modulo que provee Node.js
const {clasificador} = require('./clasificadores');
//clase para correr funciines de comando bash
const starProcess = require('./runProcess');
//funciones system file para manejo de archivos
const { readFilee, createFile, deleteFile } = require('./fs');
let runProcess = null;

//singlenton de intancia de funcion para proceso de consola
if (!runProcess) {
  runProcess = starProcess();
}

//Funcion muestra archivo que contiene una carpeta y explora sus hijos
function searchFilesRunOctave(path) {
  console.log('searchFilesRunOctave');

  if (extname.extname(path) === '.json') {
    //console.log(path);
    readFilee(path)
      .then(dataJson => {
        if (JSON.parse(dataJson).estado == 1) {
          //asigno objeto de dir, name y ext a una var
          const pathPaciente = extname.parse(path);
          //llamo metodo para generar un docuemento
          const commandOctave =
            "cd /home/andresagudelo/Documentos/OCTAVEproyects/CodigoOctavePaciente; analyzer('" +
            pathPaciente.dir +
            "', [" +
            JSON.parse(dataJson).Pathologies_Studied +
            '])';
          createFile({ pathPaciente, commandOctave })
            .then(file => {
              commandRunBashOctave =
                'octave services/OctaveEjecutables/' +
                pathPaciente.name +
                '.sh';
              return runProcess(commandRunBashOctave);
            })
            .then(res => {
              //verifico la respuesta del proceso si se genero un error lo capturo en un archivo log
              if (res.code !== 0) {
                console.log('error proceso debo generar un archivo de logs');
                return;
              }
              //si no es porque creo lo archivos correctamente
              return deleteFile('services/OctaveEjecutables/'+pathPaciente.name+".sh");
            })
            .then(file => {
              searchFilesRunOctaveOld(path);
            })
            .catch(err => {
              console.log('error al ejecutar el proceso Octave PATOLOGIA' + err);
            });
        }
      })
      .catch(err => {
        console.log('error al ejecutar el proceso Octave PACIENTE' + err);
      });
  }
}

function searchFilesRunOctaveOld(path) {
  console.log('searchFilesRunOctaveOld');
          //asigno objeto de dir, name y ext a una var
          const pathPaciente = extname.parse(path);
          //console.log(pathPaciente.dir);
          //llamo metodo para generar un docuemento
          const commandOctave =
            "cd /home/andresagudelo/Documentos/OCTAVEproyects/CodigoOctavePaciente; main_automatizado('" +
            extname.dirname(pathPaciente.dir) +
            "')";
          createFile({ pathPaciente, commandOctave })
            .then(file => {
              commandRunBashOctave =
                'octave services/OctaveEjecutables/' +
                pathPaciente.name +
                '.sh';
              return runProcess(commandRunBashOctave);
            })
            .then(res => {
              //verifico la respuesta del proceso si se genero un error lo capturo en un archivo log
              // if (res.code !== 0) {
              //   console.log('error proceso debo generar un archivo de logs');
              //   return;
              // }
              //si no es porque creo lo archivos correctamente
              return deleteFile('services/OctaveEjecutables/'+pathPaciente.name+".sh");
            })
            .then(file => {
             console.log("termine octave old");
             clasificador(pathPaciente);
            })
            .catch(err => {
              console.log('error al ejecutar el proceso' + err);
            });
}


module.exports = searchFilesRunOctave;

