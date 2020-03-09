const chalk = require('chalk');
//libreria de file system
const fs = require("fs");
//libreria de path
const extname = require("path");
// Vamos a requerir del modulo que provee Node.js 
const { pushfile, getListFile, veryContainer, veryBlob, deleteBlob} = require("./azure");
//const { searchFiles } = require("./azure");
//clase para correr funciines de comando bash
const starProcess = require("./runProcess");
//funciones system file para manejo de archivos
const jsonEditFile = require('./jsonEditFile');
const { readFilee, createFile, deleteFolder, copyFiles} = require('./fs');
let runProcess = null;

const CONTAINER_NAME_ENTRADA = process.env.CONTAINER_NAME_ENTRADA || "entrada";
const ROUTER_ENTRY_FILE = process.env.ROUTER_ENTRY_FILE;

const CONTAINER_NAME_ENTRADABACKUP = process.env.CONTAINER_NAME_ENTRADABACKUP || "entradabackup";
//singlenton de intancia de funcion para proceso de consola
if (!runProcess) {
  runProcess = starProcess();
}

//Funcion muestra archivo que contiene una carpeta y explora sus hijos
function searchFilesOscann(path) {
  debugger;
  //leo el directorio que quiero inspeccionar
  fs.readdir(path, (err, files) => {
    //verifico que la ruta sea correcta y que no haya ningun error
    if (err) {
      return console.log(err);
    }
    //si no hay ningun problema realizo 
    for (let i = 0; i < files.length; i++) {
      //concateno la carpeta contenedora con la carpera nueva a leer
      var stats = fs.statSync(path + "/" + files[i]);
      //verifico que el archivo sea una carpeta 
      if (stats.isDirectory()) {
        //console.log(extname.dirname(path+"/"+ files[i]));
        //si es una carpeta llamo a metodo recursivo y inspecciono la carpeta seleccionada
        searchFilesOscann(path + "/" + files[i]);
      } else {
        //si no es un archivo por lo tanto no lo abro y verifico que en la carpeta haya un Json para realizar la operacion 
        if (extname.extname(files[i]) === ".json") {
          //console.log(extname.parse(path + "/" + files[i]));
          readFilee(path + "/" + files[i]).then(jsonData => {
            if (JSON.parse(jsonData).estado == 0) {
              console.log("json para subir a azure", JSON.parse(jsonData));

              getListFile(path, async (err, filesList) => {
                try {
                  const indexJson = filesList.indexOf(path + "/" + files[i]);
                  if (indexJson !== -1) {
                    const fileJson = filesList.splice(indexJson, 1);
                    const response = await pushFilesAzure(filesList, JSON.parse(jsonData));
                    console.log("response push files", response);
                    const datajson = await jsonEditFile(path + "/" + files[i], 1)
                    const res = await pushFilesAzure(fileJson, JSON.parse(jsonData));
                    console.log("res json" + res);
                    console.log("temine Subir a azure");
                    const datajson2 = await jsonEditFile(path + "/" + files[i], -1)
                    console.log(datajson2);


                    copyFiles(path).then(resCopyfiles => {
                      if (resCopyfiles.res) {
                        deleteFolder(path).then(resDeletedFolder => {
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
            console.log("error al ejecutar el proceso" + err);
          });
        }
      }
    }
  })
}

function pushFilesAzure(files,jsonPaciente) {
  let i = 0;
  return new Promise((resolve, reject) => {
    try {
      console.log(files.length);
      files.forEach(async (file) => {
        const blobName = file.split(ROUTER_ENTRY_FILE + "/")[1];
        const existBlob = await veryBlob(CONTAINER_NAME_ENTRADA, jsonPaciente.Hospital+"/patologia_"+jsonPaciente.Label+"/"+blobName)
        console.log(existBlob);
          if(existBlob){
              await deleteBlob(CONTAINER_NAME_ENTRADA, jsonPaciente.Hospital+"/patologia_"+jsonPaciente.Label+"/"+blobName);
          }    
          await pushfile(CONTAINER_NAME_ENTRADA, { pathFile: file, blobName: jsonPaciente.Hospital+"/patologia_"+jsonPaciente.Label+"/"+blobName });
          //await pushfile(CONTAINER_NAME_ENTRADABACKUP, {pathFile:file, blobName:blobName});
          console.log(i, files.length);
          i++;
          if (i === files.length) {
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


module.exports = searchFilesOscann;
//showFiles();




