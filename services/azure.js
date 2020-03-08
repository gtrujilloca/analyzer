const chalk = require('chalk');
const { BlobServiceClient } = require('@azure/storage-blob');
const  searchFilesRunOctave  = require('./runoctave');
const fs = require('fs');
const azure = require('azure-storage');
const extname = require('path');
const axios = require('axios');
const uuidv1 = require('uuid/v1');
const blobService = azure.createBlobService();
const fileService = azure.createFileService();
const updateJson = require('./jsonEditFile');

//funciones system file para manejo de archivos


//const fileService = azure.createFileService();
//conexion con azure
const AZURE_STORAGE_CONNECTION_STRING =
  process.env.AZURE_STORAGE_CONNECTION_STRING;
const urlAzure =
  'https://externalstorageaccount.blob.core.windows.net/entrada/';

const CONTAINER_NAME = process.env.CONTAINER_NAME || 'entrada';
const ROUTER_DOWNLOAD_BLOB =
  process.env.ROUTER_DOWNLOAD_BLOB ||
  '/home/andresagudelo/Documentos/OCTAVEproyects/PATOLOGIAS/enProceso';
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
async function searchJsonBlob() {
  console.log('\nListing blobs...');
  // List the blob(s) in the container.
  await initServiceClient();
  for await (const blob of CONTAINER_CLIENT.listBlobsFlat()) {
    if (extname.extname(blob.name) === '.json') {
      //necesito acceder a la url y consultar la informacion de Json
      console.log(urlAzure + blob.name);
      const dataTestPacient = await axios.get(urlAzure + blob.name);
      if (dataTestPacient.data.estado === 1) {
         downloadBlobForPath(blob);
      
      }
    }
  }
  console.log('terminar');
}

async function downloadBlobForPath(blobFile) {
  try {
    var pathLevels = blobFile.name.split('/');
    var filesDownloaded = 0;
    // List the blob(s) in the container.
    for await (const blob of CONTAINER_CLIENT.listBlobsFlat()) {
      var pathLevelsBlob = blob.name.split('/');
      //verifico los blobs correspondientes al grupo del json encontrado
      if (
        pathLevelsBlob[0] === pathLevels[0] &&
        pathLevelsBlob[1] === pathLevels[1] &&
        pathLevelsBlob[2] === pathLevels[2]
      ) {
        filesDownloaded++;
        const response = await downloadBlob(blob);
        if (!response) {
          console.log('download blob error');
        }
        //console.log('download blob success');
      }
    }
    console.log('Downoload Finish', ROUTER_DOWNLOAD_BLOB+'/'+blobFile.name, 'numero de blobs', filesDownloaded);
    debugger;
    updateJson( ROUTER_DOWNLOAD_BLOB+'/'+blobFile.name, 2);
    searchFilesRunOctave(ROUTER_DOWNLOAD_BLOB+'/'+blobFile.name);     
  } catch (error) {
    console.log(error);
  }
}

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
        console.log(pathgeneral, ' created.');
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

function getListFile(dir, done) {
  var results = [];
  fs.readdir(dir, function (err, list) {
    if (err) return done(err);
    var i = 0;
    (function next() {
      var file = list[i++];
      if (!file) return done(null, results);
      file = dir + '/' + file;
      fs.stat(file, function (err2, stat) {
        if (stat && stat.isDirectory()) {
          getListFile(file, function (err3, res) {
            results = results.concat(res);
            next();
          });
        } else {
          results.push(file);
          next();
        }
      });
    })();
  });
};




/**
 * Funcion muestra archivo que contiene una carpeta y explora sus hijos
 */
