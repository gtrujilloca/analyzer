require('dotenv').config();
const starProcess = require("../system-service/runProcess");
const { readFilee, checkFiles, log } = require('../system-service/fs');
const { updateJsonFiles } = require('../system-service/jsonEditFile');
const push_DB_datos = require("../db-service/push_bd_datos");
const uploadToDBToTest = require("../db-service/push_bd_test");
const generatePdf = require("../report-service/generatePdf");
const logService = require('../log-service/log-service')

const Ora = require('ora');
const chalk = require('chalk');
const spinner = new Ora();


const {ROUTER_DOWNLOAD_BLOB ,ROUTER_CLASIFICADORES_DIFERENCIALES } = process.env ;


let runProcess = null;
//singlenton de intancia de funcion para proceso de consola
if (!runProcess) {
  runProcess = starProcess();
}

const clasificadorDiferencial = (pathPaciente,estudioDiferenciales ,dataPaciente) => {
  spinner.start();
  spinner.text= `${chalk.yellow('Run Clasificadores Diferenciales')}`
  let jsonpaciente = null;
  readFilee(`${pathPaciente.dir}/${pathPaciente.base}`).then(data => {
    jsonpaciente = JSON.parse(data.toString());
    callChecksStudies(pathPaciente, estudioDiferenciales, jsonpaciente, dataPaciente);
  }).catch(err => {
    logService({
      label: jsonpaciente.Label,
       labelGlobal: jsonpaciente.Label, 
       accion:'Clasificadores diferenciales',
       nombreProceso: 'Servicio de clasificadores diferenciales',
       estadoProceso: 'ERROR',
       codigoProceso: 2,
       descripcion: `Error al ejecutar Clasificadores ${err}`,
       fecha: new Date()
      });
      spinner.fail(`${chalk.red('Error',err)}`)
  });
}

const callChecksStudies = async (pathPaciente, estudioDiferenciales ,paciente, dataPaciente) => {
  try {
    if(estudioDiferenciales.res){
      const veryClassificadores = await veryResClassificadores(paciente);
      if(veryClassificadores.res === true){
        spinner.text= `${chalk.yellow('Verificando Pathologias a estudiadas')}`
        const checkList = await checkEstudies(pathPaciente, veryClassificadores.data, paciente ,dataPaciente)
        await Promise.all(checkList);
        logService({
          label: dataPaciente.Label,
           labelGlobal: dataPaciente.Label, 
           accion:'Clasificadores diferenciales',
           nombreProceso: 'Servicio de clasificadores diferenciales ejecutado',
           estadoProceso: 'OK',
           codigoProceso: 200,
           descripcion: `Clasificadores Diferenciales ejecutados correctamente ${veryClassificadores.data}`,
           fecha: new Date()
          });
        const res = await upDateDiferencialJson(pathPaciente, paciente, veryClassificadores.data);
        await updateJsonFiles(`${pathPaciente.dir}/${pathPaciente.base}`, res);
        logService({
          label: dataPaciente.Label,
           labelGlobal:dataPaciente.Label, 
           accion:'Actualizando archivo',
           nombreProceso: 'Actualiacion de archivo Json con los clasificadores diferenciales',
           estadoProceso: 'OK',
           codigoProceso: 200,
           descripcion: `Json actualizado ${res}`,
           fecha: new Date()
          });
        
        spinner.succeed(`${chalk.green('Proceso de clasificacion diferencial terminada')}`);
        const resPushTest = await uploadToDBToTest(pathPaciente, dataPaciente);
        const resPushDatos = await push_DB_datos(pathPaciente, dataPaciente);
        generatePdf(pathPaciente, dataPaciente);
      }else{
        logService({
          label: dataPaciente.Label,
           labelGlobal:dataPaciente.Label, 
           accion:'Clasificadores diferenciales',
           nombreProceso: 'No hay que ejecutar clasificadores diferenciales ejecutado',
           estadoProceso: 'OK',
           codigoProceso: 200,
           descripcion: `No hay que ejecutar clasificadores Diferenciales`,
           fecha: new Date()
          });
        spinner.fail(`${chalk.red('No hay que ejecutar clasificadores diferenciales')}`)
        const resPushTest = await uploadToDBToTest(pathPaciente, dataPaciente);
        const resPushDatos = await push_DB_datos(pathPaciente, dataPaciente);
        generatePdf(pathPaciente, dataPaciente);
      }
    }else{
      logService({
        label: dataPaciente.Label,
         labelGlobal:dataPaciente.Label, 
         accion:'Clasificadores diferenciales',
         nombreProceso: 'Servicio de clasificadores diferenciales',
         estadoProceso: 'ERROR',
         codigoProceso: 2,
         descripcion: `No hayq eu estudiar las pathologias`,
         fecha: new Date()
        });
      spinner.fail(`${chalk.red('No hay que estudiar las patologias')}`)
    }
  } catch (error) {
    logService({
      label:dataPaciente.Label,
       labelGlobal:dataPaciente.Label, 
       accion:'Clasificadores diferenciales',
       nombreProceso: 'Servicio de clasificadores diferenciales',
       estadoProceso: 'ERROR',
       codigoProceso: 28,
       descripcion: `Error al ejecutar Clasificadores ${error}`,
       fecha: new Date()
      });
  }
}


