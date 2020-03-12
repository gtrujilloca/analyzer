// const chalk = require('chalk');
const { BlobServiceClient } = require('@azure/storage-blob');
const  searchFilesRunOctave  = require('./runoctave');

const fs = require('fs');
const azure = require('azure-storage');
const extname = require('path');
const axios = require('axios');
const blobService = azure.createBlobService();
const {updateJson} = require('./jsonEditFile');
const {log} = require('./fs');
//funciones system file para manejo de archivos


//conexion con azure
const AZURE_STORAGE_CONNECTION_STRING =
  process.env.AZURE_STORAGE_CONNECTION_STRING;
const urlAzure =
  'https://externalstorageaccount.blob.core.windows.net/entrada/';
const CONTAINER_NAME_ENTRADA = process.env.CONTAINER_NAME_ENTRADA;

const CONTAINER_NAME = process.env.CONTAINER_NAME || 'entrada';
const CONTAINER_NAME_FINALIZADOS_BACKUP = process.env.CONTAINER_NAME_FINALIZADOS_BACKUP || 'finalizadosbackup'
let CONTAINER_CLIENT = null;
let CONTAINER_CLIENT_BACKUP = null;


const ROUTER_DOWNLOAD_BLOB = process.env.ROUTER_DOWNLOAD_BLOB || '/home/andresagudelo/Documentos/OCTAVEproyects/PATOLOGIAS/enProceso';
ROUTER_DOWNLOAD_BLOB_BACKUP = '/home/andresagudelo/Documentos/OCTAVEproyects/PATOLOGIAS/enProcesoBackup'

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

async function initServiceClientBackup() {
  if (!CONTAINER_CLIENT_BACKUP) {
    const CLIENT_SERVICE_BACKUP = await BlobServiceClient.fromConnectionString(
      AZURE_STORAGE_CONNECTION_STRING
    );
    CONTAINER_CLIENT_BACKUP = await CLIENT_SERVICE_BACKUP.getContainerClient(CONTAINER_NAME_FINALIZADOS_BACKUP);
  }
}

/**
 *
 */
async function searchJsonBlob() {
  // List the blob(s) in the container.
  for await (const blob of CONTAINER_CLIENT.listBlobsFlat()) {
    if (extname.extname(blob.name) === '.json') {
      //necesito acceder a la url y consultar la informacion de Json
      console.log(urlAzure + blob.name);
      const dataTestPacient = await axios.get(urlAzure + blob.name);
      if (dataTestPacient.data.estado === 1) {
        var date = new Date();
        log(ROUTER_DOWNLOAD_BLOB+'/logProcess.txt', 'Se encontro archivos para procesar... ', blob ," => "+urlAzure+" "+ blob.name +" => "+ date).then(data=>{
          console.log(data);
        });
        await downloadBlobForPath(blob);
        await deletedBlobForPath(blob);
      }
    }
  }
}


async function ListPdf() {
  // List the blob(s) in the container.
  pdfArray = [];
  await initServiceClientBackup();
  for await (const blob of CONTAINER_CLIENT_BACKUP.listBlobsFlat()) {
    if (extname.extname(blob.name) === '.pdf') {
          console.log(blob.name);
          pdfArray.push(blob.name);
      }
    }
    console.log(pdfArray);
}


async function downloadPdf(nameHospital, NamePaciente) {
  // List the blob(s) in the container.
  console.log('Searching PDF Generados...');
  const nameBlobtoSearch = nameHospital+'/patologia_'+NamePaciente+"/paciente_"+NamePaciente+"/paciente_"+NamePaciente+".pdf";
  console.log(nameBlobtoSearch);
  console.log(urlAzure + nameBlobtoSearch);
  veryBlob(CONTAINER_NAME_FINALIZADOS_BACKUP, nameBlobtoSearch).then(async(res)=>{
    if(res === true){
      console.log("Pdf Encontrado del paciente ");
      await downloadBlobBackup(nameBlobtoSearch);
    }
  });
  
}

