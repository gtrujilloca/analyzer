const fs = require('fs');
const extname = require('path');
const { pushfile, veryBlob, deleteBlob } = require('./azure-service/azure');
const starProcess = require('./system-service/runProcess');
const { updateJson, updateJsonNumeroArchivos } = require('./system-service/jsonEditFile');
const { readFilee, deleteFolder, copyFiles, getListFile, getListJson } = require('./system-service/fs');
const logService = require('./log-service/log-service')

const isOnline = require('is-online');
const util = require('util');

const Ora = require('ora');
const chalk = require('chalk');
const spinner = new Ora();


let runProcess = null;
let ListRoutFiles = {};
const { CONTAINER_NAME_ENTRADA, CONTAINER_NAME_ENTRADABACKUP, ROUTER_ENTRY_FILE } = process.env;
process.filesPush = [];

//singlenton de intancia de funcion para proceso de consola
if (!runProcess) {
  runProcess = starProcess();
}


const updateListRoutersProcess = ()=>{
  return new Promise(async (resolve, reject)=>{
    const getListJsonPromise = util.promisify(getListJson);
    const listJsonRouters = await getListJsonPromise(ROUTER_ENTRY_FILE).catch(err => console.log(`Error obtener lista de Json ${err}`));
    if(listJsonRouters.length !== 0){
    for await (file of listJsonRouters) {
        const jsonData = await readFilee(file).catch(err => console.log(`Error obtener lista de Json ${err}`));
          if (JSON.parse(jsonData).estado === 0) {
            if(process.filesPush.indexOf(file) === -1){
              process.filesPush.push(file);
              console.log("elemento nuevo ", file)
            }
          }
      };
      if(process.filesPush.length === 0){
        resolve(false);
      }
      resolve(true);
    }
  }).catch(err =>{
    reject(err)
  })
}

//Funcion muestra archivo que contiene una carpeta y explora sus hijos
const searchFilesOscann = async () => {
  spinner.text = `${chalk.green('Buscando archivos para subir...')}`;
  spinner.start();
  if (await isOnline()) {
    
    const respFilesProcess = await updateListRoutersProcess();
    console.log(process.filesPush, respFilesProcess)
    if(process.filesPush.length !== 0){
        process.estadoServidor = true;
        let file = process.filesPush[0];   
        console.log(extname.dirname(file))

        const listFilestestPromise = util.promisify(getListFile)
        const listFilestest = await listFilestestPromise(extname.dirname(file)).catch(err => { spinner.fail(`${chalk.red(err)}`); });
        const indexJson = listFilestest.indexOf(file);
       
        if (indexJson !== -1) { //Envio el json al final para que suba de ultimo
          listFilestest.push(file)
          listFilestest.splice(indexJson, 1)
        }
        const jsonPaciente = JSON.parse(await readFilee(file));
        await updateJson(file, 1).catch(err => { spinner.fail(`${chalk.red(err)}`); });
        const res = await pushFilesAzure(listFilestest, jsonPaciente, CONTAINER_NAME_ENTRADA);
        console.log(res);
        if(!res.res){
          await updateJson(file, 0).catch(err => { spinner.fail(`${chalk.red(err)}`); });
        }else{
          await updateJson(file, -1).catch(err => { spinner.fail(`${chalk.red(err)}`); });
          await copyFiles(extname.dirname(file)).catch(err => { spinner.fail(`${chalk.red(err)}`); });
          await deleteFolder(extname.dirname(file)).catch(err => { spinner.fail(`${chalk.red(err)}`); });       
          process.filesPush.splice(0, 1)
        }
        process.estadoServidor=false;
      }
    
    
  }
  else
    console.log('Sin conexion a internet');
}

