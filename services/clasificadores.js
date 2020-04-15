const starProcess = require("./runProcess");
const { readFilee, checkFiles, log } = require('./fs');
const { updateJson } = require('./jsonEditFile');
const push_DB_datos = require("./push_bd_datos.js");
const uploadToDBToTest = require("./push_bd_test.js");


const ROUTER_DOWNLOAD_BLOB = process.env.ROUTER_DOWNLOAD_BLOB || '/home/andresagudelo/Documentos/OCTAVEproyects/PATOLOGIAS/enProceso';
const ROUTER_CLASIFICADORES = process.env.ROUTER_CLASIFICADORES;

let runProcess = null;
//singlenton de intancia de funcion para proceso de consola
if (!runProcess) {
  runProcess = starProcess();
}



const clasificador = (pathPaciente, pathLog) => {
  console.log("Run Clasificadores");
  let jsonpaciente = null;
  readFilee(`${pathPaciente.dir}/${pathPaciente.base}`).then(data => {
    jsonpaciente = JSON.parse(data.toString());
    callChecksStudies(pathPaciente, jsonpaciente, pathLog);
  }).catch(err => {
    let date = new Date();
    log(`${ROUTER_DOWNLOAD_BLOB}/${pathLog}`, `Error al llamar los clasificadores... ${date}`).then(data=>{
        console.log(data);
      });
      console.log(err);
  });
}

// const callChecksStudies = (pathPaciente, paciente, pathLog) => {
//   console.log("Verificando pathologias a Estudiar");
//   checkEstudies(pathPaciente, paciente, pathLog).then(checkList => {
//     Promise.all(checkList).then(async values => {
//         const res = await upDateClasificadorJson(pathPaciente, paciente);
//           let date = new Date();
//           await log(`${ROUTER_DOWNLOAD_BLOB}/${pathLog}`, `Clasificadores generados correctamente... ${paciente} => ${date}`);
//           updateJson(`${pathPaciente.dir}/${pathPaciente.base}`, res);
//           console.log("Proceso de clasificacion terminada");
//           //push_DB_datos(pathPaciente, pathLog);
//           //uploadToDBToTest(pathPaciente, pathLog);
//       });
//   });
// }

const callChecksStudies = async (pathPaciente, paciente, pathLog) => {
  try {
    console.log("Verificando pathologias a Estudiar");
    const checkList = await checkEstudies(pathPaciente, paciente, pathLog)
      await Promise.all(checkList);
    const res = await upDateClasificadorJson(pathPaciente, paciente);
    let date = new Date();
      await log(`${ROUTER_DOWNLOAD_BLOB}/${pathLog}`, `Clasificadores generados correctamente... ${paciente} => ${date}`);
      await updateJson(`${pathPaciente.dir}/${pathPaciente.base}`, res);
    console.log("Proceso de clasificacion terminada");
    push_DB_datos(pathPaciente, pathLog);
    uploadToDBToTest(pathPaciente, pathLog);
  } catch (error) {
    
  }
}

