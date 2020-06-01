require('dotenv').config();
const { config } = require('../../config/index');
const { BlobServiceClient } = require('@azure/storage-blob');
const searchFilesRunOctave = require('../octave-service/runoctave');
const fs = require('fs');
const azure = require('azure-storage');
const extname = require('path');
const axios = require('axios');
const blobService = azure.createBlobService();
const { updateJson } = require('../system-service/jsonEditFile');
const { log } = require('../system-service/fs');
const logService = require('../log-service/log-service')
const Ora = require('ora');
const chalk = require('chalk');
const spinner = new Ora();

//conexion con azure
const AZURE_STORAGE_CONNECTION_STRING =
  process.env.AZURE_STORAGE_CONNECTION_STRING;
const urlAzure = 'https://externalstorageaccount.blob.core.windows.net/entrada/';


const urlAzureDownoload = 'https://externalstorageaccount.blob.core.windows.net/finalizadosbackup/';
const urlAzureDownoloadFinalizados = 'https://externalstorageaccount.blob.core.windows.net/finalizados/';
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
  spinner.text = `${chalk.gray('Iniciando busqueda ...')}`
  for await (const blob of CONTAINER_CLIENT.listBlobsFlat()) {
    spinner.text = `${chalk.blue('Buscando ...')}`
    if (extname.extname(blob.name) === '.json') {
      //necesito acceder a la url y consultar la informacion de Json
      const dataTestPacient = await axios.get(`${urlAzure}${blob.name}`);
      if (dataTestPacient.data.estado === 1) {
        spinner.succeed(`${chalk.yellow(`Blob encontrado => ${urlAzure}${blob.name}`)}`);
        await downloadBlobForPath(blob, dataTestPacient.data.files, dataTestPacient.data);
        await deletedBlobForPath(blob);
      }
    }
  }
}

async function downloadBlobForPath(blobFile, numbersFilesContainer, dataPaciente) {
  try {
    spinner.start();
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
        if (extname.extname(blob.name) !== '.avi') {
          await downloadBlob(blob);
          filesDownloaded++;
        }
        spinner.text = `Descargando ${chalk.red(filesDownloaded)} de ${chalk.yellow(numbersFilesContainer)}`;
      }
    }
    spinner.succeed(`${chalk.yellow('Descarga finalizada')} - archivos => ${chalk.yellow(filesDownloaded)} de ${chalk.yellow(numbersFilesContainer)}`);
    logService({
      label: dataPaciente.Label,
      labelGlobal: dataPaciente.Label,
      accion: 'Descarga de archivos',
      nombreProceso: 'Descargar de archivos de Azure a Servidor',
      estadoProceso: 'OK',
      codigoProceso: 200,
      descripcion: `Descargar finalizada correctamente archivos => ${filesDownloaded}`,
      fecha: new Date()
    });
    await updateJson(`${ROUTER_DOWNLOAD_BLOB}/${blobFile.name}`, 2);
    logService({
      label: dataPaciente.Label,
      labelGlobal: dataPaciente.Label,
      accion: 'Editar archivo',
      nombreProceso: 'Editar contenido Json',
      estadoProceso: 'OK',
      codigoProceso: 200,
      descripcion: `Cambio de estado delproceso de 1 a 2`,
      fecha: new Date()
    });
    searchFilesRunOctave(`${ROUTER_DOWNLOAD_BLOB}/${blobFile.name}`, dataPaciente);
  } catch (error) {
    logService({
      label: dataPaciente.Label,
      labelGlobal: dataPaciente.Label,
      accion: 'Descarga de archivos',
      nombreProceso: 'Falla al descargar archivos de Azura al servidor',
      estadoProceso: 'ERROR',
      codigoProceso: 21,
      descripcion: `Falla de descarga de archivos ${error}`,
      fecha: new Date()
    });
  }

}

