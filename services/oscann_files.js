const fs = require('fs');
const extname = require('path');
const { pushfile, veryBlob, deleteBlob } = require('./azure-service/azure');
const starProcess = require('./system-service/runProcess');
const { updateJson, updateJsonNumeroArchivos } = require('./system-service/jsonEditFile');
const { readFilee, deleteFolder, copyFiles, getListFile, log } = require('./system-service/fs');

const Ora = require('ora');
const chalk = require('chalk');
const spinner = new Ora();


let runProcess = null;
const {CONTAINER_NAME_ENTRADA, CONTAINER_NAME_ENTRADABACKUP, ROUTER_ENTRY_FILE}= process.env;


//singlenton de intancia de funcion para proceso de consola
if (!runProcess) {
  runProcess = starProcess();
}

//Funcion muestra archivo que contiene una carpeta y explora sus hijos
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
          readFilee(nuevoPath).then(async jsonData => {
            try {
            if (JSON.parse(jsonData).estado == 0) {
                await updateJson(nuevoPath, 1);
                let date = new Date();
                await log(`${ROUTER_DOWNLOAD_BLOB}/${pathLog}`, `Error al ejecutar comando de Octave Sh... ${date}`)
                await log(`${ROUTER_DOWNLOAD_BLOB}/${pathLog}`, `Error al ejecutar comando de Octave Sh... ${date}`)
                spinner.text = `${chalk.blue('Update estado Json =>')} paciente ${JSON.parse(jsonData).Label}`;

              }
            } catch (error) {
                spinner.fail(`${chalk.red(error)}`);
            }

              getListFile(path, async (err, filesList) => {
                try {
                  updateJsonNumeroArchivos(nuevoPath, filesList.length).then(jsonUpdate => {
                    spinner.text = `${chalk.blue('Update estado Json =>')} paciente ${JSON.parse(jsonData).Label}`;
                  }).catch(err => {
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
                    spinner.succeed(`${chalk.green('Subida al servidor finalizada =>')} ${response.res}`)
                    await pushFilesAzure(
                      filesList,
                      JSON.parse(jsonData),
                      CONTAINER_NAME_ENTRADABACKUP
                      );
                      
                    spinner.succeed(`${chalk.green('Subida al servidor finalizada Backup=>')}`)
                    spinner.text = `${chalk.green('Haciendo Copia de seguridad en el servidor')}`;

                    const datajson = await updateJson(nuevoPath, 1);
                    const res = await pushFilesAzure(fileJson, JSON.parse(jsonData), CONTAINER_NAME_ENTRADA);
                    const datajson2 = await updateJson(nuevoPath, -1);
                    spinner.text = `${chalk.magenta('Realizando backup local')}`;
                    copyFiles(path).then(resCopyfiles => {
                      if (resCopyfiles.res) {
                        deleteFolder(path).then(resDeletedFolder => {
                          if (resDeletedFolder) {
                            spinner.succeed(`${chalk.green('Backup finalizado correctamente')}`);
                            spinner.indent = 2;
                            spinner.succeed(`${chalk.green('Proceso terminado')}`);
                          } else {
                            spinner.failed(`Error al eliminar folder`);
                          }
                        }).catch(error => {
                          spinner.fail(`Error de lista de archivos${chalk.red(error)}`);
                        });
                      } else {
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
}

const pushFilesAzure = (files, jsonPaciente, containerName) => {
  return new Promise((resolve, reject) => {
    try {
      const filesFailedPush = [];
      let i = 0;
      files.forEach(async file => {
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
                filesFailedPush.push(jsonName);
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
            if (files.length > 1) {
              spinner.succeed(`${chalk.green('Subida Finalizada ...')} ${chalk.yellow(i + 1)} de ${chalk.yellow(files.length + 1)} `);
            }
            resolve({ res: true, filesFailed: filesFailedPush });
          }

        } catch (error) {
          spinner.fail(`Error al subir archivo ${chalk.red(error)}`);
        }
      });
    } catch (error) {
      spinner.fail(`Error al subir archivos ${chalk.red(error)}`);
      reject({ res: false, filesFailed: filesFailedPush });
    }
  });
}


const verifyFilesPushed = (arrayFilesFailded) => {
  return new Promise((resolve, reject) => {
    try {
      console.log('Verificando archvivos')
      if (arrayFilesFailded.length) {
        resolve(true);
      }
      resolve(false);

    } catch (error) {
      reject(false);
    }
  })
}

module.exports = searchFilesOscann;
