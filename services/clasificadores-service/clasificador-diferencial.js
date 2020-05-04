require('dotenv').config();
const starProcess = require("../system-service/runProcess");
const { readFilee, checkFiles, log } = require('../system-service/fs');
const { updateJsonFiles } = require('../system-service/jsonEditFile');
const push_DB_datos = require("../db-service/push_bd_datos");
const uploadToDBToTest = require("../db-service/push_bd_test");
const generatePdf = require("../report-service/generatePdf");

const Ora = require('ora');
const chalk = require('chalk');
const spinner = new Ora();


const {ROUTER_DOWNLOAD_BLOB ,ROUTER_CLASIFICADORES_DIFERENCIALES } = process.env ;


let runProcess = null;
//singlenton de intancia de funcion para proceso de consola
if (!runProcess) {
  runProcess = starProcess();
}

const clasificadorDiferencial = (pathPaciente,estudioDiferenciales ,pathLog) => {
  spinner.start();
  spinner.text= `${chalk.yellow('Run Clasificadores Diferenciales')}`
  let jsonpaciente = null;
  readFilee(`${pathPaciente.dir}/${pathPaciente.base}`).then(data => {
    jsonpaciente = JSON.parse(data.toString());
    callChecksStudies(pathPaciente, estudioDiferenciales, jsonpaciente, pathLog);
  }).catch(err => {
    let date = new Date();
    log(`${ROUTER_DOWNLOAD_BLOB}/${pathLog}`, `Error al llamar los clasificadores diferenciales... ${date}`).then(data=>{
      });
      spinner.fail(`${chalk.red('Error',err)}`)
  });
}

const callChecksStudies = async (pathPaciente, estudioDiferenciales ,paciente, pathLog) => {
  try {
    if(estudioDiferenciales.res){
      const veryClassificadores = await veryResClassificadores(paciente);
      if(veryClassificadores){
        spinner.text= `${chalk.yellow('Verificando Pathologias a estudiadas')}`
        const checkList = await checkEstudies(pathPaciente, estudioDiferenciales.data, paciente ,pathLog)
        await Promise.all(checkList);
        const res = await upDateDiferencialJson(pathPaciente, paciente, estudioDiferenciales.data);
        await updateJsonFiles(`${pathPaciente.dir}/${pathPaciente.base}`, res);
        let date = new Date();
        await log(`${ROUTER_DOWNLOAD_BLOB}/${pathLog}`, `Clasificadores diferenciales generados correctamente... ${paciente} => ${date}`);
        spinner.succeed(`${chalk.green('Proceso de clasificacion diferencial terminada')}`);
        const resPushTest = await uploadToDBToTest(pathPaciente, pathLog);
        const resPushDatos = await push_DB_datos(pathPaciente, pathLog);
        generatePdf(pathPaciente, pathLog);
      }else{
        spinner.fail(`${chalk.red('No hay que ejecutar clasificadores diferenciales')}`)
        const resPushTest = await uploadToDBToTest(pathPaciente, pathLog);
        const resPushDatos = await push_DB_datos(pathPaciente, pathLog);
        generatePdf(pathPaciente, pathLog);
      }
    }else{
      spinner.fail(`${chalk.red('No hay que estudiar las patologias')}`)
    }
  } catch (error) {
    
  }
}


const veryResClassificadores = (dataJsonPaciente) => {
  return new Promise ((resolve, reject) =>{
    try {
      let response = false;
      if(dataJsonPaciente.resultados_IA_demencias[0] !== 1 && dataJsonPaciente.resultados_IA_demencias[1] !== 1
        || dataJsonPaciente.resultados_IA_demencias[0] !== 1 && dataJsonPaciente.resultados_IA_demencias[2] !== 1
        || dataJsonPaciente.resultados_IA_demencias[1] !== 1 && dataJsonPaciente.resultados_IA_demencias[2] !== 1
        || dataJsonPaciente.resultados_IA_parkinson[0] !== 1 && dataJsonPaciente.resultados_IA_parkinson[1] !== 1)
        {
              response = true;
              console.log('si hay que ejecutar');
        }
        resolve(response);
       
    } catch (error) {
      reject(error);
    }
  })
}