const veryResClassificadores = (dataJsonPaciente) => {
  return new Promise ((resolve, reject) =>{
    try {
      let arrayDiferencialesejecutar = [];  
      if(dataJsonPaciente.resultados_IA_demencias[0] !== 1 && dataJsonPaciente.resultados_IA_demencias[1] !== 1
        && dataJsonPaciente.resultados_IA_demencias[0] !== -1 && dataJsonPaciente.resultados_IA_demencias[1] !== -1){
          arrayDiferencialesejecutar.push(25);
        }
        if(dataJsonPaciente.resultados_IA_demencias[0] !== 1 && dataJsonPaciente.resultados_IA_demencias[2] !== 1
        && dataJsonPaciente.resultados_IA_demencias[0] !== -1 && dataJsonPaciente.resultados_IA_demencias[2] !== -1){
          arrayDiferencialesejecutar.push(29);
        }
        if(dataJsonPaciente.resultados_IA_demencias[1] !== 1 && dataJsonPaciente.resultados_IA_demencias[2] !== 1
        && dataJsonPaciente.resultados_IA_demencias[1] !== -1 && dataJsonPaciente.resultados_IA_demencias[2] !== -1){
          arrayDiferencialesejecutar.push(59);
        }
        if(dataJsonPaciente.resultados_IA_parkinson[0] !== 1 && dataJsonPaciente.resultados_IA_parkinson[1] !== 1
        && dataJsonPaciente.resultados_IA_parkinson[0] !== -1 && dataJsonPaciente.resultados_IA_parkinson[1] !== -1){
          arrayDiferencialesejecutar.push(310);
        }
        console.log(arrayDiferencialesejecutar);
        if(arrayDiferencialesejecutar.length !== 0){
             resolve({res: true, data: arrayDiferencialesejecutar});
        }else{
          resolve({res: false, data: arrayDiferencialesejecutar});
        }
       
    } catch (error) {
      logService({
        label:dataPaciente.Label,
         labelGlobal:dataPaciente.Label, 
         accion:'Clasificadores diferenciales',
         nombreProceso: 'Servicio de clasificadores diferenciales',
         estadoProceso: 'ERROR',
         codigoProceso: 2,
         descripcion: `Error al ejecutar Clasificadores ${error}`,
         fecha: new Date()
        });
      reject(error);
    }
  })
}

