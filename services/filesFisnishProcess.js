const extname = require("path");
const { pushfile, veryBlob, deleteBlob} = require("./azure-service/azurePush");
const { updateJson } = require('./system-service/jsonEditFile');
const { readFilee, deleteFolder, copyFilesFinalizados, getListFile, log} = require('./system-service/fs');

const Ora = require('ora');
const chalk = require('chalk');
const spinner = new Ora();

const CONTAINER_NAME_FINALIZADOS = process.env.CONTAINER_NAME_FINALIZADOS;
const CONTAINER_NAME_FINALIZADOS_BACKUP = process.env.CONTAINER_NAME_FINALIZADOS_BACKUP;
const ROUTER_DOWNLOAD_BLOB = process.env.ROUTER_DOWNLOAD_BLOB;


//Funcion muestra archivo que contiene una carpeta y explora sus hijos
function filesFisnishProcess(pathPaciente, pathLog) {
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
                                    spinner.succed(`${chalk.green(`Copia de seguridad terminada satisfactoriamente`)}`);
                                  } else {
                                    console.log("error al eliminar");
                                  }
                                });
                              } else {
                                console.log("error hacer copia de seguridad");
                              }
                            }).catch((err) => {
                              console.log(err);
                            });
                          }
                        } catch (error) {
                          console.log(error);
                        }
                      });
                
    
                }
              }).catch(err => {
                var date = new Date();
                log(`${ROUTER_DOWNLOAD_BLOB}/${pathLog}`, `Error al subir archivos subidos a azure correctamente ... error en el archivo ${i} ${err} ${date}`).then(data=>{
                    console.log(data);
                });
                console.log("error al ejecutar el proceso lista " , err);
              });
            }

 
}

function pushFilesAzureFinish(files) {
  spinner.text= `${chalk.yellow(`Subiendo Archvos a Azure`)}`
  return new Promise((resolve, reject) => {
    try {
      let i = 0;
      files.forEach(async (file) => {
        const blobName = file.split(`${ROUTER_DOWNLOAD_BLOB}/`)[1];
        const existBlob = await veryBlob(CONTAINER_NAME_FINALIZADOS, blobName)

          if(existBlob){
              await deleteBlob(CONTAINER_NAME_FINALIZADOS, blobName);
              await deleteBlob(CONTAINER_NAME_FINALIZADOS_BACKUP, blobName); 
          }    
          await pushfile(CONTAINER_NAME_FINALIZADOS, { pathFile: file, blobName: blobName });
          await pushfile(CONTAINER_NAME_FINALIZADOS_BACKUP, { pathFile: file, blobName: blobName });
          i++;
          if(files.length > 1){
            spinner.text= `Subiendo ... ${chalk.red(i+1)} de ${chalk.yellow(files.length+1)} `;
          }
          console.log(i++, files.length)
          if (i === files.length) {
            if(files.length > 1){
              spinner.succeed(`${chalk.green('Subida Finalizada ...')} ${chalk.yellow(i+1)} de ${chalk.yellow(files.length+1)} `);
            }
            resolve(true);
          }
      });
    } catch (error) {
      i++;
      console.log(error);
      reject(false);
    }
  })
}


module.exports = filesFisnishProcess;




