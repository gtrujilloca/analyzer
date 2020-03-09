
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
        files.forEach(async (file) => {
          //concateno la carpeta contenedora con la carpera nueva a leer
          const pathFile = `${path}/${file}`;
          const stats = fs.statSync(pathFile);
          //verifico que el archivo sea una carpeta
          if (stats.isDirectory()) {
            //si es una carpeta llamo a metodo recursivo y inspecciono la carpeta seleccionada
            const uploades = await searchFiles(pathFile, informationTestPacient, targetFolder).then((uploaded => {
              if (!uploaded) {
                console.log(chalk.red('ERROR UPLOAD FILES'));
                return;
              }
              console.log(chalk.green('UPLOAD', pathFile));
            })).catch(err => {
              console.log(chalk.red('ERROR', err));
              reject(err);
            });
          } else {
            
            console.log(chalk.green("directorio", pathFile));

          }
        });
      });
    } catch (error) {
      console.log(chalk.red('ERROR', err));
      reject(err);
    }
  });
}




