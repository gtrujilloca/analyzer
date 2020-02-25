
//libreria de file system
const fs = require("fs");
//libreria de path
const extname = require("path");
// Vamos a requerir del modulo que provee Node.js 
const clasificador = require("./clasificadores");
//clase para correr funciines de comando bash
const starProcess = require("./runProcess");
//funciones system file para manejo de archivos
const { readFilee, createFile, deleteFile } = require('./fs');
let runProcess = null;


//singlenton de intancia de funcion para proceso de consola
if(!runProcess){
  runProcess = starProcess();
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
      var stats = fs.statSync(path + "/" + files[i]);
      //verifico que el archivo sea una carpeta 
      if (stats.isDirectory()) {
        //console.log(extname.dirname(path+"/"+ files[i]));
        //si es una carpeta llamo a metodo recursivo y inspecciono la carpeta seleccionada
        searchFiles(path + "/" + files[i]);
      } else {
        //si no es un archivo por lo tanto no lo abro y verifico que en la carpeta haya un Json para realizar la operacion 
        if (extname.extname(files[i]) === ".json") {
          //console.log(extname.parse(path + "/" + files[i]));
          readFilee(path + "/" + files[i]).then(dataJson => {
            if (JSON.parse(dataJson).estado == 1) {
              //asigno objeto de dir, name y ext a una var
              const pathPaciente = extname.parse(path + "/" + files[i]);
              //llamo metodo para generar un docuemento 
              const commandOctave = "cd /home/andresagudelo/Documentos/OCTAVEproyects/CodigoOctavePaciente; analyzer('" + pathPaciente.dir + "', [" + JSON.parse(dataJson).Pathologies_Studied + "])";
              createFile({pathPaciente, commandOctave}).then(file =>{  
                commandRunBashOctave='octave services/OctaveEjecutables/' + pathPaciente.name + '.sh';
                return runProcess(commandRunBashOctave);
              }).then(res => {
                //verifico la respuesta del proceso si se genero un error lo capturo en un archivo log
                if(res.code !== 0) {
                  console.log("error proceso debo generar un archivo de logs");
                  return;
                }
                //si no es porque creo lo archivos correctamente
              return deleteFile({path:'services/OctaveEjecutables', nameFile:pathPaciente.name, extension:'.sh'});
              }).then(file =>{
                //console.log('elimine ejecutabe de octave de '+ file);
                //console.log('Termine proceso de Octave');
                clasificador(pathPaciente);
              }).catch(err => {
                console.log("error al ejecutar el proceso"+ err);
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


module.exports = searchFiles;
//showFiles();




