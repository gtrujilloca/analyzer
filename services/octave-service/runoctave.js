require('dotenv').config();
const fs = require('fs');
const extname = require('path');
const {clasificador} = require('../clasificadores-service/clasificadores');
const starProcess = require('../system-service/runProcess');
const { readFilee, createFile, deleteFile, log} = require('../system-service/fs');
let runProcess = null;
const logService = require('../log-service/log-service')

const Ora = require('ora');
const chalk = require('chalk');
const spinner = new Ora();
let estudioDiferenciales = {};
const { ROUTER_OCTAVE, ROUTER_DOWNLOAD_BLOB} = process.env;


//singlenton de intancia de funcion para proceso de consola
if (!runProcess) {
  runProcess = starProcess();
}

const verifyAnalysisTypesAI = (testJsonData) =>{
  return new Promise((resolve, reject) =>{
    let Analysis_types_for_AI_values = []
    try {
      if(!testJsonData) resolve({res:false, data: Analysis_types_for_AI_values});

      if(testJsonData.Analysis_types_for_AI["AD vs FTD"] === true){
        Analysis_types_for_AI_values.push(25)
      }
      if(testJsonData.Analysis_types_for_AI["AD vs MCI"] === true){
        Analysis_types_for_AI_values.push(29)
      }
      if(testJsonData.Analysis_types_for_AI["FTD vs MCI"] === true){
        Analysis_types_for_AI_values.push(59)
      }
      if(testJsonData.Analysis_types_for_AI["PD vs PKS"] === true){
        Analysis_types_for_AI_values.push(310)
      }
      if(Analysis_types_for_AI_values){
        resolve({res: true, data: Analysis_types_for_AI_values})
      }else{
        resolve({res: false, data: Analysis_types_for_AI_values})
      }

    } catch (error) {
      reject(error);
    }
  })
}



//Funcion muestra archivo que contiene una carpeta y explora sus hijos
const searchFilesRunOctave=(path, dataPaciente) =>{
  spinner.start();
  spinner.text= `${chalk.yellow('Iniciando servicio Octave')}`
  if (extname.extname(path) === '.json') {
    readFilee(path)
      .then(dataJson => {
        if (JSON.parse(dataJson).estado == 2) {
          verifyAnalysisTypesAI(JSON.parse(dataJson)).then(responseAnalysis =>{
            const pathPaciente = extname.parse(path);
            let commandOctave= "";
            estudioDiferenciales=responseAnalysis;
            console.log(estudioDiferenciales);
            if(responseAnalysis.res){
               commandOctave =`cd ${ROUTER_OCTAVE}; analyzer('${pathPaciente.dir}', [${JSON.parse(dataJson).Pathologies_Studied},${responseAnalysis.data}])`;
            }else{
               commandOctave =`cd ${ROUTER_OCTAVE}; analyzer('${pathPaciente.dir}', [${JSON.parse(dataJson).Pathologies_Studied}])`;
            }
            spinner.succeed(`${chalk.yellow(commandOctave)}`)
            createFile({ pathPaciente, commandOctave })
            .then(file => {
              spinner.text= `${chalk.blue('Ejecutando Octave en la carpeta del paciente')}`
              commandRunBashOctave =`octave-cli services/OctaveEjecutables/${pathPaciente.name}.sh`;
              return runProcess(commandRunBashOctave);
            })
            .then(res => {
              if(!res){
                if (res.code !== 0) {
                  logService({
                    label: dataPaciente.Label,
                     labelGlobal: dataPaciente.Label, 
                     accion:'Ejecutar Octave',
                     nombreProceso: 'Ejecucion octave paciente',
                     estadoProceso: 'Error',
                     codigoProceso: 22,
                     descripcion: `Error al ejecutar comando de octave`,
                     fecha: new Date()
                    });
                  return;
                }
              }
              return deleteFile(`services/OctaveEjecutables/${pathPaciente.name}.sh`);
            })
            .then(async file => {
              spinner.succeed(`${chalk.green('Proceso octave paciente finalizado')}`);
              searchFilesRunOctaveOld(path, dataPaciente);
            })
            .catch(err => {
              logService({
                label: dataPaciente.Label,
                 labelGlobal: dataPaciente.Label, 
                 accion:'Ejecutar Octave',
                 nombreProceso: 'Ejecucion octave paciente',
                 estadoProceso: 'Error',
                 codigoProceso: 23,
                 descripcion: `Error al ejecutar comando de octave ${err}`,
                 fecha: new Date()
                });
              console.log(`error Ejecutar ${err}`);
            });


          }).catch(err =>{
            logService({
              label: dataPaciente.Label,
               labelGlobal: dataPaciente.Label, 
               accion:'Ejecutar Octave',
               nombreProceso: 'Ejecucion octave paciente',
               estadoProceso: 'Error',
               codigoProceso: 24,
               descripcion: `Error al ejecutar comando de octave ${err}`,
               fecha: new Date()
              });
          })
        }
      })
      .catch(err => {
        logService({
          label: dataPaciente.Label,
           labelGlobal: dataPaciente.Label, 
           accion:'Ejecutar Octave',
           nombreProceso: 'Ejecucion octave paciente',
           estadoProceso: 'Error',
           codigoProceso: 25,
           descripcion: `Error al ejecutar comando de octave ${err}`,
           fecha: new Date()
          });
      });
  }
}