const checkEstudies = (pathPaciente, paciente, dataJsonPaciente, dataPaciente) => {
  //retorno una promesa donde voy a verificar si los archivos del casificador estan creados
  return new Promise((resolve, reject) => {
    try {
      spinner.text= `${chalk.blue('Ejecutando clasificadores diferenciales')}`
      promesasArray = []; 
      console.log(paciente);
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
              console.log("25");
              checkFiles(pathPaciente, "Estudio_Diferencial_AD_vs_FTD.csv").then(res => {
                if (res) {
                  return readFilee(`${pathPaciente.dir}/Estudio_Diferencial_AD_vs_FTD.csv`);
                } else {
                  console.log("Archivo Estudio AD_vs_FTD no encontrado");
                }
              }).then((data) => {
                let commandClasificadorAD =
                 `cd ${ROUTER_CLASIFICADORES_DIFERENCIALES}/Clasificador_diferencial_EA_vs_DFT/src && ./main ${pathPaciente.dir} ${data.toString().replace(/,/g, " ")}`;
                 console.log(commandClasificadorAD);
                promesasArray.push(runProcess(commandClasificadorAD));
                addCheck += 1;
                verifyPromises(addCheck, Pathologies_Studied.length, promesasArray, resolve);
              }).catch(err => {
                logService({
                  label: dataPaciente.Label,
                   labelGlobal: dataPaciente.Label, 
                   accion:'Clasificadores diferenciales',
                   nombreProceso: 'Servicio de clasificadores diferenciales EA_vs_DFT',
                   estadoProceso: 'ERROR',
                   codigoProceso: 2,
                   descripcion: `Error al ejecutar Clasificadores ${err}`,
                   fecha: new Date()
                  });
              });
            }
            break;

          case 29:
            if(dataJsonPaciente.resultados_IA_demencias[0] !== 1 && dataJsonPaciente.resultados_IA_demencias[2] !== 1){
              console.log("29")
              checkFiles(pathPaciente, "Estudio_Diferencial_AD_vs_MCI.csv").then(res => {
                if (res) {
                  return readFilee(pathPaciente.dir + "/Estudio_Diferencial_AD_vs_MCI.csv");
                } else {
                  console.log("Archivo Estudio AD_vs_MCI no encontrado");
                }
              }).then((data) => {
                let commandClasificadorPD = 
                `cd ${ROUTER_CLASIFICADORES_DIFERENCIALES}/Clasificador_diferencial_EA_vs_DCL/src && ./main ${pathPaciente.dir} ${data.toString().replace(/,/g, " ")}`;
                console.log(commandClasificadorPD);
                promesasArray.push(runProcess(commandClasificadorPD));
                addCheck += 1;
                verifyPromises(addCheck, Pathologies_Studied.length, promesasArray, resolve);
              }).catch(err => {
                logService({
                  label: dataPaciente.Label,
                   labelGlobal: dataPaciente.Label, 
                   accion:'Clasificadores diferenciales',
                   nombreProceso: 'Servicio de clasificadores diferenciales EA_vs_DCL',
                   estadoProceso: 'ERROR',
                   codigoProceso: 2,
                   descripcion: `Error al ejecutar Clasificadores ${err}`,
                   fecha: new Date()
                  });
              });
            }
            break;

          case 59:
            if(dataJsonPaciente.resultados_IA_demencias[1] !== 1 && dataJsonPaciente.resultados_IA_demencias[2] !== 1){
              console.log("59")
              checkFiles(pathPaciente, "Estudio_Diferencial_FTD_vs_MCI.csv").then(res => {
                if (res) {
                  return readFilee(pathPaciente.dir + "/Estudio_Diferencial_FTD_vs_MCI.csv");
                } else {
                  console.log("Archivo Estudio FTD_vs_MCI no encontrado");
                }
              }).then((data) => {
                let commandClasificadorAD = 
                `cd ${ROUTER_CLASIFICADORES_DIFERENCIALES}/Clasificador_diferencial_DFT_vs_DCL/src && ./main ${pathPaciente.dir} ${data.toString().replace(/,/g, " ")}`;
                console.log(commandClasificadorAD);
                promesasArray.push(runProcess(commandClasificadorAD));
                addCheck += 1;
                verifyPromises(addCheck, Pathologies_Studied.length, promesasArray, resolve);    
              }).catch(err => {
                logService({
                  label: dataPaciente.Label,
                   labelGlobal:dataPaciente.Label, 
                   accion:'Clasificadores diferenciales',
                   nombreProceso: 'Servicio de clasificadores diferenciales DFT_vs_DCL',
                   estadoProceso: 'ERROR',
                   codigoProceso: 2,
                   descripcion: `Error al ejecutar Clasificadores ${err}`,
                   fecha: new Date()
                  });
                
              });
            }
            break;

          case 310:
            if(dataJsonPaciente.resultados_IA_parkinson[0] !== 1 && dataJsonPaciente.resultados_IA_parkinson[1] !== 1){
              console.log("310")
              checkFiles(pathPaciente, "Estudio_Diferencial_PD_vs_PKS.csv").then(res => {
                if (res) {
                  return readFilee(pathPaciente.dir + "/Estudio_Diferencial_PD_vs_PKS.csv");
                } else {
                  console.log("Archivo Estudio Mild Coginitive Imporment no encontrado");
                }
              }).then((data) => {
                let commandClasificadorAD = 
                `cd ${ROUTER_CLASIFICADORES_DIFERENCIALES}/Clasificador_diferencial_EP_vs_PKS/src && ./main ${pathPaciente.dir} ${data.toString().replace(/,/g, " ")}`;
                console.log(commandClasificadorAD);
                promesasArray.push(runProcess(commandClasificadorAD));
                addCheck += 1;
                verifyPromises(addCheck, Pathologies_Studied.length, promesasArray, resolve);
              }).catch(err => {
                logService({
                  label: dataPaciente.Label,
                   labelGlobal:dataPaciente.Label, 
                   accion:'Clasificadores diferenciales',
                   nombreProceso: 'Servicio de clasificadores diferenciales EP_vs_PKS',
                   estadoProceso: 'ERROR',
                   codigoProceso: 2,
                   descripcion: `Error al ejecutar Clasificadores ${err}`,
                   fecha: new Date()
                  });
              
              });
            }
            break;
          default:
            console.log('Sin especificar ' + pathology);
        }
      });
    } catch (error) {
      logService({
        label: dataPaciente.Label,
         labelGlobal:dataPaciente.Label, 
         accion:'Clasificadores diferenciales',
         nombreProceso: 'Servicio de clasificadores diferenciales',
         estadoProceso: 'ERROR',
         codigoProceso: 2,
         descripcion: `Error al ejecutar Clasificadores ${error}`,
         fecha: new Date()
        });
      reject(error);
    }
  });
}

