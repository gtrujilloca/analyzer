//libreria de path
const extname = require("path");
// // Vamos a requerir del modulo que provee Node.js 
const { pushfile, veryBlob, deleteBlob} = require("./azurePush");

const { updateJson } = require('./jsonEditFile');
const { readFilee, deleteFolder, copyFilesFinalizados, getListFile, log} = require('./fs');
// // let runProcess = null;


const CONTAINER_NAME_FINALIZADOS = process.env.CONTAINER_NAME_FINALIZADOS || "finalizados";
const CONTAINER_NAME_FINALIZADOS_BACKUP = process.env.CONTAINER_NAME_FINALIZADOS_BACKUP || "finalizadosbackup";

const ROUTER_DOWNLOAD_BLOB = process.env.ROUTER_DOWNLOAD_BLOB || '/home/andresagudelo/Documentos/OCTAVEproyects/PATOLOGIAS/enProceso';


//Funcion muestra archivo que contiene una carpeta y explora sus hijos
function filesFisnishProcess(pathPaciente, pathLog) {

 
      console.log("subir azure ",pathPaciente);
      const jsonDirectory = pathPaciente.dir+"/"+pathPaciente.base;
      //leo el directorio que quiero inspeccionar
            //si no es un archivo por lo tanto no lo abro y verifico que en la carpeta haya un Json para realizar la operacion 
            if (pathPaciente.ext === ".json") {
              //console.log(extname.parse(jsonDirectory));
              readFilee(jsonDirectory).then(jsonData => {
                if (JSON.parse(jsonData).estado == 2) {
                  console.log("json para subir a azure", JSON.parse(jsonData));
        
                      const path = extname.parse(extname.parse(pathPaciente.dir).dir); 
                      getListFile(path.dir, async (err, filesList) => {
                        try {
                          const indexJson = filesList.indexOf(jsonDirectory);
                          if (indexJson !== -1) {
                            const fileJson = filesList.splice(indexJson, 1);
                            const response = await pushFilesAzureFinish(filesList, JSON.parse(jsonData));
                            const datajson = await updateJson(jsonDirectory, 3)
                            const res = await pushFilesAzureFinish(fileJson, JSON.parse(datajson));
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
                var date = new Date();
                log(ROUTER_DOWNLOAD_BLOB+'/'+pathLog, 'Error al subir archivos subidos a azure correctamente ... arror en el archivo '+i+" "+err+" "+ date).then(data=>{
                    console.log(data);
                });
                console.log("error al ejecutar el proceso lista " , err);
              });
            }

 
}

function pushFilesAzureFinish(files,jsonPaciente, pathLog) {
  console.log("entre a subir a azure");
  return new Promise((resolve, reject) => {
    try {
      let i = 0;
      files.forEach(async (file) => {
        const blobName = file.split(ROUTER_DOWNLOAD_BLOB + "/")[1];
        const existBlob = await veryBlob(CONTAINER_NAME_FINALIZADOS, blobName)

          if(existBlob){
              await deleteBlob(CONTAINER_NAME_FINALIZADOS, blobName);
              await deleteBlob(CONTAINER_NAME_FINALIZADOS_BACKUP, blobName);
              
          }    
          await pushfile(CONTAINER_NAME_FINALIZADOS, { pathFile: file, blobName: blobName });
          await pushfile(CONTAINER_NAME_FINALIZADOS_BACKUP, { pathFile: file, blobName: blobName });
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




