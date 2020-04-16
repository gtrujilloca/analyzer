// const chalk = require('chalk');
const { BlobServiceClient } = require('@azure/storage-blob');
const fs = require('fs');
const azure = require('azure-storage');
const blobService = azure.createBlobService();


//funciones system file para manejo de archivos


const fileService = azure.createFileService();
//conexion con azure
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const urlAzure = 'https://externalstorageaccount.blob.core.windows.net/entrada/';
const CONTAINER_NAME_ENTRADA = process.env.CONTAINER_NAME_ENTRADA;
const CONTAINER_NAME = process.env.CONTAINER_NAME ;
const ROUTER_DOWNLOAD_BLOB = process.env.ROUTER_DOWNLOAD_BLOB;
let CONTAINER_CLIENT = null;
/**
 *
 */

async function initServiceClient() {
  if (!CONTAINER_CLIENT) {
    const CLIENT_SERVICE = await BlobServiceClient.fromConnectionString(
      AZURE_STORAGE_CONNECTION_STRING
    );
    CONTAINER_CLIENT = await CLIENT_SERVICE.getContainerClient(CONTAINER_NAME);
  }
}

/**
 *
 */

async function downloadBlob(blobFile) {
  try {
    if (!fs.existsSync(ROUTER_DOWNLOAD_BLOB)) {
      console.log(
        ROUTER_DOWNLOAD_BLOB +
          ' does not exist. Attempting to create this directory...'
      );
      fs.mkdirSync(ROUTER_DOWNLOAD_BLOB);
      console.log(ROUTER_DOWNLOAD_BLOB + ' created.');
    }
    // NOTE: does not handle pagination.
    var pathNew = blobFile.name.split('/');
    var pathgeneral = ROUTER_DOWNLOAD_BLOB;
    for (var i = 0; i < pathNew.length - 1; i++) {
      //verifico si el directorio donde voy a guardar existe si no lo creo
      if (!fs.existsSync(pathgeneral + '/' + pathNew[i])) {
        pathgeneral = pathgeneral + '/' + pathNew[i];
        fs.mkdirSync(pathgeneral);
      } else {
        pathgeneral = pathgeneral + '/' + pathNew[i];
      }
    }
    //instancio la conexion con el servicio a azure para descargar el blob al directorio seleccionado
    const response = await getBlob(blobFile.name);
    return response;
  } catch (error) {
    console.error(error);
  }
}

function getBlob(blobFileName) {
  return new Promise((resolve, reject) => {
    blobService.getBlobToLocalFile(
      CONTAINER_NAME,
      blobFileName,
      ROUTER_DOWNLOAD_BLOB + '/' + blobFileName,
      function(error) {
        if (error) {
          console.log(error);
          reject(false);
        } else {
          //console.log(' Blob ' + blobFileName + ' download finished.');
          resolve(true);
        }
      }
    );
  });
}



//funcion para subir archivo a azure recibe el nombre del container donde se va a almacenar y los datos del archivo
function pushfile(containerName, file) {
  return new Promise((resolve, reject) => {
    try {
      blobService.createBlockBlobFromLocalFile(
        containerName,
        file.blobName,
        file.pathFile,
        function(error, result, response) {
          if (!error) {
            resolve({ res: response.isSuccessful, result: result });
          } else {
            reject(error);
          }
        }
      );
    } catch (error) {
      //console.log(error);
      reject(error);
    }
  });
}

async function showBlobs(blobServiceClient, containerName) {
  // Get a reference to a container
  const containerClient = await blobServiceClient.getContainerClient(
    containerName
  );
  console.log('\nListing blobs...');

  // List the blob(s) in the container.
  for await (const blob of containerClient.listBlobsFlat()) {
    console.log(blob.name);
  }
}



async function veryContainer(containerName) {
  return new Promise((resolve, reject)=>{
    try {
      blobService.createContainerIfNotExists(containerName, function(
         err,
         result,
         response
       ) {
         if (err) {
           console.log("Couldn't create container %s", containerName);
           reject(err);
           console.error(err);
         } else {
            resolve(result);
           }
           // Your code goes here
         }
      )
    } catch (error) {
      reject(error);
    }
  });
}

function deleteContainer (container, callback) {
  // Delete the container.
  blobService.deleteContainerIfExists(container, function (error) {
    if (error) {
      console.log(error);
    } else {
      console.log('Deleted the container ' + container);
      callback();
    }
  });
}

async function deletedBlobForPath(blobFile) {
  try {
    var pathLevels = blobFile.name.split('/');
    var filesDeleted = 0;
    // List the blob(s) in the container.
    for await (const blob of CONTAINER_CLIENT.listBlobsFlat()) {
      var pathLevelsBlob = blob.name.split('/');
      //verifico los blobs correspondientes al grupo del json encontrado
      if (
        pathLevelsBlob[0] === pathLevels[0] &&
        pathLevelsBlob[1] === pathLevels[1] &&
        pathLevelsBlob[2] === pathLevels[2]
      ) {
        filesDeleted++;
        const response = await deleteBlob(CONTAINER_NAME_ENTRADA, blob.name);
        if (!response) {
          console.log('deleted blob error');
        }
        //console.log('download blob success');
      }
    }
    console.log('Deleted Finish', ROUTER_DOWNLOAD_BLOB+'/'+blobFile.name, 'numero de blobs', filesDownloaded);     
  } catch (error) {
    console.log(error);
  }
}

async function deleteBlob(container, blob){
  return new Promise((resolve, reject)=>{
    try {
      blobService.deleteBlobIfExists(container, blob, (err, result) => {
         if(err) {
            console.log(err);
         }
         resolve(result);
      });
    } catch (error) {
      reject(error);
    }
  })
}

function veryBlob(nameContainer,blobName) {
  return new Promise((resolve, reject)=>{
    try {
      blobService.getBlobProperties(nameContainer, blobName, function(
       err,
       properties,
       status
     ) {

      if(!status) reject(false);
       if (status.isSuccessful) {
         resolve(true);
       } else {
         resolve(false);
       }
     });
    } catch (error) {
      reject(error);
    }
  })
}



module.exports = {
  pushfile,
  veryContainer, 
  veryBlob, 
  deleteBlob
};
