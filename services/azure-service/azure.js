const { BlobServiceClient } = require('@azure/storage-blob');
const  searchFilesRunOctave  = require('../octave-service/runoctave');
const fs = require('fs');
const azure = require('azure-storage');
const extname = require('path');
const axios = require('axios');
const blobService = azure.createBlobService();
const { updateJson } = require('../system-service/jsonEditFile');
const { log } = require('../system-service/fs');
const Ora = require('ora');
const chalk = require('chalk');
const spinner = new Ora();

//conexion con azure
const AZURE_STORAGE_CONNECTION_STRING =
  process.env.AZURE_STORAGE_CONNECTION_STRING;
const urlAzure ='https://externalstorageaccount.blob.core.windows.net/entrada/';

const urlAzureDownoload ='https://externalstorageaccount.blob.core.windows.net/finalizadosbackup/';
const urlAzureDownoloadFinalizados ='https://externalstorageaccount.blob.core.windows.net/finalizados/';
const CONTAINER_NAME_ENTRADA = process.env.CONTAINER_NAME_ENTRADA;

const CONTAINER_NAME = process.env.CONTAINER_NAME || 'entrada';
const CONTAINER_NAME_FINALIZADOS_BACKUP = process.env.CONTAINER_NAME_FINALIZADOS_BACKUP || 'finalizadosbackup'
let CONTAINER_CLIENT = null;
let CONTAINER_CLIENT_BACKUP = null;
let CONTAINER_NAME_FINALIZADOS = process.env.CONTAINER_NAME_FINALIZADOS;

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
// Listar blob(s) en el contenedor
async function searchJsonBlob() {
  spinner.start();
  spinner.text= `${chalk.gray('Iniciando busqueda ...')}`
  for await (const blob of CONTAINER_CLIENT.listBlobsFlat()) {
    spinner.text= `${chalk.blue('Buscando ...')}`
    if (extname.extname(blob.name) === '.json') {
      //necesito acceder a la url y consultar la informacion de Json
      const dataTestPacient = await axios.get(`${urlAzure}${blob.name}`);
      if (dataTestPacient.data.estado === 1) {
        spinner.succeed(`${chalk.yellow(`Blob encontrado => ${urlAzure}${blob.name}`)}`);
        await downloadBlobForPath(blob, dataTestPacient.data.files);
        await deletedBlobForPath(blob);
      }
    }
  }
}

async function downloadBlobForPath(blobFile, numbersFilesContainer) {
  try {
    spinner.start();
    spinner.succeed(`${chalk.blue("Descargando...")}`);
    let pathLevels = blobFile.name.split('/');
    const pathLog = `${pathLevels[0]}/${pathLevels[1]}/${pathLevels[2]}/${pathLevels[2]}.txt`;
    let filesDownloaded = 0;
    for await (const blob of CONTAINER_CLIENT.listBlobsFlat()) {
      var pathLevelsBlob = blob.name.split('/');
      if (
        pathLevelsBlob[0] === pathLevels[0] &&
        pathLevelsBlob[1] === pathLevels[1] &&
        pathLevelsBlob[2] === pathLevels[2]
      ) {
      if(extname.extname(blob.name) !== '.avi'){
        filesDownloaded++;
        await downloadBlob(blob); 
      }
      spinner.text = `Descargando ${chalk.red(filesDownloaded)} de ${chalk.yellow(numbersFilesContainer)}`;
    }
    }
    spinner.succeed(`Archivos descargados ${chalk.yellow(filesDownloaded)} de ${chalk.yellow(numbersFilesContainer)}`);
    log(ROUTER_DOWNLOAD_BLOB+'/'+pathLog, 'Archivos Encontrados... '+blobFile.name +' \n Carpetas en directorio de descarga creado.\n  Descargando... \n Archivos descargados  ... '+filesDownloaded+"  => "+ date).then(data=>{
    
    });
    updateJson(`${ROUTER_DOWNLOAD_BLOB}/${blobFile.name}`, 2);
    searchFilesRunOctave(ROUTER_DOWNLOAD_BLOB+'/'+blobFile.name, pathLog);     
  } catch (error) {
    var date = new Date();
    log(ROUTER_DOWNLOAD_BLOB+'/'+pathLog, 'Error al descargar Archivos...'+ date).then(data=>{
        console.log(data);
        console.log(error);
    });
  }

}

// List PDF blob(s) contenedor.
async function ListPdf() {
  pdfArray = [];
  await initServiceClientBackup();
  for await (const blob of CONTAINER_CLIENT_BACKUP.listBlobsFlat()) {
    if (extname.extname(blob.name) === '.pdf') {
          pdfArray.push(urlAzureDownoload+blob.name);
      }
    }
    console.log(pdfArray);
    return pdfArray;
}


// EndPoint descargar blob pdf
async function downloadPdf(nameHospital, NamePaciente) {
  console.log('Searching PDF Generados...');
  const nameBlobtoSearch = `${nameHospital}/patologia_${NamePaciente}/paciente_${NamePaciente}/paciente${NamePaciente}.pdf`;
  console.log(nameBlobtoSearch);
  console.log(urlAzure + nameBlobtoSearch);
  veryBlob(CONTAINER_NAME_FINALIZADOS_BACKUP, nameBlobtoSearch).then( async res =>{
    if (res) await downloadBlobBackup(nameBlobtoSearch);
  });
}

// Buscar blob(s) PDf en un contenedor.
async function searchPdf(Hospital, Pacient) {
  console.log('Searching PDF Generados...');
  const nameBlobtoSearch = `${Hospital}/patologia_${Pacient}/paciente_${Pacient}/paciente_${Pacient}.pdf`;
  console.log(nameBlobtoSearch);
  console.log(urlAzureDownoloadFinalizados + nameBlobtoSearch);
  let path = '';
  const res = await veryBlob(CONTAINER_NAME_FINALIZADOS, nameBlobtoSearch);
    if(res) path = nameBlobtoSearch;
return path;
}


async function downloadBlob(blobFile) {
  try {
    if (!fs.existsSync(ROUTER_DOWNLOAD_BLOB)) {
      spinner.text= `${chalk.red('Directorio no existe, Creando...')}`
      fs.mkdirSync(ROUTER_DOWNLOAD_BLOB);
      spinner.text= `${chalk.green('Directorio creado...')}`
    }
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
    spinner.start();
    spinner.text= `${chalk.blue('Eliminando Blobs...')}`
    var pathLevels = blobFile.name.split('/');
    var filesDeleted = 0;
    for await (const blob of CONTAINER_CLIENT.listBlobsFlat()) {
      var pathLevelsBlob = blob.name.split('/');
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
      }
    }
    spinner.succeed(`${chalk.red('Blobs eliminados...')} ${filesDeleted}`);
      
  } catch (error) {
    console.log(error);
  }
}

async function deleteBlob(container, blob){
  return new Promise((resolve, reject)=>{
    try {
      blobService.deleteBlobIfExists(container, blob, (err, result) => {
         if(err) reject(err);
         
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
  ListPdf, 
  searchPdf,
  deleteBlob
};
