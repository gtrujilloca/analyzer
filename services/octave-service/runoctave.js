const fs = require('fs');
const extname = require('path');
const {clasificador} = require('../clasificadores-service/clasificadores');
const starProcess = require('../system-service/runProcess');
const { readFilee, createFile, deleteFile, log} = require('../system-service/fs');
let runProcess = null;

const Ora = require('ora');
const chalk = require('chalk');
const spinner = new Ora();

const ROUTER_OCTAVE = process.env.ROUTER_OCTAVE ;
const ROUTER_DOWNLOAD_BLOB = process.env.ROUTER_DOWNLOAD_BLOB;

//singlenton de intancia de funcion para proceso de consola
if (!runProcess) {
  runProcess = starProcess();
}

const verifyAnalysisTypesAI = (testJsonData) =>{
  return new Promise((resolve, reject) =>{
    let Analysis_types_for_AI_values = []
    try {
      if(!testJsonData) resolve({res:false, data: Analysis_types_for_AI_values});

      if(testJsonData.Analysis_types_for_AI["AD vs FTD"]){
        Analysis_types_for_AI_values.push(25)
      }
      if(testJsonData.Analysis_types_for_AI["AD vs MCI"]){
        Analysis_types_for_AI_values.push(29)
      }
      if(testJsonData.Analysis_types_for_AI["FTD vs MCI"]){
        Analysis_types_for_AI_values.push(59)
      }
      if(testJsonData.Analysis_types_for_AI["PD vs PKS"]){
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
const searchFilesRunOctave=(path, pathLog) =>{
  spinner.start();
  spinner.text= `${chalk.yellow('Iniciando servicio Octave')}`
  if (extname.extname(path) === '.json') {
    readFilee(path)
      .then(dataJson => {
        if (JSON.parse(dataJson).estado == 1) {
          verifyAnalysisTypesAI(JSON.parse(dataJson)).then(responseAnalysis =>{
            const pathPaciente = extname.parse(path);
            let commandOctave= "";
            console.log(responseAnalysis.data);
            if(responseAnalysis.res){
               commandOctave =`cd ${ROUTER_OCTAVE}; analyzer('${pathPaciente.dir}', [${JSON.parse(dataJson).Pathologies_Studied},${responseAnalysis.data}])`;
            }else{
               commandOctave =`cd ${ROUTER_OCTAVE}; analyzer('${pathPaciente.dir}', [${JSON.parse(dataJson).Pathologies_Studied}])`;
            }
            console.log(commandOctave);
            createFile({ pathPaciente, commandOctave })
            .then(file => {
              console.log(file);
              commandRunBashOctave =`octave --no-gui services/OctaveEjecutables/${pathPaciente.name}.sh`;
              return runProcess(commandRunBashOctave);
            })
            .then(res => {
              console.log(res);
              if (res.code !== 0) {
                let date = new Date();
                log(`${ROUTER_DOWNLOAD_BLOB}/${pathLog}`, `Error al ejecutar comando de Octave Sh... ${date}`).then(data=>{
                    
                    console.log('error Al ejecutar comando Sh');
                });
                return;
              }
              
              return deleteFile(`services/OctaveEjecutables/${pathPaciente.name}.sh`);
            })
            .then(file => {
              console.log(file);
              let date = new Date();
              log(`${ROUTER_DOWNLOAD_BLOB}/${pathLog}`, 'Ejecutando Octave... '+ date).then(data=>{
                  spinner.succeed(`${chalk.green('Proceso octave paciente finalizado')}`);
                  searchFilesRunOctaveOld(path, pathLog);
                });
            })
            .catch(err => {
              console.log(`error eliminar ejecutable  ${err}`);
            });


          }).catch(err =>{

          })
        }
      })
      .catch(err => {
        let date = new Date();
        log(`${ROUTER_DOWNLOAD_BLOB}/${pathLog}`, `Error al leer archivo Json... ${err} ${date}`).then(data=>{
            console.log(data);
            console.log('error al ejecutar el proceso Octave PACIENTE' + err);
        });
      });
  }
}

const searchFilesRunOctaveOld = (path, pathLog) => {
  spinner.text= `${chalk.yellow('Iniciando servicio Octave patologia')}`
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
             
                });
                spinner.succeed(`${chalk.green('Proceso octave patologia finalizado')}`);
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