async function downloadBlobForPath(blobFile) {
    try {
      var pathLevels = blobFile.name.split('/');
      const pathLog = pathLevels[0]+"/"+pathLevels[1]+"/"+pathLevels[2]+"/"+pathLevels[2]+".txt";
      var filesDownloaded = 0;
      var down = 0 ;
      // List the blob(s) in the container.
      for await (const blob of CONTAINER_CLIENT.listBlobsFlat()) {
        var pathLevelsBlob = blob.name.split('/');
        //verifico los blobs correspondientes al grupo del json encontrado
        if (
          pathLevelsBlob[0] === pathLevels[0] &&
          pathLevelsBlob[1] === pathLevels[1] &&
          pathLevelsBlob[2] === pathLevels[2]
        ) {
          if(extname.extname(blob.name)!=='.avi'){
          filesDownloaded++;
          await downloadBlob(blob); 
          console.log(down++ , filesDownloaded);

        }
        }
      }
      var date = new Date();
      log(ROUTER_DOWNLOAD_BLOB+'/logProcess.txt', 'Descargo Blobs... '+filesDownloaded+"  =>"+ date).then(data=>{
        console.log(data);
      });
      console.log('Downoload Finish', ROUTER_DOWNLOAD_BLOB+'/'+blobFile.name, 'numero de blobs', filesDownloaded);
      log(ROUTER_DOWNLOAD_BLOB+'/'+pathLog, 'Archivos Encontrados... '+blobFile.name +' \n Carpetas en directorio de descarga creado.\n  Descargando... \n Archivos descargados  ... '+filesDownloaded+"  => "+ date).then(data=>{
          console.log(data);
      });
      //deletedBlobForPath(blobFile)
      updateJson(`${ROUTER_DOWNLOAD_BLOB}/${blobFile.name}`, 2, pathLog);
      searchFilesRunOctave(ROUTER_DOWNLOAD_BLOB+'/'+blobFile.name, pathLog);     
    } catch (error) {
      var date = new Date();
      log(ROUTER_DOWNLOAD_BLOB+'/'+pathLog, 'Error al descargar Archivos...'+ date).then(data=>{
          console.log(data);
          console.log(error);
      });
    }

}

async function downloadBlob(blobFile) {
  try {
    if (!fs.existsSync(ROUTER_DOWNLOAD_BLOB)) {
      console.log(
        ROUTER_DOWNLOAD_BLOB +
          'Directorio no existe, Creando...'
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

async function downloadBlobBackup(blobFileName) {
  try {
    if (!fs.existsSync(ROUTER_DOWNLOAD_BLOB_BACKUP)) {
      console.log(
        ROUTER_DOWNLOAD_BLOB_BACKUP +
          'Directorio no existe, Creando...'
      );
      fs.mkdirSync(ROUTER_DOWNLOAD_BLOB_BACKUP);
      console.log(ROUTER_DOWNLOAD_BLOB_BACKUP + ' created.');
    }
    // NOTE: does not handle pagination.
    var pathNew = blobFileName.split('/');
    var pathgeneral = ROUTER_DOWNLOAD_BLOB_BACKUP;
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
    const response = await getBlobBackUp(blobFileName);
   
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
          resolve(true);
        }
      }
    );
  });
}

function getBlobBackUp(blobFileName) {
  return new Promise((resolve, reject) => {
    blobService.getBlobToLocalFile(
      CONTAINER_NAME_FINALIZADOS_BACKUP,
      blobFileName,
      ROUTER_DOWNLOAD_BLOB_BACKUP + '/' + blobFileName,
      function(error) {
        if (error) {
          console.log(error);
          reject(false);
        } else {
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
    console.log("Deleting Blobs...")
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
    console.log('Deleted Finish', ROUTER_DOWNLOAD_BLOB+'/'+blobFile.name, 'numero de blobs', filesDeleted);     
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
  initServiceClient,
  pushfile,
  searchJsonBlob,
  veryContainer, 
  veryBlob, 
  downloadPdf, 
  ListPdf
};
