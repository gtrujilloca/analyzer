const fs = require('fs');
const { log } = require('../system-service/fs');
const starProcess = require("../system-service/runProcess");


const ROUTER_DOWNLOAD_BLOB = process.env.ROUTER_DOWNLOAD_BLOB || '/home/andresagudelo/Documentos/OCTAVEproyects/PATOLOGIAS/enProceso';
const ROUTER_UPLOAD_DB_TEST = process.env.ROUTER_UPLOAD_DB_TEST;

let runProcess = null;

//singlenton de intancia de funcion para proceso de consola
if (!runProcess) {
  runProcess = starProcess();
}



const uploadToDBToTest = (pathPaciente, pathLog) => {
  let date = new Date();
  log(`${ROUTER_DOWNLOAD_BLOB}/${pathLog}`, `Subiendo test y calibraciones a base de datos... ${date}`).then(data=>{
      console.log(data);
  });
  searchFilesTest(pathPaciente.dir, pathLog);

}

//Funcion muestra archivo que contiene una carpeta y explora sus hijos
const searchFilesTest = (path, pathLog) => {
try {
  fs.readdir(path, (err, files) => {
    if (err)  return console.log(err);
  
    //Busca en las carpetas la primer calibracion de la prueba
    for (let i = 0; i < files.length; i++) {
      let stats = fs.statSync(`${path}/${files[i]}`);  
      if (stats.isDirectory()) {
        if (fs.readdirSync(path)[i].substring(1, -1) == 'C') {
          //console.log("calibracion"+fs.readdirSync(path)[i] );
          calibracion = fs.readdirSync(path)[i];
          break;
        }
      }
    }


    for (let i = 0; i < files.length; i++) {
      let stats = fs.statSync(`${path}/${files[i]}`);
      if (stats.isDirectory()) {

        if (fs.readdirSync(path)[i].substring(1, -1) == 'T') {
          let command = `cd ${ROUTER_UPLOAD_DB_TEST}; ./qt_mongo_prueba '${path}/${calibracion}' '${path}/${fs.readdirSync(path)[i]}' '${path.split('/')[(path.split('/').length) - 1]}' '${fs.readdirSync(path)[i]}'`;
          runProcess(command).then(data=>{
            console.log(`Respuesta subida a base de datos Test ${data}`);
          });
        }
      }
    }

    let date = new Date();
    log(`${ROUTER_DOWNLOAD_BLOB}/${pathLog}`, `Test y Calibraciones Subidas a Base de Datos... ${date}`).then(dataLog=>{
        console.log(dataLog);
    });  
  })
} catch (error) {
  let date = new Date();
  log(`${ROUTER_DOWNLOAD_BLOB}/${pathLog}`, 'Error al subir test y calibraciones a base de datos...'+ date).then(data=>{
      console.log(data);
  });
}
}




module.exports = uploadToDBToTest;