const checkEstudies = (pathPaciente, paciente, dataJsonPaciente, pathLog) => {
  //retorno una promesa donde voy a verificar si los archivos del casificador estan creados
  return new Promise((resolve, reject) => {
    try {
      spinner.text= `${chalk.blue('Ejecutando clasificadores diferenciales')}`
      promesasArray = []; 
      const Pathologies_Studied = paciente;
      let addCheck = 0;
      Pathologies_Studied.forEach((pathology) => {
        switch (pathology) {
          case 1:
            spinner.text= `${chalk.blue('Sin especificar')}`;
            addCheck += 1;
            verifyPromises(addCheck, Pathologies_Studied.length, promesasArray, resolve);
            break;
          case 25:
            if(dataJsonPaciente.resultados_IA_demencias[0] !== 1 && dataJsonPaciente.resultados_IA_demencias[1] !== 1){
              checkFiles(pathPaciente, "Estudio_Diferencial_AD_vs_FTD.csv").then(res => {
                if (res) {
                  return readFilee(`${pathPaciente.dir}/Estudio_Diferencial_AD_vs_FTD.csv`);
                } else {
                  console.log("Archivo Estudio AD_vs_FTD no encontrado");
                }
              }).then((data) => {
                let commandClasificadorAD =
                 `cd ${ROUTER_CLASIFICADORES_DIFERENCIALES}/Clasificador_diferencial_EA_vs_DFT/src && ./main ${pathPaciente.dir} ${data.toString().replace(/,/g, " ")}`;
                promesasArray.push(runProcess(commandClasificadorAD));
                addCheck += 1;
                verifyPromises(addCheck, Pathologies_Studied.length, promesasArray, resolve);
              }).catch(err => {
                //console.log(err);
              });
            }
            break;

          case 29:
            if(dataJsonPaciente.resultados_IA_demencias[0] !== 1 && dataJsonPaciente.resultados_IA_demencias[2] !== 1){
              checkFiles(pathPaciente, "Estudio_Diferencial_AD_vs_MCI.csv").then(res => {
                if (res) {
                  return readFilee(pathPaciente.dir + "/Estudio_Diferencial_AD_vs_MCI.csv");
                } else {
                  console.log("Archivo Estudio AD_vs_MCI no encontrado");
                }
              }).then((data) => {
                let commandClasificadorPD = 
                `cd ${ROUTER_CLASIFICADORES_DIFERENCIALES}/Clasificador_diferencial_EA_vs_DCL/src && ./main ${pathPaciente.dir} ${data.toString().replace(/,/g, " ")}`;
                promesasArray.push(runProcess(commandClasificadorPD));
                addCheck += 1;
                verifyPromises(addCheck, Pathologies_Studied.length, promesasArray, resolve);
              }).catch(err => {
        
              });
            }
            break;

          case 59:
            if(dataJsonPaciente.resultados_IA_demencias[1] !== 1 && dataJsonPaciente.resultados_IA_demencias[2] !== 1){
              //'frontotemporal demental'
              checkFiles(pathPaciente, "Estudio_Diferencial_FTD_vs_MCI.csv").then(res => {
                if (res) {
                  return readFilee(pathPaciente.dir + "/Estudio_Diferencial_FTD_vs_MCI.csv");
                } else {
                  console.log("Archivo Estudio FTD_vs_MCI no encontrado");
                }
              }).then((data) => {
                let commandClasificadorAD = 
                `cd ${ROUTER_CLASIFICADORES_DIFERENCIALES}/Clasificador_diferencial_DFT_vs_DCL/src && ./main ${pathPaciente.dir} ${data.toString().replace(/,/g, " ")}`;
                promesasArray.push(runProcess(commandClasificadorAD));
                addCheck += 1;
                verifyPromises(addCheck, Pathologies_Studied.length, promesasArray, resolve);    
              }).catch(err => {
                
              });
            }
            break;

          case 310:
            if(dataJsonPaciente.resultados_IA_parkinson[0] !== 1 && dataJsonPaciente.resultados_IA_parkinson[1] !== 1){
              //Mild Coginitive Imporment'
              checkFiles(pathPaciente, "Estudio_Diferencial_PD_vs_PKS.csv").then(res => {
                if (res) {
                  return readFilee(pathPaciente.dir + "/Estudio_Diferencial_PD_vs_PKS.csv");
                } else {
                  console.log("Archivo Estudio Mild Coginitive Imporment no encontrado");
                }
              }).then((data) => {
                let commandClasificadorAD = 
                `cd ${ROUTER_CLASIFICADORES_DIFERENCIALES}/Clasificador_diferencial_EP_vs_PKS/src && ./main ${pathPaciente.dir} ${data.toString().replace(/,/g, " ")}`;
                promesasArray.push(runProcess(commandClasificadorAD));
                addCheck += 1;
                verifyPromises(addCheck, Pathologies_Studied.length, promesasArray, resolve);
              }).catch(err => {
              
              });
            }
            break;
          default:
            console.log('Sin especificar ' + pathology);
        }
      });
      spinner.succeed(`${chalk.green('Fin ciclo')}`);
    } catch (error) {
      reject(eror);
    }
  });
}

