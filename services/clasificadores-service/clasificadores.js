require('dotenv').config();
const starProcess = require("../system-service/runProcess");
const { readFilee, checkFiles, log } = require('../system-service/fs');
const { updateJsonFiles } = require('../system-service/jsonEditFile');
const { clasificadorDiferencial } = require('./clasificador-diferencial');
const push_DB_datos = require("../db-service/push_bd_datos");
const uploadToDBToTest = require("../db-service/push_bd_test");

const Ora = require('ora');
const chalk = require('chalk');
const spinner = new Ora();


const {ROUTER_DOWNLOAD_BLOB ,ROUTER_CLASIFICADORES } = process.env ;


let runProcess = null;
//singlenton de intancia de funcion para proceso de consola
if (!runProcess) {
  runProcess = starProcess();
}



const clasificador = (pathPaciente, pathLog, estudioDiferenciales) => {
  spinner.start();
  spinner.text= `${chalk.blue('Servicio de Clasificadores')}`
  let jsonpaciente = null;
  readFilee(`${pathPaciente.dir}/${pathPaciente.base}`).then(data => {
    jsonpaciente = JSON.parse(data.toString());
    callChecksStudies(pathPaciente, jsonpaciente, pathLog, estudioDiferenciales);
  }).catch(err => {
    let date = new Date();
    log(`${ROUTER_DOWNLOAD_BLOB}/${pathLog}`, `Error al llamar los clasificadores... ${date}`).then(data=>{
      });
      spinner.fail(`${chalk.red('Error',err)}`)
  });
}

const callChecksStudies = async (pathPaciente, paciente, pathLog, estudioDiferenciales) => {
  try {
    spinner.text= `${chalk.yellow('Verificando Pathologias a estudiadas')}`
    const checkList = await checkEstudies(pathPaciente, paciente, pathLog)
      await Promise.all(checkList);
    const res = await upDateClasificadorJson(pathPaciente, paciente);
    let date = new Date();
      await log(`${ROUTER_DOWNLOAD_BLOB}/${pathLog}`, `Clasificadores generados correctamente... ${paciente} => ${date}`);
      await updateJsonFiles(`${pathPaciente.dir}/${pathPaciente.base}`, res);
      spinner.succeed(`${chalk.green('Proceso de clasificacion terminada')}`);
      clasificadorDiferencial(pathPaciente, estudioDiferenciales, pathLog)
  } catch (error) {
    
  }
}

