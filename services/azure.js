const { BlobServiceClient } = require('@azure/storage-blob');
const uuidv1 = require('uuid/v1');
//funciones system file para manejo de archivos
const { readFilee, createFile, deleteFile } = require('./fs');
const fs = require('fs');
//libreria de path
const extname = require("path");
const azure = require('azure-storage');
const blobService = azure.createBlobService();
const fileService = azure.createFileService();

//const fileService = azure.createFileService();
//conexion con azure
const AZURE_STORAGE_CONNECTION_STRING =
  process.env.AZURE_STORAGE_CONNECTION_STRING;

async function main() {
  console.log('Azure Blob storage v12 - JavaScript quickstart sample');
  // Create the BlobServiceClient object which will be used to create a container client
  const blobServiceClient = await BlobServiceClient.fromConnectionString(
    AZURE_STORAGE_CONNECTION_STRING
  );
  // Create a unique name for the container
  const containerName = 'entrada';
  // searchFiles(
  //   '/home/andresagudelo/Documentos/OCTAVEproyects/PATOLOGIAS/entradas/Hospital1/ControlesGrupoA/paciente_grupoA_1'
  // );
  //veryBlob();
  //walk('/home/andresagudelo/Documentos/OCTAVEproyects/PATOLOGIAS/entradas/Hospital1/ControlesGrupoA/paciente_grupoA_1', '');
  showBlobs(blobServiceClient, containerName);
  // downloadBlobs(
  //   containerName,
  //   '/home/andresagudelo/Documentos/OCTAVEproyects/PATOLOGIAS/enProceso'
  // );
  // pushfile(containerName, {
  //   blobName: 'folder/paciente_grupoA_1.json',
  //   pathFile:
  //     '/home/andresagudelo/Documentos/OCTAVEproyects/PATOLOGIAS/entradas/Hospital1/ControlesGrupoA/paciente_grupoA_1/paciente_grupoA_1.json'
  // }).then(res => {
  //   console.log(res);
  // });

  //console.log('\nUploading to Azure storage as blob:\n\t', blobName);
}

//Funcion muestra archivo que contiene una carpeta y explora sus hijos
function searchFiles(path) {
  //leo el directorio que quiero inspeccionar
  fs.readdir(path, (err, files) => {
    //verifico que la ruta sea correcta y que no haya ningun error
    if (err) {
      return console.log(err);
    }
    //si no hay ningun problema realizo
    for (let i = 0; i < files.length; i++) {
      //concateno la carpeta contenedora con la carpera nueva a leer
      var stats = fs.statSync(path + '/' + files[i]);
      //verifico que el archivo sea una carpeta
      if (stats.isDirectory()) {
        //console.log(extname.dirname(path+"/"+ files[i]));
        //si es una carpeta llamo a metodo recursivo y inspecciono la carpeta seleccionada
        console.log(files[i]);
        searchFiles(path + '/' + files[i]);
      } else {
        //si no es un archivo por lo tanto no lo abro y verifico que en la carpeta haya un Json para realizar la operacion
        console.log(path, files[i]);
      }
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
      reject(error);
    }
  });
}


var walk = function (dir, done) {
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
          walk(file, function (err3, res) {
            results = results.concat(res);
            next();
          });
        } else {
          console.log(file);
          results.push(file);
          next();
        }
      });
    })();
  });
};




async function showBlobs(blobServiceClient, containerName) {
  // Get a reference to a container
  const containerClient = await blobServiceClient.getContainerClient(
    containerName
  );
  console.log('\nListing blobs...');

  // List the blob(s) in the container.
  for await (const blob of containerClient.listBlobsFlat()) {
    if(extname.extname(blob.name) === ".json"){

      //necesito acceder a la url y consultar la informacion de Json
      console.log(blob.name);
    }
  }
}

async function showBlobNames(aborter, containerURL) {
  let marker = undefined;

  do {
    const listBlobsResponse = await containerURL.listBlobFlatSegment(
      Aborter.none,
      marker
    );
    marker = listBlobsResponse.nextMarker;
    for (const blob of listBlobsResponse.segment.blobItems) {
      console.log(` - ${blob.name}`);
    }
  } while (marker);
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
        if (blob.name.indexOf("/") !== -1) {
          // Validate directory
          arregloDeSubCadenas = blob.name.split('/', 2);
          if (!fs.existsSync(destinationDirectoryPath + '/' + arregloDeSubCadenas[0])) {
            console.log(destinationDirectoryPath +' directory no existe ');
            fs.mkdirSync(destinationDirectoryPath + '/' + arregloDeSubCadenas[0]);
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

main()
  .then(() => console.log('Done'))
  .catch(ex => console.log(ex.message));
