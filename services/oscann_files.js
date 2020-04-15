const chalk = require('chalk');
const fs = require('fs');
const extname = require('path');
const { pushfile, veryBlob, deleteBlob } = require('./azure');
const starProcess = require('./runProcess');
const { updateJson } = require('./jsonEditFile');
const {  readFilee, deleteFolder, copyFiles, getListFile } = require('./fs');


let runProcess = null;
const ROUTER_OCTAVE = process.env.ROUTER_OCTAVE || '';
const CONTAINER_NAME_ENTRADA = process.env.CONTAINER_NAME_ENTRADA || 'entrada';
const ROUTER_ENTRY_FILE = process.env.ROUTER_ENTRY_FILE;
const CONTAINER_NAME_ENTRADABACKUP = process.env.CONTAINER_NAME_ENTRADABACKUP || 'entradabackup';

//singlenton de intancia de funcion para proceso de consola
if (!runProcess) {
  runProcess = starProcess();
}

//Funcion muestra archivo que contiene una carpeta y explora sus hijos
const searchFilesOscann = (path) => {
  fs.readdir(path, (err, files) => {
    if (err) return console.log(err);
    
    for (let i = 0; i < files.length; i++) {
      let nuevoPath = `${path}/${files[i]}`;
      let stats = fs.statSync(nuevoPath);
      if (stats.isDirectory()) {
        searchFilesOscann(nuevoPath);
      } else {
        if (extname.extname(files[i]) === '.json') {
          readFilee(nuevoPath)
            .then(jsonData => {
              if (JSON.parse(jsonData).estado == 0) {
                updateJson(nuevoPath, 1).then(jsonUpdate => {
                  console.log('Update Estado Json, Procesando files...');
                });

                getListFile(path, async (err, filesList) => {
                  try {
                    const indexJson = filesList.indexOf(nuevoPath);
                    if (indexJson !== -1) {
                      const fileJson = filesList.splice(indexJson, 1);
                      const response = await pushFilesAzure(
                        filesList,
                        JSON.parse(jsonData)
                      );
                      const datajson = await updateJson(nuevoPath, 1);
                      const res = await pushFilesAzure(fileJson, JSON.parse(jsonData));
                      console.log('Archivos Subidos al servidor');
                      const datajson2 = await updateJson(nuevoPath,-1);

                      copyFiles(path)
                        .then(resCopyfiles => {
                          if (resCopyfiles.res) {
                            deleteFolder(path).then(resDeletedFolder => {
                              if (resDeletedFolder) {
                                console.log('Carpeta de test eliminada satisfactoriamente');
                              } else {
                                console.log('error al eliminar carpeta de test');
                              }
                            });
                          } else {
                            console.log('error hacer copia de seguridad');
                          }
                        })
                        .catch(err => {
                          console.log(err);
                        });
                    }
                  } catch (error) {
                    console.log(error);
                  }
                });
              }
            })
            .catch(err => {
              console.log('error al ejecutar el proceso' + err);
            });
        }
      }
    }
  });
}

const  pushFilesAzure = (files, jsonPaciente) => {
  return new Promise((resolve, reject) => {
    try {
      let i = 0;
      files.forEach(async file => {
        const blobName = file.split(`${ROUTER_ENTRY_FILE}/`)[1];
        const existBlob = await veryBlob(CONTAINER_NAME_ENTRADA,`${jsonPaciente.Hospital}/patologia_${jsonPaciente.Label}/paciente_${blobName}`);
        if (existBlob) {
          if (extname.extname(blobName) === '.json') {
            await deleteBlob(
              CONTAINER_NAME_ENTRADA,
              `${jsonPaciente.Hospital}/patologia_${jsonPaciente.Label}/paciente_${jsonPaciente.Label}/paciente_${jsonPaciente.Label}.json`);
            await deleteBlob(
              CONTAINER_NAME_ENTRADABACKUP,
              `${jsonPaciente.Hospital}/patologia_${jsonPaciente.Label}/paciente_${jsonPaciente.Label}/paciente_${jsonPaciente.Label}.json`);
          } else {
            await deleteBlob(
              CONTAINER_NAME_ENTRADA,`${jsonPaciente.Hospital}/patologia_${jsonPaciente.Label}/paciente_${blobName}`);
            await deleteBlob(
              CONTAINER_NAME_ENTRADABACKUP,`${jsonPaciente.Hospital}/patologia_${jsonPaciente.Label}/paciente_${blobName}`);
          }
        }
        if (extname.extname(blobName) !== '.avi') {
          if (extname.extname(blobName) === '.json') {
            await pushfile(CONTAINER_NAME_ENTRADA, {
              pathFile: file,
              blobName:`${jsonPaciente.Hospital}/patologia_${jsonPaciente.Label}/paciente_${jsonPaciente.Label}/paciente_${jsonPaciente.Label}.json`});
            await pushfile(CONTAINER_NAME_ENTRADABACKUP, {
              pathFile: file,
              blobName:`${jsonPaciente.Hospital}/patologia_${jsonPaciente.Label}/paciente_${jsonPaciente.Label}/paciente_${jsonPaciente.Label}.json`});
            console.log(i, files.length);
          } else {
            await pushfile(CONTAINER_NAME_ENTRADA, {
              pathFile: file,
              blobName:`${jsonPaciente.Hospital}/patologia_${jsonPaciente.Label}/paciente_${blobName}`
            });
            await pushfile(CONTAINER_NAME_ENTRADABACKUP, {
              pathFile: file,
              blobName:`${jsonPaciente.Hospital}/patologia_${jsonPaciente.Label}/paciente_${blobName}`
            });
          }
        }
        i++;
        console.log(i, files.length);
        if (i === files.length) {
          resolve(true);
        }
      });
    } catch (error) {
      i++;
      console.log(error);
      reject(false);
    }
  });
}

module.exports = searchFilesOscann;