const searchFilesRunOctaveOld = (path, dataPaciente) => {
  spinner.text= `${chalk.yellow('Iniciando servicio Octave patologia')}`
          const pathPaciente = extname.parse(path);
          const commandOctave = `cd ${ROUTER_OCTAVE}; main_automatizado('${extname.dirname(pathPaciente.dir)}')`;
          spinner.succeed(`${chalk.yellow(commandOctave)}`);
          createFile({ pathPaciente, commandOctave })
            .then(file => {
              spinner.text= `${chalk.blue('Ejecutando Octave en la carpeta de la patologia')}`
              commandRunBashOctave =`octave-cli services/OctaveEjecutables/${pathPaciente.name}.sh`;
              return runProcess(commandRunBashOctave);
            })
            .then(res => {
              if(!res){
                if (res.code !== 0) {
                  logService({
                    label: dataPaciente.Label,
                     labelGlobal: dataPaciente.Label, 
                     accion:'Ejecutar Octave',
                     nombreProceso: 'Ejecucion octave patologia',
                     estadoProceso: 'Error',
                     codigoProceso: 26,
                     descripcion: `Error al ejecutar comando de octave en patologia ${err}`,
                     fecha: new Date()
                    });
                  return;
                }
              }
              return deleteFile(`services/OctaveEjecutables/${pathPaciente.name}.sh`);
            })
            .then(file => {
              logService({
                label: dataPaciente.Label,
                 labelGlobal: dataPaciente.Label, 
                 accion:'Ejecutar Octave',
                 nombreProceso: 'Ejecucion octave',
                 estadoProceso: 'OK',
                 codigoProceso: 200,
                 descripcion: `ejecucion de octave finalizado `,
                 fecha: new Date()
                });
              spinner.succeed(`${chalk.green('Proceso octave finalizado => OK')}`);
              clasificador(pathPaciente, dataPaciente, estudioDiferenciales);
               
            })
            .catch(err => {
              logService({
                label: dataPaciente.Label,
                 labelGlobal: dataPaciente.Label, 
                 accion:'Ejecutar Octave',
                 nombreProceso: 'Ejecucion octave patologia',
                 estadoProceso: 'Error',
                 codigoProceso: 27,
                 descripcion: `Error al ejecutar comando de octave en patologia ${err}`,
                 fecha: new Date()
                });
                console.log('error al ejecutar el proceso ' + err);
              });
}


module.exports = searchFilesRunOctave;