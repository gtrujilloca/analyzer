const fs = require('fs');
const extname = require('path');
const {clasificador} = require('../clasificadores-service/clasificadores');
const starProcess = require('../system-service/runProcess');
const { readFilee, createFile, deleteFile, log} = require('../system-service/fs');
let runProcess = null;

const ROUTER_OCTAVE = process.env.ROUTER_OCTAVE ;
const ROUTER_DOWNLOAD_BLOB = process.env.ROUTER_DOWNLOAD_BLOB;

//singlenton de intancia de funcion para proceso de consola
if (!runProcess) {
  runProcess = starProcess();
}

//Funcion muestra archivo que contiene una carpeta y explora sus hijos
const searchFilesRunOctave=(path, pathLog) =>{
  console.log('Run Octave carpeta paciente');
  if (extname.extname(path) === '.json') {
    readFilee(path)
      .then(dataJson => {
        if (JSON.parse(dataJson).estado == 1) {
          const pathPaciente = extname.parse(path);
          const commandOctave =`cd ${ROUTER_OCTAVE}; analyzer('${pathPaciente.dir}', [${JSON.parse(dataJson).Pathologies_Studied }])`;
          createFile({ pathPaciente, commandOctave })
            .then(file => {
              commandRunBashOctave =`octave services/OctaveEjecutables/${pathPaciente.name}.sh`;
              return runProcess(commandRunBashOctave);
            })
            .then(res => {
              if (res.code !== 0) {
                let date = new Date();
                log(`${ROUTER_DOWNLOAD_BLOB}/${pathLog}`, `Error al ejecutar comando de Octave Sh... ${date}`).then(data=>{
                    console.log(data);
                    console.log('error Al ejecutar comando Sh');
                });
                return;
              }
              return deleteFile(`services/OctaveEjecutables/${pathPaciente.name}.sh`);
            })
            .then(file => {
              let date = new Date();
              log(`${ROUTER_DOWNLOAD_BLOB}/${pathLog}`, 'Ejecutando Octave... '+ date).then(data=>{
                  console.log(data);
                  searchFilesRunOctaveOld(path, pathLog);
                });
            })
            .catch(err => {
              console.log(`error al ejecutar el proceso Octave PATOLOGIA ${err}`);
            });
        }
      })
      .catch(err => {
        let date = new Date();
        log(`${ROUTER_DOWNLOAD_BLOB}/${pathLog}`, `Error al ejecutar Octave... ${err} ${date}`).then(data=>{
            console.log(data);
            console.log('error al ejecutar el proceso Octave PACIENTE' + err);
        });
      });
  }
}

const searchFilesRunOctaveOld = (path, pathLog) => {
  console.log('Run Octave carpeta patologia');
          const pathPaciente = extname.parse(path);
          const commandOctave = `cd ${ROUTER_OCTAVE}; main_automatizado('${extname.dirname(pathPaciente.dir)}')`;
          createFile({ pathPaciente, commandOctave })
            .then(file => {
              commandRunBashOctave =`octave services/OctaveEjecutables/${pathPaciente.name}.sh`;
              return runProcess(commandRunBashOctave);
            })
            .then(res => {
              return deleteFile(`services/OctaveEjecutables/${pathPaciente.name}.sh`);
            })
            .then(file => {
              let date = new Date();
              log(`${ROUTER_DOWNLOAD_BLOB}/${pathLog}`, `Proceso Octave Finalizado... ${pathPaciente.name} ${date}`).then(data=>{
                  console.log(data);
                });
                clasificador(pathPaciente, pathLog);
            })
            .catch(err => {
              let date = new Date();
              log(`${ROUTER_DOWNLOAD_BLOB}/${pathLog}`, 'Error al ejecutar Octave... '+err+" "+ date).then(data=>{
                  console.log(data);
                  console.log('error al ejecutar el proceso ' + err);
              });
            });
}


module.exports = searchFilesRunOctave;

