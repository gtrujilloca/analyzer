
//libreria de file system
const fs = require("fs");
//libreria de path
const extname = require("path");
// Vamos a requerir del modulo que provee Node.js 
const clasificador = require("./clasificadores");

// llamado child_process
var exec = require('child_process').exec, child;


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
          if (readFile(path + "/" + files[i]).estado == 1) {
            console.log("para procesar");
            //llamo metodo para generar un docuemento 
            generateDocument(extname.parse(path + "/" + files[i]));
            //clasificador(extname.parse(path + "/" + files[i]));
          }
        }
      }
    }
  })
}


//funcion generar archivo .sh para ejecutar octave en octave hay que darle permisos de super usuario en el servidor por primera vez
function generateDocument(pathPaciente) {
  //creo la variable de los comando respectivos para ejecutar octave
  var comand = "cd /home/andresagudelo/Documentos/OCTAVEproyects/CodigoOctavePaciente; analyzer('" + pathPaciente.dir + "', [" + readFile(pathPaciente.dir + "/" + pathPaciente.base).Pathologies_Studied + "])";
  //creo el archivo .sh en la carpeta ejecutables
  fs.writeFile('services/OctaveEjecutables/' + pathPaciente.name + '.sh', comand, function (err, data) {
    //si hay un error lo muestro
    if (err) {
      return console.log(err);
    }
    //si no llamo la funcion cmd donde ejecuto el archivo creado respectivamente
    cmd(pathPaciente);
  });
}



//funcion Cmd para ejecutar comando de consola 
function cmd(pathPaciente) {
  // Creamos la función y pasamos el string pwd le damos permiso total al archivo creado
  child = exec('chmod 777 services/OctaveEjecutables/' + pathPaciente.name + '.sh',
    // que mostrara el comando
    function (error, stdout, stderr) {
      // Imprimimos en pantalla con console.log
      //console.log(stdout);
      // controlamos el error
      if (error !== null) {
        console.log('exec error: ' + error);
      }
    });
  // que será nuestro comando a ejecutar comando de ejececion de octave
  child = exec('octave services/OctaveEjecutables/' + pathPaciente.name + '.sh',
    // que mostrara el comando
    function (error, stdout, stderr) {
      // Imprimimos en pantalla con console.log
      //verificamos la salida para ver si ya termino el proceso de crear archivos
      if (stdout != "") {
        deleteFile('services/OctaveEjecutables/', pathPaciente.name + '.sh');
        //clasificador(pathPaciente);
      }

      // controlamos el error
      if (error !== null) {
        console.log('exec error: ' + error);
      }
    });
  //llamo a la funcion borrar archivo de ejecucion creado
}


//funcion borrar archivo
function deleteFile(path, nameFile) {
  //le damos la ruta y nombre del archivo a eliminar
  fs.unlink(path + nameFile, function (err) {
    //si hay un error 
    if (err) throw err;
    //sino muestro el resultado
    console.log('file deleted ' + nameFile);
  });
}


//funcion para leer un archivo
function readFile(path) {
  try {
    //creo el retorno de la lectura
    var file = fs.readFileSync(path, 'utf-8');
    //retorno el archivo leido
    return JSON.parse(file);
  } catch (error) {
    //capturo un erro si hubo en la lectura
    console.log(error);
  }
}

module.exports = searchFiles;
//showFiles();




