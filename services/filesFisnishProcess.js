const extname = require("path");
const { pushfile, veryBlob, deleteBlob} = require("./azure-service/azurePush");
const { updateJson } = require('./system-service/jsonEditFile');
const { readFilee, deleteFolder, copyFilesFinalizados, getListFile, log} = require('./system-service/fs');
const logService = require('./log-service/log-service')

const Ora = require('ora');
const chalk = require('chalk');
const spinner = new Ora();

const { CONTAINER_NAME_FINALIZADOS, CONTAINER_NAME_FINALIZADOS_BACKUP , ROUTER_DOWNLOAD_BLOB} = process.env;



//Funcion muestra archivo que contiene una carpeta y explora sus hijos
function filesFisnishProcess(pathPaciente, dataPaciente) {
      spinner.start();
      spinner.text= `${chalk.yellow(`------- Servicio subir a Azure ------- ${pathPaciente}`)}`
      const jsonDirectory = `${pathPaciente.dir}/${pathPaciente.base}`;
      if (pathPaciente.ext === ".json") {
              readFilee(jsonDirectory).then(jsonData => {
                if (JSON.parse(jsonData).estado == 2) {
                  spinner.text= `${chalk.yellow(`Proceso finalizado, preparando archivos para subir a Azure ${JSON.parse(jsonData).Label}`)}`
                      const path = extname.parse(extname.parse(pathPaciente.dir).dir); 
                      getListFile(path.dir, async (err, filesList) => {
                        try {
                          const indexJson = filesList.indexOf(jsonDirectory);
                          if (indexJson !== -1) {
                            const fileJson = filesList.splice(indexJson, 1);
                            const response = await pushFilesAzureFinish(filesList);
                            const datajson = await updateJson(jsonDirectory, 3)
                            const res = await pushFilesAzureFinish(fileJson);
                            const datajson2 = await updateJson(jsonDirectory, -1);

                        
                            spinner.text= `${chalk.yellow(`Iniciando copia de seguridad local`)}`;
                            copyFilesFinalizados(path.dir).then(resCopyfiles => {
                              if (resCopyfiles.res) {
                                deleteFolder(path.dir).then(resDeletedFolder => {
                                  if (resDeletedFolder) {
                                    logService({
                                      label: dataPaciente.Label,
                                       labelGlobal: dataPaciente.Label, 
                                       accion:'Copia de seguridad',
                                       nombreProceso: 'Copia de seguridad servidor',
                                       estadoProceso: 'OK',
                                       codigoProceso: 200,
                                       descripcion: `Copia de seguridad en el servidor correctamente`,
                                       fecha: new Date()
                                      });
                                    spinner.succeed(`${chalk.green(`Copia de seguridad terminada satisfactoriamente`)}`);
                                    spinner.succeed(`${chalk.green(`Proceso terminado satsfactoriamente`)}`);
                                  } else {
                                    console.log("error al eliminar");
                                  }
                                });
                              } else {
                                logService({
                                  label: dataPaciente.Label,
                                   labelGlobal:dataPaciente.Label, 
                                   accion:'Copia de seguridad',
                                   nombreProceso: 'Copia de seguridad en el Servidor',
                                   estadoProceso: 'ERROR',
                                   codigoProceso: 75,
                                   descripcion: `Error al hacer copia de seguridad en el servidor`,
                                   fecha: new Date()
                                  });
                                console.log("error hacer copia de seguridad");
                              }
                            }).catch((err) => {
                              logService({
                                label: dataPaciente.Label,
                                 labelGlobal:dataPaciente.Label, 
                                 accion:'Subida de archivos',
                                 nombreProceso: 'Subiendo archivos a Azure',
                                 estadoProceso: 'ERROR',
                                 codigoProceso: 74,
                                 descripcion: `Error al subir achivos a Azure ${err}`,
                                 fecha: new Date()
                                });
                              console.log(err);
                            });
                          }
                        } catch (error) {
                          logService({
                            label: dataPaciente.Label,
                             labelGlobal:dataPaciente.Label, 
                             accion:'Subida de archivos',
                             nombreProceso: 'Subiendo archivos a Azure',
                             estadoProceso: 'ERROR',
                             codigoProceso: 73,
                             descripcion: `Error al subir achivos a Azure ${error}`,
                             fecha: new Date()
                            });
                          console.log(error);
                        }
                      });
                }
              }).catch(err => {
                logService({
                  label: dataPaciente.Label,
                   labelGlobal:dataPaciente.Label, 
                   accion:'Subida de archivos',
                   nombreProceso: 'Subiendo archivos a Azure',
                   estadoProceso: 'ERROR',
                   codigoProceso: 72,
                   descripcion: `Error al subir achivos a Azure ${err}`,
                   fecha: new Date()
                  });
                console.log("error al ejecutar el proceso lista " , err);
              });
            }

 
}

function pushFilesAzureFinish(files) {
  return new Promise((resolve, reject) => {
    try {
      spinner.text= `${chalk.yellow(`Subiendo Archvos a Azure`)}`
      let i = 0;
      files.forEach(async (file) => {
        const blobName = file.split(`${ROUTER_DOWNLOAD_BLOB}/`)[1];
        const existBlob = await veryBlob(CONTAINER_NAME_FINALIZADOS, blobName)

          if(existBlob){
              await deleteBlob(CONTAINER_NAME_FINALIZADOS, blobName);
              await deleteBlob(CONTAINER_NAME_FINALIZADOS_BACKUP, blobName); 
          }    
          const resPush = await pushfile(CONTAINER_NAME_FINALIZADOS, { pathFile: file, blobName: blobName });
          if(!resPush.res){
            console.log("fallo al subir");
          }
          const resPushBackup = await pushfile(CONTAINER_NAME_FINALIZADOS_BACKUP, { pathFile: file, blobName: blobName });
          if(!resPushBackup.res){
            console.log("fallo al subir Backup");
          }
          i++;
          if(files.length > 1){
            spinner.text= `Subiendo ... ${chalk.red(i+1)} de ${chalk.yellow(files.length+1)} `;
          }
          if (i === files.length) {
            logService({
              label: dataPaciente.Label,
               labelGlobal:dataPaciente.Label, 
               accion:'Subida de archivos',
               nombreProceso: 'Subiendo archivos a Azure',
               estadoProceso: 'OK',
               codigoProceso: 200,
               descripcion: `Achivos subidos correctamente`,
               fecha: new Date()
              });
            if(files.length > 1){
              spinner.succeed(`${chalk.green('Subida Finalizada ...')} ${chalk.yellow(i+1)} de ${chalk.yellow(files.length+1)} `);
            }
            resolve(true);
          }
      });
    } catch (error) {
      logService({
        label: dataPaciente.Label,
         labelGlobal:dataPaciente.Label, 
         accion:'Subida de archivos',
         nombreProceso: 'Subiendo archivos a Azure',
         estadoProceso: 'ERROR',
         codigoProceso: 71,
         descripcion: `Error al subir achivos a Azure ${error}`,
         fecha: new Date()
        });
      console.log(error);
      reject(false);
    }
  })
}


module.exports = filesFisnishProcess;