function searchFiles(path, informationTestPacient, targetFolder) {
  return new Promise((resolve, reject) => {
    try {
      //leo el directorio que quiero inspeccionar
      fs.readdir(path, (err, files) => {
        //verifico que la ruta sea correcta y que no haya ningun error
        if (err) {
          return console.log(err);
        }
        console.log(chalk.red('FILES', files.length, path));
        //si no hay ningun problema realizo
        files.forEach(async (file, index) => {
          //concateno la carpeta contenedora con la carpera nueva a leer
          const pathFile = `${path}/${file}`;
          const stats = fs.statSync(pathFile);
          //verifico que el archivo sea una carpeta
          if (stats.isDirectory()) {
            //si es una carpeta llamo a metodo recursivo y inspecciono la carpeta seleccionada
            const uploaded = await searchFiles(pathFile, informationTestPacient, targetFolder);
            if (!uploaded) {
              console.log(chalk.red('ERROR UPLOAD FILES'));
              return;
            }
            console.log(chalk.green('UPLOAD', pathFile));
          } else {
            //si no es un archivo por lo tanto no lo abro y verifico que en la carpeta haya un Json para realizar la operacion
            const listFolders = path.split('/');
            if (listFolders[listFolders.length - 1] !== targetFolder) {
              pathazure = `${informationTestPacient.Hospital}/patologia${informationTestPacient.Label}/${listFolders[listFolders.length - 2]}/${listFolders[listFolders.length - 1]}/${file}`;
            } else {
              pathazure =
              informationTestPacient.Hospital+"/patologia"+informationTestPacient.Label +"/" + listFolders[listFolders.length - 1] + '/' + file;
            }
            Promise.all([pushfile('entrada', { blobName: pathazure, pathFile: pathFile }), pushfile('entradabackup', { blobName: pathazure, pathFile: pathFile })])
              .then(data => {
                if (index === files.length - 1) {
                  console.log(chalk.blue('Termine folder', file))
                  resolve(true);
                }
              }).catch(err => {
                console.log(chalk.red('ERROR', err));
                reject(false);
              });
          }
        });
      });
    } catch (error) {
      console.log(chalk.red('ERROR', err));
      reject(false);
    }
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

function downloadBlobs(containerName, destinationDirectoryPath, callback) {
  console.log('Entering downloadBlobs.');
  // Validate directory
  if (!fs.existsSync(destinationDirectoryPath)) {
    console.log(
      destinationDirectoryPath +
        ' does not exist. Attempting to create this directory...'
    );
    fs.mkdirSync(destinationDirectoryPath);
    console.log(destinationDirectoryPath + ' created.');
  }
  // NOTE: does not handle pagination.
  blobService.listBlobsSegmented(containerName, null, function(error, result) {
    if (error) {
      console.log(error);
    } else {
      var blobs = result.entries;
      var blobsDownloaded = 0;
      blobs.forEach(function(blob) {
        if (blob.name.indexOf('/') !== -1) {
          // Validate directory
          arregloDeSubCadenas = blob.name.split('/', 2);
          if (
            !fs.existsSync(
              destinationDirectoryPath + '/' + arregloDeSubCadenas[0]
            )
          ) {
            console.log(destinationDirectoryPath + ' directory no existe ');
            fs.mkdirSync(
              destinationDirectoryPath + '/' + arregloDeSubCadenas[0]
            );
            console.log(destinationDirectoryPath + ' creado.');
          }
        }
        blobService.getBlobToLocalFile(
          containerName,
          blob.name,
          destinationDirectoryPath + '/' + blob.name,
          function(error2) {
            blobsDownloaded++;

            if (error2) {
              console.log(error2);
            } else {
              console.log(' Blob ' + blob.name + ' download finished.');

              if (blobsDownloaded === blobs.length) {
                // Wait until all workers complete and the blobs are downloaded
                console.log('All files downloaded');
                callback;
              }
            }
          }
        );
      });
    }
  });
}

async function veryContainer() {
  var containerName = 'entragda';
  blobService.createContainerIfNotExists(containerName, function(
    err,
    result,
    response
  ) {
    if (err) {
      console.log("Couldn't create container %s", containerName);
      console.error(err);
    } else {
      if (result) {
        console.log('Container %s created', containerName);
      } else {
        console.log('Container %s already exists', containerName);
      }

      // Your code goes here
    }
  });
}

async function veryBlob() {
  var blobName = 'folder/';
  blobService.getBlobProperties('entrada', blobName, function(
    err,
    properties,
    status
  ) {
    if (status.isSuccessful) {
      console.log('existe');
    } else {
      console.log('no existe');
    }
  });
}

/* (async function main() {
  await searchJsonBlob();
  console.log('Done...');
})(); */



module.exports = { pushfile, searchJsonBlob, searchFiles, getListFile};