const checkEstudies = (pathPaciente, paciente, pathLog) => {
  //retorno una promesa donde voy a verificar si los archivos del casificador estan creados
  return new Promise((resolve, reject) => {
    try {
      spinner.text= `${chalk.yellow('Ejecutando Clasificadores')}`
      promesasArray = []; 
      const { Pathologies_Studied } = paciente;
      let addCheck = 0;
      Pathologies_Studied.forEach((pathology) => {
        switch (pathology) {
          case 1:
            spinner.text= `${chalk.blue('Sin especificar')}`;
            addCheck += 1;
            verifyPromises(addCheck, Pathologies_Studied.length, promesasArray, resolve);
            break;
          case 2:
            checkFiles(pathPaciente, "Estudio_AD.csv").then(res => {
              if (res) {
                return readFilee(`${pathPaciente.dir}/Estudio_AD.csv`);
              } else {
                console.log("Archivo Estudio AD no encontrado");
              }
            }).then((data) => {
              let commandClasificadorAD =
               `cd ${ROUTER_CLASIFICADORES}/Clasificador_EA_vs_control/src && ./main ${pathPaciente.dir} ${data.toString().replace(/,/g, " ")}`;
              promesasArray.push(runProcess(commandClasificadorAD));
              addCheck += 1;
              verifyPromises(addCheck, Pathologies_Studied.length, promesasArray, resolve);
            }).catch(err => {
              //console.log(err);
            });
            break;

          case 3:
            checkFiles(pathPaciente, "Estudio_PD.csv").then(res => {
              if (res) {
                return readFilee(pathPaciente.dir + "/Estudio_PD.csv");
              } else {
                console.log("Archivo Estudio Parkinson no encontrado");
              }
            }).then((data) => {
              let commandClasificadorPD = 
              `cd ${ROUTER_CLASIFICADORES}/Clasificador_Parkinson_vs_control/src && ./main ${pathPaciente.dir} ${data.toString().replace(/,/g, " ")}`;
              promesasArray.push(runProcess(commandClasificadorPD));
              addCheck += 1;
              verifyPromises(addCheck, Pathologies_Studied.length, promesasArray, resolve);
            }).catch(err => {
       
            });
            break;

          case 5:
            //'frontotemporal demental'
            checkFiles(pathPaciente, "Estudio_FTD.csv").then(res => {
              if (res) {
                return readFilee(pathPaciente.dir + "/Estudio_FTD.csv");
              } else {
                console.log("Archivo Estudio frontotemporal demental no encontrado");
              }
            }).then((data) => {
              let commandClasificadorAD = 
              `cd ${ROUTER_CLASIFICADORES}/Clasificador_DFT_vs_control/src && ./main ${pathPaciente.dir} ${data.toString().replace(/,/g, " ")}`;
              promesasArray.push(runProcess(commandClasificadorAD));
              addCheck += 1;
              verifyPromises(addCheck, Pathologies_Studied.length, promesasArray, resolve);    
            }).catch(err => {
              
            });
            break;

          case 9:
            //Mild Coginitive Imporment'
            checkFiles(pathPaciente, "Estudio_MCI.csv").then(res => {
              if (res) {
                return readFilee(pathPaciente.dir + "/Estudio_MCI.csv");
              } else {
                console.log("Archivo Estudio Mild Coginitive Imporment no encontrado");
              }
            }).then((data) => {
              let commandClasificadorAD = 
              `cd ${ROUTER_CLASIFICADORES}/Clasificador_DCL_vs_control/src && ./main ${pathPaciente.dir} ${data.toString().replace(/,/g, " ")}`;
              promesasArray.push(runProcess(commandClasificadorAD));
              addCheck += 1;
              verifyPromises(addCheck, Pathologies_Studied.length, promesasArray, resolve);
            }).catch(err => {
            
            });
            break;

          case 8:
            //Encefalopatia Hipatica Minima
            checkFiles(pathPaciente, "Estudio_MHE.csv").then(res => {
              if (res) {
                return readFilee(pathPaciente.dir + "/Estudio_MHE.csv");
              } else {
                console.log("Archivo Estudio Encefalopatia Hipatica Minima no encontrado");
              }
            }).then((data) => {
              let commandClasificadorAD = 
              `cd ${ROUTER_CLASIFICADORES}/Clasificador_EHM_vs_control/src && ./main ${pathPaciente.dir} ${data.toString().replace(/,/g, " ")}`;
              promesasArray.push(runProcess(commandClasificadorAD));
              addCheck += 1;
              verifyPromises(addCheck, Pathologies_Studied.length, promesasArray, resolve);
            }).catch(err => {

            });
            break;

          case 10:

            //parkinsonimos 
            checkFiles(pathPaciente, "Estudio_PKS.csv").then(res => {
              if (res) {
                return readFilee(pathPaciente.dir + "/Estudio_PKS.csv");
              } else {
                console.log("Archivo Estudio parkinsonimos no encontrado");
              }      
            }).then((data) => {
              let commandClasificadorAD = 
              `cd ${ROUTER_CLASIFICADORES}/Clasificador_Parkinsionismos_vs_control/src  && ./main ${pathPaciente.dir} ${data.toString().replace(/,/g, " ")}`;
              promesasArray.push(runProcess(commandClasificadorAD));
              addCheck += 1;
              verifyPromises(addCheck, Pathologies_Studied.length, promesasArray, resolve);
            }).catch(err => {
            });
            break;
          default:
            console.log('Sin especificar ' + pathology);
        }
      });
    } catch (error) {
      reject(eror);
    }
  });
}

const verifyPromises = (checks, pathologies, dataResolve, resolve) => {
  if (checks === pathologies) {
    spinner.succeed(`${chalk.green('Servicio clasificadores finalizado')}`);
    resolve(dataResolve);
  }
}