const checkEstudies = (pathPaciente, paciente, pathLog) => {
  //retorno una promesa donde voy a verificar si los archivos del casificador estan creados
  return new Promise((resolve, reject) => {
    try {
      promesasArray = []; 
      const { Pathologies_Studied } = paciente;
      let addCheck = 0;
      Pathologies_Studied.forEach((pathology) => {
        switch (pathology) {
          case 1:
            console.log(`Sin especificar ${pathology}`);
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

          
            //verifico si el archivo del estudio existe para porder realizar la clasificacion
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
              //console.log(err);
            });
            break;

          case 5:

            //console.log('frontotemporal demental' );
            //verifico si el archivo del estudio existe para porder realizar la clasificacion
            checkFiles(pathPaciente, "Estudio_FTD.csv").then(res => {
              //si existe leo el archivo
              if (res === true) {
                //leo el archivo correspondiente al estudio a clasificar
                return readFilee(pathPaciente.dir + "/Estudio_FTD.csv");
              } else {
                console.log("Archivo Estudio frontotemporal demental no encontrado");
              }
              //despues de la promesa anterior resuelta ejecuto obtengo la de leer el archivo
            }).then((data) => {
              //Leo el Estudio CSV 
              //guardo en la variable el comando a ejecutar por bash
              let commandClasificadorAD = 
              `cd ${ROUTER_CLASIFICADORES}/Clasificador_DFT_vs_control/src && ./main ${pathPaciente.dir} ${data.toString().replace(/,/g, " ")}`;
              //guardo la promesa en el array de las promesas para saber cuantas han terminado
              promesasArray.push(runProcess(commandClasificadorAD));
              addCheck += 1;
              //verifico si la promesa esta resuelta
              verifyPromises(addCheck, Pathologies_Studied.length, promesasArray, resolve);
              //console.log("frontotemporal demental terminado");
            }).catch(err => {
              // console.log(err);
            });
            break;

          case 9:

            //console.log('Mild Coginitive Imporment');
            //verifico si el archivo del estudio existe para porder realizar la clasificacion
            checkFiles(pathPaciente, "Estudio_MCI.csv").then(res => {
              //si existe leo el archivo
              if (res === true) {
                //leo el archivo correspondiente al estudio a clasificar
                return readFilee(pathPaciente.dir + "/Estudio_MCI.csv");
              } else {
                console.log("Archivo Estudio Mild Coginitive Imporment no encontrado");
              }
              //despues de la promesa anterior resuelta ejecuto obtengo la de leer el archivo
            }).then((data) => {
              //Leo el Estudio CSV 
              //guardo en la variable el comando a ejecutar por bash
              let commandClasificadorAD = 
              `cd ${ROUTER_CLASIFICADORES}/Clasificador_DCL_vs_control/src && ./main ${pathPaciente.dir} ${data.toString().replace(/,/g, " ")}`;
              //guardo la promesa en el array de las promesas para saber cuantas han terminado
              promesasArray.push(runProcess(commandClasificadorAD));
              addCheck += 1;
              //verifico si la promesa esta resuelta
              verifyPromises(addCheck, Pathologies_Studied.length, promesasArray, resolve);
              //console.log("Mild Coginitive Imporment terminado");
            }).catch(err => {
              //console.log(err);
            });
            break;

          case 8:

            //console.log('Encefalopatia Hipatica Minima');
            //verifico si el archivo del estudio existe para porder realizar la clasificacion
            checkFiles(pathPaciente, "Estudio_MHE.csv").then(res => {
              //si existe leo el archivo
              if (res === true) {
                //leo el archivo correspondiente al estudio a clasificar
                return readFilee(pathPaciente.dir + "/Estudio_MHE.csv");
              } else {
                console.log("Archivo Estudio Encefalopatia Hipatica Minima no encontrado");
              }
              //despues de la promesa anterior resuelta ejecuto obtengo la de leer el archivo
            }).then((data) => {
              //Leo el Estudio CSV 
              //guardo en la variable el comando a ejecutar por bash
              let commandClasificadorAD = 
              `cd ${ROUTER_CLASIFICADORES}/Clasificador_EHM_vs_control/src && ./main ${pathPaciente.dir} ${data.toString().replace(/,/g, " ")}`;
              //guardo la promesa en el array de las promesas para saber cuantas han terminado
              promesasArray.push(runProcess(commandClasificadorAD));
              addCheck += 1;
              //verifico si la promesa esta resuelta
              verifyPromises(addCheck, Pathologies_Studied.length, promesasArray, resolve);
              //console.log("Encefalopatia Hipatica Minima terminado");
            }).catch(err => {
              //console.log(err);
            });
            break;

          case 10:

            //console.log('parkinsonimos ');
            //verifico si el archivo del estudio existe para porder realizar la clasificacion
            checkFiles(pathPaciente, "Estudio_PKS.csv").then(res => {
              //si existe leo el archivo
              if (res === true) {
                //leo el archivo correspondiente al estudio a clasificar
                return readFilee(pathPaciente.dir + "/Estudio_PKS.csv");
              } else {
                console.log("Archivo Estudio parkinsonimos no encontrado");
              }
              //despues de la promesa anterior resuelta ejecuto obtengo la de leer el archivo
            }).then((data) => {
              //Leo el Estudio CSV 
              //guardo en la variable el comando a ejecutar por bash
              let commandClasificadorAD = 
              `cd ${ROUTER_CLASIFICADORES}/Clasificador_Parkinsionismos_vs_control/src  && ./main ${pathPaciente.dir} ${data.toString().replace(/,/g, " ")}`;
              //guardo la promesa en el array de las promesas para saber cuantas han terminado
              promesasArray.push(runProcess(commandClasificadorAD));
              addCheck += 1;
              //verifico si la promesa esta resuelta
              verifyPromises(addCheck, Pathologies_Studied.length, promesasArray, resolve);
              //console.log("parkinsonimos terminado");
            }).catch(err => {
              //console.log(err);
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
  //console.log(addCheck, Pathologies_Studied.length);
}

const verifyPromises = (checks, pathologies, dataResolve, resolve) => {
  if (checks === pathologies) {
    resolve(dataResolve);
  }
}



const upDateClasificadorJson = (pathPaciente, paciente) => {
  //if (jsonpaciente.Results_types)
  //console.log("result types " + jsonpaciente.Results_types.AI);
  //retorno una promesa donde voy a verificar si los archivos del casificador estan creados
  return new Promise((resolve, reject) => {
    try {

      //array de promoesas
      promesasArray = [];

      //creo bandera para saber cuantas promesas se han resuelto
      let addCheck = 0;
      //ciclo para recorrer los estudios a clasificar
      //paciente.Pathologies_Studied.forEach((pathology) => {
      for (let pathology of paciente.Pathologies_Studied) {
        //dependiendo del caso del estudio realizo la clasificacion
        switch (pathology) {
          case 1:
            //esta opcion es para estudios de ejemplo
            console.log('Sin especificar ' + pathology);
            addCheck += 1;
            //llamo metodo de verificar la promesa si ya fue resuelra

            break;

          case 2:
            //verifico si el archivo del estudio existe para porder realizar la clasificacion
            checkFiles(pathPaciente, "Class_AD.csv").then(res => {
              //si existe leo el archivo
              if (res === true) {
                //leo el archivo correspondiente al estudio a clasificar
                return readFilee(pathPaciente.dir + "/Class_AD.csv");
              } else {
                console.log("Archivo Estudio AD no encontrado");
                return -1;
              }
              //despues de la promesa anterior resuelta ejecuto obtengo la de leer el archivo
            }).then((data) => {
              //Leo el Estudio CSV
              console.log(parseInt(data));
              paciente.resultados_IA_demencias[0] = parseInt(data);
              addCheck += 1;
              verifyPromises(addCheck, paciente.Pathologies_Studied.length, paciente, resolve);
              //guardo en la variable el comando a ejecutar por bash              //console.log("Alzheimer terminado");
            }).catch(err => {
              console.log(err);
            });
            break;

          case 3:

            //console.log('Parkinson');
            //verifico si el archivo del estudio existe para porder realizar la clasificacion
            checkFiles(pathPaciente, "Class_Parkinson.csv").then(res => {
              //si existe leo el archivo
              if (res === true) {
                //leo el archivo correspondiente al estudio a clasificar
                return readFilee(pathPaciente.dir + "/Class_Parkinson.csv");
              } else {
                console.log("Archivo Estudio Parkinson no encontrado");
                return -1;
              }
              //despues de la promesa anterior resuelta ejecuto obtengo la de leer el archivo
            }).then((data) => {
              //Leo el Estudio CSV 
              console.log(data);
              paciente.resultados_IA_parkinson[0] = parseInt(data);
              addCheck += 1;
              verifyPromises(addCheck, paciente.Pathologies_Studied.length, paciente, resolve);
              //console.log("Parkinson terminado");
            }).catch(err => {
              //console.log(err);
            });
            break;

          case 5:

            //console.log('frontotemporal demental' );
            //verifico si el archivo del estudio existe para porder realizar la clasificacion
            checkFiles(pathPaciente, "Class_DFT.csv").then(res => {
              //si existe leo el archivo
              if (res === true) {
                //leo el archivo correspondiente al estudio a clasificar
                return readFilee(pathPaciente.dir + "/Class_DFT.csv");
              } else {
                console.log("Archivo Estudio frontotemporal demental no encontrado");
                return -1;
              }
              //despues de la promesa anterior resuelta ejecuto obtengo la de leer el archivo
            }).then((data) => {
              //Leo el Estudio CSV 
              paciente.resultados_IA_demencias[1] = parseInt(data);
              addCheck += 1;
              verifyPromises(addCheck, paciente.Pathologies_Studied.length, paciente, resolve);
            }).catch(err => {
              // console.log(err);
            });
            break;

          case 8:

            //console.log('Encefalopatia Hipatica Minima');
            //verifico si el archivo del estudio existe para porder realizar la clasificacion
            checkFiles(pathPaciente, "Class_MHE.csv").then(res => {
              //si existe leo el archivo
              if (res === true) {
                //leo el archivo correspondiente al estudio a clasificar
                return readFilee(pathPaciente.dir + "/Class_MHE.csv");
              } else {
                console.log("Archivo Estudio Encefalopatia Hipatica Minima no encontrado");
                return -1;
              }
              //despues de la promesa anterior resuelta ejecuto obtengo la de leer el archivo
            }).then((data) => {
              //Leo el Estudio CSV 
              paciente.resultados_IA_EHM = parseInt(data);
              addCheck += 1;
              verifyPromises(addCheck, paciente.Pathologies_Studied.length, paciente, resolve);
            }).catch(err => {
              //console.log(err);
            });
            break;


          case 9:

            //console.log('Mild Coginitive Imporment');
            //verifico si el archivo del estudio existe para porder realizar la clasificacion
            checkFiles(pathPaciente, "Class_DCL.csv").then(res => {
              //si existe leo el archivo
              if (res === true) {
                //leo el archivo correspondiente al estudio a clasificar
                return readFilee(pathPaciente.dir + "/Class_DCL.csv");
              } else {
                console.log("Archivo Estudio Mild Coginitive Imporment no encontrado");
                return -1;
              }
              //despues de la promesa anterior resuelta ejecuto obtengo la de leer el archivo
            }).then((data) => {
              //Leo el Estudio CSV 
              paciente.resultados_IA_demencias[2] = parseInt(data);
              addCheck += 1;
              verifyPromises(addCheck, paciente.Pathologies_Studied.length, paciente, resolve);
            }).catch(err => {
              //console.log(err);
            });
            break;


          case 10:

            //console.log('parkinsonimos ');
            //verifico si el archivo del estudio existe para porder realizar la clasificacion
            checkFiles(pathPaciente, "Class_PKS.csv").then(res => {
              //si existe leo el archivo
              if (res === true) {
                //leo el archivo correspondiente al estudio a clasificar
                return readFilee(pathPaciente.dir + "/Class_PKS.csv");
              } else {
                console.log("Archivo Estudio parkinsonimos no encontrado");
                return -1;
              }
              //despues de la promesa anterior resuelta ejecuto obtengo la de leer el archivo
            }).then((data) => {
              //Leo el Estudio CSV 
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
  //console.log(addCheck, Pathologies_Studied.length);
}




module.exports = { clasificador, upDateClasificadorJson };