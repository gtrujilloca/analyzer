//const chalk = require('chalk');
//libreria de file system
//const fs = require("fs");
//libreria de path
const extname = require("path");
// // Vamos a requerir del modulo que provee Node.js 
const { pushfile, veryBlob, deleteBlob} = require("./azurePush");
// // //const { searchFiles } = require("./azure");
// // //clase para correr funciines de comando bash
// // const starProcess = require("./runProcess");
// // //funciones system file para manejo de archivos
const { updateJson } = require('./jsonEditFile');
const { readFilee, deleteFolder, copyFilesFinalizados, getListFile} = require('./fs');
// // let runProcess = null;

const ROUTER_DOWNLOAD_BLOB = process.env.ROUTER_DOWNLOAD_BLOB;

const CONTAINER_NAME_FINALIZADOS = process.env.CONTAINER_NAME_FINALIZADOS || "finalizados";
const CONTAINER_NAME_FINALIZADOS_BACKUP = process.env.CONTAINER_NAME_FINALIZADOS_BACKUP || "finalizadosbackup";

// //singlenton de intancia de funcion para proceso de consola
// if (!runProcess) {
//   runProcess = starProcess();
// }

//Funcion muestra archivo que contiene una carpeta y explora sus hijos
function filesFisnishProcess(pathPaciente) {
  debugger;
  console.log("subir azure ",pathPaciente);
  const jsonDirectory = pathPaciente.dir+"/"+pathPaciente.base;
  console.log("path para subir a azure"+jsonDirectory);
  //leo el directorio que quiero inspeccionar
        //si no es un archivo por lo tanto no lo abro y verifico que en la carpeta haya un Json para realizar la operacion 
        if (pathPaciente.ext === ".json") {
          //console.log(extname.parse(jsonDirectory));
          readFilee(jsonDirectory).then(jsonData => {
            if (JSON.parse(jsonData).estado == 2) {
              console.log("json para subir a azure", JSON.parse(jsonData));
              console.log("path para guardar en el array ", extname.parse(pathPaciente.dir));
              const path = extname.parse(extname.parse(pathPaciente.dir).dir); 
              getListFile(path.dir, async (err, filesList) => {
                try {
                  console.log(filesList);
                  const indexJson = filesList.indexOf(jsonDirectory);
                  if (indexJson !== -1) {
                    const fileJson = filesList.splice(indexJson, 1);
                    const response = await pushFilesAzureFinish(filesList, JSON.parse(jsonData));
                    console.log("response push files", response);
                    const datajson = await updateJson(jsonDirectory, 3)
                    const res = await pushFilesAzureFinish(fileJson, JSON.parse(datajson));
                    console.log("res json" + res);
                    console.log("temine Subir a azure");
                    const datajson2 = await updateJson(jsonDirectory, -1)
                    console.log(datajson2);


                    copyFilesFinalizados(path.dir).then(resCopyfiles => {
                      if (resCopyfiles.res) {
                        deleteFolder(path.dir).then(resDeletedFolder => {
                          console.log(resDeletedFolder);
                          if (resDeletedFolder) {
                            console.log("elimine folder");
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
            console.log("error al ejecutar el proceso lista " , err);
          });
        }
 
}

function pushFilesAzureFinish(files,jsonPaciente) {
  console.log("entre a subir a azure");
  return new Promise((resolve, reject) => {
    try {
      let i = 0;
      console.log(files.length);
      files.forEach(async (file) => {
        const blobName = file.split(ROUTER_DOWNLOAD_BLOB + "/")[1];
        const existBlob = await veryBlob(CONTAINER_NAME_FINALIZADOS, blobName)
        console.log(existBlob);
          if(existBlob){
              await deleteBlob(CONTAINER_NAME_FINALIZADOS, blobName);
              await deleteBlob(CONTAINER_NAME_FINALIZADOS_BACKUP, blobName);
              
          }    
          await pushfile(CONTAINER_NAME_FINALIZADOS, { pathFile: file, blobName: blobName });
          await pushfile(CONTAINER_NAME_FINALIZADOS_BACKUP, { pathFile: file, blobName: blobName });
          console.log(i, files.length);
          i++;
          if (i === files.length) {
            console.log("termine de subir azure");
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