const upDateClasificadorJson = (pathPaciente, paciente) => {
  return new Promise((resolve, reject) => {
    try {
      spinner.text= `${chalk.yellow('Actualizando Json con clasificadores')}`
      promesasArray = [];
      let addCheck = 0;
      for (let pathology of paciente.Pathologies_Studied) {
        switch (pathology) {
          case 1:
            console.log('Sin especificar ' + pathology);
            addCheck += 1;
            break;

          case 2:
            checkFiles(pathPaciente, "Class_AD.csv").then(res => {
              if (res) {
                return readFilee(pathPaciente.dir + "/Class_AD.csv");
              } else {
                console.log("Archivo Estudio AD no encontrado");
                return -1;
              }
            }).then((data) => {           
              paciente.resultados_IA_demencias[0] = parseInt(data);
              addCheck += 1;
              verifyPromises(addCheck, paciente.Pathologies_Studied.length, paciente, resolve);
            }).catch(err => {
              console.log(err);
            });
            break;

          case 3:
            checkFiles(pathPaciente, "Class_Parkinson.csv").then(res => {
              if (res) {
                return readFilee(pathPaciente.dir + "/Class_Parkinson.csv");
              } else {
                console.log("Archivo Estudio Parkinson no encontrado");
                return -1;
              }
            }).then((data) => {
             
              paciente.resultados_IA_parkinson[0] = parseInt(data);
              addCheck += 1;
              verifyPromises(addCheck, paciente.Pathologies_Studied.length, paciente, resolve);
            }).catch(err => {
              //console.log(err);
            });
            break;

          case 5:
            checkFiles(pathPaciente, "Class_DFT.csv").then(res => {
              if (res) {
                return readFilee(pathPaciente.dir + "/Class_DFT.csv");
              } else {
                console.log("Archivo Estudio frontotemporal demental no encontrado");
                return -1;
              }
            }).then((data) => {
              paciente.resultados_IA_demencias[1] = parseInt(data);
              addCheck += 1;
              verifyPromises(addCheck, paciente.Pathologies_Studied.length, paciente, resolve);
            }).catch(err => {
              // console.log(err);
            });
            break;

          case 8:
            checkFiles(pathPaciente, "Class_MHE.csv").then(res => {
              if (res) {
                return readFilee(pathPaciente.dir + "/Class_MHE.csv");
              } else {
                console.log("Archivo Estudio Encefalopatia Hipatica Minima no encontrado");
                return -1;
              }
            }).then((data) => {
              paciente.resultados_IA_EHM = parseInt(data);
              addCheck += 1;
              verifyPromises(addCheck, paciente.Pathologies_Studied.length, paciente, resolve);
            }).catch(err => {
              //console.log(err);
            });
            break;


          case 9:
            checkFiles(pathPaciente, "Class_DCL.csv").then(res => {
              if (res) {
                return readFilee(pathPaciente.dir + "/Class_DCL.csv");
              } else {
                console.log("Archivo Estudio Mild Coginitive Imporment no encontrado");
                return -1;
              }
            }).then((data) => {
              paciente.resultados_IA_demencias[2] = parseInt(data);
              addCheck += 1;
              verifyPromises(addCheck, paciente.Pathologies_Studied.length, paciente, resolve);
            }).catch(err => {
              //console.log(err);
            });
            break;


          case 10:
            checkFiles(pathPaciente, "Class_PKS.csv").then(res => {
              if (res) {
                return readFilee(pathPaciente.dir + "/Class_PKS.csv");
              } else {
                console.log("Archivo Estudio parkinsonimos no encontrado");
                return -1;
              }
            }).then((data) => {
              paciente.resultados_IA_parkinson[1] = parseInt(data);
              addCheck += 1;
              verifyPromises(addCheck, paciente.Pathologies_Studied.length, paciente, resolve);
            }).catch(err => {
              //console.log(err);
            });
            break;
          default:
            console.log('Sin especificar ' + pathology);
        }
      }
    } catch (error) {
      reject(eror);
    }
  });
}




module.exports = { clasificador, upDateClasificadorJson };