const verifyPromises = (checks, pathologies, dataResolve, resolve) => {
  if (checks === pathologies) {
    spinner.succeed(`${chalk.green('Servicio clasificadores diferenciales finalizado')}`);
    resolve(dataResolve);
  }
}



const upDateDiferencialJson = (pathPaciente, paciente, estudioDiferenciales) => {
  return new Promise((resolve, reject) => {
    try {
      spinner.text= `${chalk.yellow('Actualizando Json con clasificadores Diferenciales')}`
      promesasArray = [];
      let addCheck = 0;
      for (let pathology of estudioDiferenciales) {
        switch (pathology) {
          case 1:
            console.log('Sin especificar ' + pathology);
            addCheck += 1;
            break;

          case 25:
            if(dataJsonPaciente.resultados_IA_demencias[0] !== 1 && dataJsonPaciente.resultados_IA_demencias[1] !== 1){
              checkFiles(pathPaciente, "Class_Diferencial_EA_vs_DFT.csv").then(res => {
                if (res) {
                  return readFilee(pathPaciente.dir + "/Class_Diferencial_EA_vs_DFT.csv");
                } else {
                  console.log("Archivo Estudio EA_vs_DFT no encontrado");
                  return -1;
                }
              }).then((data) => {           
                paciente.resultados_IA_demencias[3] = parseInt(data);
                addCheck += 1;
                verifyPromises(addCheck, estudioDiferenciales.length, paciente, resolve);
              }).catch(err => {
                console.log(err);
              });
            }
            break;

          case 29:
            if(dataJsonPaciente.resultados_IA_demencias[0] !== 1 && dataJsonPaciente.resultados_IA_demencias[2] !== 1){
              checkFiles(pathPaciente, "Class_Diferencial_EA_vs_DCL.csv").then(res => {
                if (res) {
                  return readFilee(pathPaciente.dir + "/Class_Diferencial_EA_vs_DCL.csv");
                } else {
                  console.log("Archivo Estudio EA_vs_DCL no encontrado");
                  return -1;
                }
              }).then((data) => {
    
                paciente.resultados_IA_demencias[4] = parseInt(data);
                addCheck += 1;
                verifyPromises(addCheck, estudioDiferenciales.length, paciente, resolve);
              }).catch(err => {
                //console.log(err);
              });
            }
            break;

          case 59:
            if(dataJsonPaciente.resultados_IA_demencias[1] !== 1 && dataJsonPaciente.resultados_IA_demencias[2] !== 1){
              checkFiles(pathPaciente, "Class_Diferencial_DFT_vs_DCL.csv").then(res => {
                if (res) {
                  return readFilee(pathPaciente.dir + "/Class_Diferencial_DFT_vs_DCL.csv");
                } else {
                  console.log("Archivo Estudio DFT_vs_DCL no encontrado");
                  return -1;
                }
              }).then((data) => {
                paciente.resultados_IA_demencias[5] = parseInt(data);
                addCheck += 1;
                verifyPromises(addCheck, estudioDiferenciales.length, paciente, resolve);
              }).catch(err => {
                // console.log(err);
              });
            }
            break;

          case 310:
            if(dataJsonPaciente.resultados_IA_parkinson[0] !== 1 && dataJsonPaciente.resultados_IA_parkinson[1] !== 1){
              checkFiles(pathPaciente, "Class_Diferencial_EP_vs_PKS.csv").then(res => {
                if (res) {
                  return readFilee(pathPaciente.dir + "/Class_Diferencial_EP_vs_PKS.csv");
                } else {
                  console.log("Archivo Estudio EP_vs_PKS no encontrado");
                  return -1;
                }
              }).then((data) => {
                paciente.resultados_IA_parkinson[2] = parseInt(data);
                addCheck += 1;
                verifyPromises(addCheck, estudioDiferenciales.length, paciente, resolve);
              }).catch(err => {
                //console.log(err);
              });
            }
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

module.exports = { clasificadorDiferencial, upDateDiferencialJson };