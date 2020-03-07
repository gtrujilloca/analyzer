//libreria de file system
const fs = require("fs");
//libreria de path
const extname = require("path");
// Vamos a requerir del modulo que provee Node.js 
const { searchFiles } = require("./azure");
//clase para correr funciines de comando bash
const starProcess = require("./runProcess");
//funciones system file para manejo de archivos
const  jsonEditFile =require('./jsonEditFile');
const { readFilee, createFile, deleteFile } = require('./fs');
let runProcess = null;


//singlenton de intancia de funcion para proceso de consola
if(!runProcess){
  runProcess = starProcess();
}

//Funcion muestra archivo que contiene una carpeta y explora sus hijos
function searchFilesOscann(path) {
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
              jsonEditFile(path + "/" + files[i], 1).then(dataJson =>{
                var string = path.split("/");
                folderPadre = string[string.length-1];
                readFilee(path + "/" + files[i]).then(jsonData => {
                  console.log("json 2",JSON.parse(jsonData));
                })
                //console.log(dataJson,path, folderPadre);
                //esta linea cuando se cumpla la promesa 
                searchFiles(path, JSON.parse(jsonData), folderPadre);
                
              });
            }
          }).catch(err => {
            console.log("error al ejecutar el proceso"+ err);
          });
        }
      }
    }
  })
}


module.exports = searchFilesOscann;
//showFiles();