/* //Funcion muestra archivo que contiene una carpeta y explora sus hijos
const searchFilesOscann = (path) => {
  spinner.text = `${chalk.green('Buscando archivos para subir...')}`;
  spinner.start();
  fs.readdir(path, (err, files) => {
    if (err) return console.log(err);

    for (let i = 0; i < files.length; i++) {
      let nuevoPath = `${path}/${files[i]}`;
      let stats = fs.statSync(nuevoPath);
      if (stats.isDirectory()) {
        searchFilesOscann(nuevoPath);
      } else {
        if (extname.extname(files[i]) === '.json') {
          readFilee(nuevoPath).then(jsonData => {
            if (JSON.parse(jsonData).estado == 0) {
              updateJson(nuevoPath, 1).then(jsonUpdate => {
                logService({
                  label: JSON.parse(jsonData).Label,
                   labelGlobal:JSON.parse(jsonData).Label, 
                   accion:'Editar Archivo',
                   nombreProceso: 'Cambiar de estado Json',
                   estadoProceso: 'OK',
                   codigoProceso: 200,
                   descripcion: "estado de 0 a 1",
                   fecha: new Date()
                  });
                spinner.text = `${chalk.blue('Update estado Json =>')} paciente ${JSON.parse(jsonData).Label}`;
              }).catch(err => {
                spinner.fail(`${chalk.red(error)}`);
              });

              getListFile(path, async (err, filesList) => {
                try {
                  updateJsonNumeroArchivos(nuevoPath, filesList.length).then(jsonUpdate => {
                    spinner.text = `${chalk.blue('Update estado Json =>')} paciente ${JSON.parse(jsonData).Label}`;
                    logService({
                      label: JSON.parse(jsonData).Label,
                       labelGlobal:JSON.parse(jsonData).Label, 
                       accion:'Editar Archivo',
                       nombreProceso: 'Actualizar numero de archivos',
                       estadoProceso: 'OK',
                       codigoProceso: 200,
                       descripcion: `Numero de archivos ${filesList.length+1}`,
                       fecha: new Date()
                      });
                  }).catch(err => {
                    logService({
                      label: JSON.parse(jsonData).Label,
                       labelGlobal:JSON.parse(jsonData).Label, 
                       accion:'Editar Archivo',
                       nombreProceso: 'Actualizar numero de archivos',
                       estadoProceso: 'Error',
                       codigoProceso: 11,
                       descripcion:`Error al listar archivos ${err}`,
                       fecha: new Date()
                      });
                    spinner.fail(`${chalk.red(err)}`);
                  });

                  const indexJson = filesList.indexOf(nuevoPath);
                  if (indexJson !== -1) {
                    
                    const fileJson = filesList.splice(indexJson, 1);
                    spinner.text = `${chalk.green('Subiendo archivos al servidor')}`;
                    const response = await pushFilesAzure(
                      filesList,
                      JSON.parse(jsonData),
                      CONTAINER_NAME_ENTRADA
                    );
                    if(response.res){
                      logService({
                        label: JSON.parse(jsonData).Label,
                         labelGlobal: JSON.parse(jsonData).Label, 
                         accion:'Subir archivos',
                         nombreProceso: 'Subir archivos a Azure',
                         estadoProceso: 'OK',
                         codigoProceso: 200,
                         descripcion: `Archivos subidos ${filesList.length+1} => Archivos no subidos ${response.filesFailed.length}`,
                         fecha: new Date()
                        });
                        spinner.succeed(`${chalk.green('Subida al servidor finalizada =>')} ${response.res} ${JSON.parse(jsonData).Label}`)
                      }else{
                        spinner.fail(`${chalk.green('Error subida al servidor finalizada =>')} ${response} ${JSON.parse(jsonData).Label}`)

                    }
                    const responseBackup = await pushFilesAzure(
                      filesList,
                      JSON.parse(jsonData),
                      CONTAINER_NAME_ENTRADABACKUP
                      );
                      if(responseBackup.res){
                      logService({
                        label: JSON.parse(jsonData).Label,
                         labelGlobal: JSON.parse(jsonData).Label, 
                         accion:'Subir archivos',
                         nombreProceso: 'Subir archivos a Azure Backup',
                         estadoProceso: 'OK',
                         codigoProceso: 200,
                         descripcion: `Archivos subidos ${filesList.length+1} => Archivos no subidos ${response.filesFailed.length}`,
                         fecha: new Date()
                        });
                        spinner.succeed(`${chalk.green('Subida al servidor finalizada Backup=>')}`)
                      }
                    spinner.text = `${chalk.green('Haciendo Copia de seguridad en el servidor')}`;

                    const datajson = await updateJson(nuevoPath, 1);
                    const res = await pushFilesAzure(fileJson, JSON.parse(jsonData), CONTAINER_NAME_ENTRADA);
                    const datajson2 = await updateJson(nuevoPath, -1);
                    spinner.text = `${chalk.magenta('Realizando backup local')}`;
                    copyFiles(path).then(resCopyfiles => {
                      if (resCopyfiles.res) {
                        deleteFolder(path).then(resDeletedFolder => {
                          if (resDeletedFolder) {
                            logService({
                              label: JSON.parse(jsonData).Label,
                               labelGlobal:JSON.parse(jsonData).Label, 
                               accion:'Copia de seguridad',
                               nombreProceso: 'Copia de seguridad datos locales',
                               estadoProceso: 'OK',
                               codigoProceso: 200,
                               descripcion: `Copia de seguridad realizada en el equipo local`,
                               fecha: new Date()
                              });
                              spinner.succeed(`${chalk.green('Subida al servidor finalizada =>')} ${response.res}`)
                            spinner.succeed(`${chalk.green('Backup finalizado correctamente')}`);
                            spinner.succeed(`${chalk.green('Proceso terminado')}`);
                          } else {
                            logService({
                              label: JSON.parse(jsonData).Label,
                               labelGlobal:JSON.parse(jsonData).Label, 
                               accion:'Copia de seguridad',
                               nombreProceso: 'copia de seguridad datos locales',
                               estadoProceso: 'ERROR',
                               codigoProceso: 13,
                               descripcion: `Error al hacer copia de seguridad en el equipo local`,
                               fecha: new Date()
                              });
                            spinner.failed(`Error al eliminar folder`);
                          }
                        }).catch(error => {
                          logService({
                            label: JSON.parse(jsonData).Label,
                             labelGlobal:JSON.parse(jsonData).Label, 
                             accion:'Obtener Archivos prueba',
                             nombreProceso: 'Obtener lista de ruta de los archivos de una prueba',
                             estadoProceso: 'ERROR',
                             codigoProceso: 14,
                             descripcion: `Error al obtener los archivos del paciente ${error}`,
                             fecha: new Date()
                            });
                          spinner.fail(`Error de lista de archivos${chalk.red(error)}`);
                        });
                      } else {
                        logService({
                          label: JSON.parse(jsonData).Label,
                           labelGlobal:JSON.parse(jsonData).Label, 
                           accion:'Copia de seguridad',
                           nombreProceso: 'Copia de seguridad local',
                           estadoProceso: 'ERROR',
                           codigoProceso: 15,
                           descripcion: `Errorhacer copia de seguridad en el equipo local ${error}`,
                           fecha: new Date()
                          });
                        spinner.failed(`Error al hacer backup ${chalk.red(error)}`);
                      }
                    }).catch(err => {
                      spinner.fail(`${chalk.red(error)}`);
                    })
                  }
                } catch (error) {
                  spinner.fail(`${chalk.red(error)}`);
                }
              })
            }
          })
        }
      }
    }
  })
} */



