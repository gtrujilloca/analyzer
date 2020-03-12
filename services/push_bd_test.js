const fs = require('fs');
//invoco servicio para subir a Base de datos
const { log } = require('./fs');
// llamado child_process
const starProcess = require("./runProcess");
//llamo clases para manejo de archivos

const ROUTER_DOWNLOAD_BLOB = process.env.ROUTER_DOWNLOAD_BLOB || '/home/andresagudelo/Documentos/OCTAVEproyects/PATOLOGIAS/enProceso';

//inicializo en null una consola
let runProcess = null;

//singlenton de intancia de funcion para proceso de consola
if (!runProcess) {
  runProcess = starProcess();
}



function uploadToDBToTest(pathPaciente, pathLog) {
  var date = new Date();
  log(ROUTER_DOWNLOAD_BLOB+'/'+pathLog, 'Subiendo test y calibraciones a base de datos...'+ date).then(data=>{
      console.log(data);
  });
  searchFilesTest(pathPaciente.dir, pathLog);

}

//Funcion muestra archivo que contiene una carpeta y explora sus hijos
function searchFilesTest(path, pathLog) {
try {
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
        //console.log(fs.readdirSync(path)[i].substring(1,-1));
        //si es una carpeta llamo a metodo recursivo y inspecciono la carpeta seleccionada
        if (fs.readdirSync(path)[i].substring(1, -1) == 'C') {
          //console.log("calibracion"+fs.readdirSync(path)[i] );
          calibracion = fs.readdirSync(path)[i];
          break;
          //llamo metodo para generar un docuemento 
        }
      }
    }


    for (let i = 0; i < files.length; i++) {
      //concateno la carpeta contenedora con la carpera nueva a leer
      var stats = fs.statSync(path + "/" + files[i]);
      //verifico que el archivo sea una carpeta 
      if (stats.isDirectory()) {
        //console.log(fs.readdirSync(path)[i].substring(1,-1));
        //si es una carpeta llamo a metodo recursivo y inspecciono la carpeta seleccionada
        if (fs.readdirSync(path)[i].substring(1, -1) == 'T') {
          //creo la variable de los comando respectivos para ejecutar octave
          //console.log("split "+path.split('/')[(path.split('/').length) - 1]);
          var command = "cd /home/andresagudelo/Documentos/QTproyects/qt_mongo_prueba; ./qt_mongo_prueba '" + path + "/" + calibracion + "' '" + path + "/" + fs.readdirSync(path)[i] + "' '" + path.split('/')[(path.split('/').length) - 1] + "' '" + fs.readdirSync(path)[i] + "'";
          // promesasArraya.push(runProcess(command));
          //console.log("comando up test",command);
          runProcess(command).then(data=>{
           
          });
        }
      }
    }

    var date = new Date();
    log(ROUTER_DOWNLOAD_BLOB+'/'+pathLog, 'Test y Calibraciones Subidas a Base de Datos...'+ date).then(dataLog=>{
        console.log(dataLog);
    });  
  })
} catch (error) {
  var date = new Date();
  log(ROUTER_DOWNLOAD_BLOB+'/'+pathLog, 'Error al subir test y calibraciones a base de datos...'+ date).then(data=>{
      console.log(data);
  });
}
}




module.exports = uploadToDBToTest;