const verifyPromises = (checks, pathologies, dataResolve, resolve) => {
  if (checks === pathologies) {
    spinner.succeed(`${chalk.green('Servicio clasificadores diferenciales finalizado')}`);
    resolve(dataResolve);
  }
}



const upDateDiferencialJson = (pathPaciente, dataJsonPaciente, estudioDiferenciales) => {
  return new Promise((resolve, reject) => {
    try {
      spinner.text= `${chalk.yellow('Actualizando Json con clasificadores Diferenciales')}`
      promesasArray = [];
      let addCheck = 0;
      console.log(estudioDiferenciales)
      for (let pathology of estudioDiferenciales) {
        switch (pathology) {
          case 1:
            console.log('Sin especificar ' + pathology);
            addCheck += 1;
            break;

          case 25:
            if(dataJsonPaciente.resultados_IA_demencias[0] !== 1 && dataJsonPaciente.resultados_IA_demencias[1] !== 1){
              console.log("25");
              checkFiles(pathPaciente, "Class_Diferencial_EA_vs_DFT.csv").then(res => {
                if (res) {
                  return readFilee(pathPaciente.dir + "/Class_Diferencial_EA_vs_DFT.csv");
                } else {
                  console.log("Archivo Estudio EA_vs_DFT no encontrado");
                  return -1;
                }
              }).then((data) => {  
                console.log(parseInt(data));         
                dataJsonPaciente.resultados_IA_demencias[3] = parseInt(data);
                addCheck += 1;
                verifyPromises(addCheck, estudioDiferenciales.length, dataJsonPaciente, resolve);  
              }).catch(err => {
                logService({
                  label: dataPaciente.Label,
                   labelGlobal:dataPaciente.Label, 
                   accion:'Actualizacion de archivo',
                   nombreProceso: 'Servicio de clasificadores diferenciales',
                   estadoProceso: 'ERROR',
                   codigoProceso: 2,
                   descripcion: `Error al actualizar Json con los clasificadores diferenciales ${err}`,
                   fecha: new Date()
                  });
              });
            }
            break;

          case 29:
            if(dataJsonPaciente.resultados_IA_demencias[0] !== 1 && dataJsonPaciente.resultados_IA_demencias[2] !== 1){
              console.log("29");
              checkFiles(pathPaciente, "Class_Diferencial_EA_vs_DCL.csv").then(res => {
                if (res) {
                  return readFilee(pathPaciente.dir + "/Class_Diferencial_EA_vs_DCL.csv");
                } else {
                  console.log("Archivo Estudio EA_vs_DCL no encontrado");
                  return -1;
                }
              }).then((data) => {
                console.log(parseInt(data));          
                dataJsonPaciente.resultados_IA_demencias[4] = parseInt(data);
                addCheck += 1;
                verifyPromises(addCheck, estudioDiferenciales.length, dataJsonPaciente, resolve);
              }).catch(err => {
                logService({
                  label: dataPaciente.Label,
                   labelGlobal:dataPaciente.Label, 
                   accion:'Actualizacion de archivo',
                   nombreProceso: 'Servicio de clasificadores diferenciales',
                   estadoProceso: 'ERROR',
                   codigoProceso: 2,
                   descripcion: `Error al actualizar Json con los clasificadores diferenciales ${err}`,
                   fecha: new Date()
                  });
              });
            }
            break;

          case 59:
            if(dataJsonPaciente.resultados_IA_demencias[1] !== 1 && dataJsonPaciente.resultados_IA_demencias[2] !== 1){
              console.log("59");
              checkFiles(pathPaciente, "Class_Diferencial_DFT_vs_DCL.csv").then(res => {
                if (res) {
                  return readFilee(pathPaciente.dir + "/Class_Diferencial_DFT_vs_DCL.csv");
                } else {
                  console.log("Archivo Estudio DFT_vs_DCL no encontrado");
                  return -1;
                }
              }).then((data) => {
                console.log(parseInt(data));        
                dataJsonPaciente.resultados_IA_demencias[5] = parseInt(data);
                addCheck += 1;
              
                verifyPromises(addCheck, estudioDiferenciales.length, dataJsonPaciente, resolve);
               
              }).catch(err => {
                logService({
                  label: dataPaciente.Label,
                   labelGlobal:dataPaciente.Label, 
                   accion:'Actualizacion de archivo',
                   nombreProceso: 'Servicio de clasificadores diferenciales',
                   estadoProceso: 'ERROR',
                   codigoProceso: 2,
                   descripcion: `Error al actualizar Json con los clasificadores diferenciales ${err}`,
                   fecha: new Date()
                  });
              });
            }
            break;

          case 310:
            if(dataJsonPaciente.resultados_IA_parkinson[0] !== 1 && dataJsonPaciente.resultados_IA_parkinson[1] !== 1){
              console.log("310");
              checkFiles(pathPaciente, "Class_Diferencial_EP_vs_PKS.csv").then(res => {
                if (res) {
                  return readFilee(pathPaciente.dir + "/Class_Diferencial_EP_vs_PKS.csv");
                } else {
                  console.log("Archivo Estudio EP_vs_PKS no encontrado");
                  return -1;
                }
              }).then((data) => {
                console.log(parseInt(data));           
                dataJsonPaciente.resultados_IA_parkinson[2] = parseInt(data);
                addCheck += 1;
                console.log("check ", addCheck);
                verifyPromises(addCheck, estudioDiferenciales.length, dataJsonPaciente, resolve);
              }).catch(err => {
                logService({
                  label: dataPaciente.Label,
                   labelGlobal:dataPaciente.Label, 
                   accion:'Actualizacion de archivo',
                   nombreProceso: 'Servicio de clasificadores diferenciales',
                   estadoProceso: 'ERROR',
                   codigoProceso: 2,
                   descripcion: `Error al actualizar Json con los clasificadores diferenciales ${err}`,
                   fecha: new Date()
                  });
              });
            }
            break;

          default:
            console.log('Sin especificar ' + pathology);
        }
      }

    } catch (error) {
      logService({
        label: dataPaciente.Label,
         labelGlobal:dataPaciente.Label, 
         accion:'Actualizacion de archivo',
         nombreProceso: 'Servicio de clasificadores diferenciales',
         estadoProceso: 'ERROR',
         codigoProceso: 2,
         descripcion: `Error al actualizar Json con los clasificadores diferenciales ${error}`,
         fecha: new Date()
        });
      reject(eror);
    }
  });
}

module.exports = { clasificadorDiferencial, upDateDiferencialJson };