// List PDF blob(s) contenedor.
async function ListPdf() {
  pdfArray = [];
  await initServiceClientBackup();
  for await (const blob of CONTAINER_CLIENT_BACKUP.listBlobsFlat()) {
    if (extname.extname(blob.name) === '.pdf') {
      const hospital = blob.name.split(`/`)[0];
      const label = blob.name.split(`/`)[1].split(`patologia_`)[1];
      const JsonName = `${urlAzureDownoload}${hospital}/patologia_${label}/paciente_${label}/paciente_${label}.json`;
      pdfArray.push({ urlPdf: urlAzureDownoload + blob.name, hospital: hospital, label: label, jsonName: JsonName, fecha: blob.properties.lastModified });
    }
  }
  return pdfArray;
}


// EndPoint descargar blob pdf
async function downloadPdf(nameHospital, NamePaciente) {
  console.log('Searching PDF Generados...');
  const nameBlobtoSearch = `${nameHospital}/patologia_${NamePaciente}/paciente_${NamePaciente}/paciente${NamePaciente}.pdf`;
  console.log(nameBlobtoSearch);
  console.log(urlAzure + nameBlobtoSearch);
  veryBlob(CONTAINER_NAME_FINALIZADOS_BACKUP, nameBlobtoSearch).then(async res => {
    if (res) await downloadBlobBackup(nameBlobtoSearch);
  });
}

// Buscar blob(s) PDf en un contenedor.
async function searchPdf(Hospital, Pacient) {
  try {
    const nameBlobtoSearch = `${Hospital}/patologia_${Pacient}/paciente_${Pacient}/paciente_${Pacient}.pdf`;
    const nameJson = `${Hospital}/patologia_${Pacient}/paciente_${Pacient}/paciente_${Pacient}.json`;
    console.log(nameBlobtoSearch);
    let arrayResponse = {};
    const res = await veryBlob(CONTAINER_NAME_FINALIZADOS_BACKUP, nameBlobtoSearch);
    console.log(res);
    if (res) {
      const dataTestPacient = await axios.get(`${urlAzureDownoload}${nameJson}`);
      arrayResponse = { data: dataTestPacient.data, urlPdf: `${urlAzureDownoload}${nameBlobtoSearch}` };
    }
    return arrayResponse;
  } catch (error) {
    console.log(error);
  }
}


async function downloadBlob(blobFile) {
  try {
    if (!fs.existsSync(ROUTER_DOWNLOAD_BLOB)) {
      spinner.text = `${chalk.red('Directorio no existe, Creando...')}`
      fs.mkdirSync(ROUTER_DOWNLOAD_BLOB);
      spinner.text = `${chalk.green('Directorio creado...')}`
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
      function (error) {
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
      function (error) {
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
        (error, result, response) => {
          if (!error) {
            resolve({ res: true, result: result });
          } else {
            reject({ res: false, result: error });
          }
        }
      );
    } catch (error) {
      reject({ res: false, result: error });
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
  return new Promise((resolve, reject) => {
    try {
      blobService.createContainerIfNotExists(containerName, function (
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

function deleteContainer(container, callback) {
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
    spinner.text = `${chalk.blue('Eliminando Blobs...')}`
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

async function deleteBlob(container, blob) {
  return new Promise((resolve, reject) => {
    try {
      blobService.deleteBlobIfExists(container, blob, (err, result) => {
        if (err) reject(err);

        resolve(result);
      });
    } catch (error) {
      reject(error);
    }
  })
}

function veryBlob(nameContainer, blobName) {
  return new Promise((resolve, reject) => {
    try {
      blobService.getBlobProperties(nameContainer, blobName, function (
        err,
        properties,
        status
      ) {

        if (err) {
          resolve(false);
        }
        if (status !== null) {
          if (status.hasOwnProperty('statusCode')) {
            if (status.statusCode === 200) {
              resolve(true);
            } else {
              resolve(false);
            }
          } else {
            reject(false);
          }
        } else {
          reject(false);
        }
      });
    } catch (error) {
      console.log("funcion error", error)
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