const pushFilesAzure = (files, jsonPaciente, containerName) => {
  return new Promise(async (resolve, reject) => {
    try {
      spinner.text = `${chalk.green('Subiendo Archivos...')}`;
      spinner.start();
      let i = 0;
      let filesFailedPush = [];
      for await (let file of files) {
        //files.forEach(async file => {
        try {
          const blobName = file.split(`${ROUTER_ENTRY_FILE}/`)[1];
          const pathNuevo = `${jsonPaciente.Hospital}/patologia_${jsonPaciente.Label}/paciente_`;
          const jsonName = `${pathNuevo}${jsonPaciente.Label}/paciente_${jsonPaciente.Label}.json`;
          const existBlob = await veryBlob(containerName, `${pathNuevo}${blobName}`);
          if (existBlob) {
            spinner.text = `${chalk.red("Limpiando servidor")}`;
            if (extname.extname(blobName) === '.json') {
              await deleteBlob(
                containerName,
                jsonName);
            } else {
              await deleteBlob(
                containerName,
                `${pathNuevo}${blobName}`);
            }
          }
          if (extname.extname(blobName) !== '.avi') {
            if (extname.extname(blobName) === '.json') {
              try {
                await pushfile(
                  containerName, {
                  pathFile: file,
                  blobName: jsonName
                });
              } catch (error) {
                spinner.fail(`Error ${chalk.red(error.res)} => Json file ${jsonName}`);
                process.filesFailedPush.push(jsonName);
              }
            } else {
              try {
                await pushfile(
                  containerName, {
                  pathFile: file,
                  blobName: `${pathNuevo}${blobName}`
                })
              } catch (error) {
                spinner.fail(`Error ${chalk.red(error.res)} => Subir archivo ${pathNuevo}${blobName}`);
                filesFailedPush.push(`${pathNuevo}${blobName}`);
              }
            }
          }
          i++;
          if (files.length > 1) {
            spinner.text = `Subiendo ... ${chalk.red(i + 1)} de ${chalk.yellow(files.length + 1)} `;
          }
          if (i === files.length) {
            if (await verifyFilesPushed(filesFailedPush) === true) {
              if (files.length > 1) {
                spinner.succeed(`${chalk.green('Subida Finalizada ...')} ${chalk.yellow(i + 1)} de ${chalk.yellow(files.length + 1)} ${containerName} `);
              }
              resolve({ res: true, filesFailed: filesFailedPush });
            } else {
              spinner.succeed(`${chalk.green('Subida Finalizada ...')} ${chalk.yellow(i + 1)} de ${chalk.yellow(files.length + 1)} ${containerName} `);
              resolve({ res: false, filesFailed: filesFailedPush });
            }
          }

        } catch (error) {
          spinner.fail(`Error al subir archivo ${chalk.red(error)}`);
        }
        //});
      };
    } catch (error) {
      logService({
        label: JSON.parse(jsonPaciente).Label,
        labelGlobal: JSON.parse(jsonPaciente).Label,
        accion: 'Subir archivo',
        nombreProceso: 'Subir archivo a Azure',
        estadoProceso: 'ERROR',
        codigoProceso: 16,
        descripcion: `Error Subir archivo a azure ${error}`,
        fecha: new Date()
      });
      spinner.fail(`Error al subir archivos ${chalk.red(error)}`);
      reject({ res: false, filesFailed: filesFailedPush });
    }
  });
}


const verifyFilesPushed = (arrayFilesFailded) => {
  return new Promise((resolve, reject) => {
    try {
      if (arrayFilesFailded.length === 0) {
        resolve(true);
      } else {
        resolve(false);
      }
    } catch (error) {
      reject(false);
    }
  })
}

module.exports = searchFilesOscann;