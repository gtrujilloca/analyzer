//libreria de file system
const fs = require('fs');
const fse = require('fs-extra');


const ROUTER_ENTRY_FILE_BACKUP = process.env.ROUTER_ENTRY_FILE_BACKUP || "entradabackup";
const ROUTER_ENTRY_FILE = process.env.ROUTER_ENTRY_FILE;

//recibe un objeto con data del paciente y el comando que se va a gardar
const createFile = data => {
  return new Promise((resolve, reject) => {
    try {
      //creo el archivo .sh en la carpeta ejecutables
      fs.writeFile(
        'services/OctaveEjecutables/' + data.pathPaciente.name + '.sh',
        data.commandOctave,
        function(err, file) {
          //si hay un error lo muestro
          if (err) reject(err);

          //si no llamo la funcion cmd donde ejecuto el archivo creado respectivamente
          resolve(file);
        }
      );
    } catch (error) {
      //capturo un erro si hubo en la lectura
      reject(error);
      //console.log(error);
    }
  }).catch(err => {
    //console.log(err);
  });
};

//funcion borrar archivo recibo un objeto data con el path de el archivo a leiminar y el nombre del archivo
const deleteFile = pathDelete => {
  return new Promise((resolve, reject) => {
    try {
      //le damos la ruta y nombre del archivo a eliminar
      fs.unlink(pathDelete, function(
        err
      ) {
        //si hay un error
        if (err) reject(err);
        //sino muestro el resultado
        resolve(pathDelete);
      });
    } catch (error) {
      //capturo un erro si hubo en la lectura
      reject(error);
      //console.log(error);
    }
  }).catch(err => {
    //console.log(err);
  });
};

//funcion borrar archivo recibo un objeto data con el path de el archivo a leiminar y el nombre del archivo
const deleteFolder = pathDelete => {
  return new Promise((resolve, reject) => {
    try {
      //le damos la ruta y nombre del archivo a eliminar
      fse.remove(pathDelete, function(
        err
      ) {
        //si hay un error
        if (err) reject(false);
        //sino muestro el resultado
        resolve(true);
      });
    } catch (error) {
      //capturo un erro si hubo en la lectura
      reject(false);
      //console.log(error);
    }
  }).catch(err => {
    //console.log(err);
  });
};

//funcion para leer un archivo
const readFilee = path => {
  return new Promise((resolve, reject) => {
    try {
      //creo el retorno de la lectura
      fs.readFile(path, (err, data) => {
        if (err) reject(err);
        //retorno el archivo leido
        resolve(data);
      });
    } catch (error) {
      //capturo un erro si hubo en la lectura
      reject(error);
      //console.log(error);
    }
  }).catch(err => {
    //console.log(err);
  });
};

//metodo de verificar archivos si existen o no en un directorio recibie path y nombre del archivo
const checkFiles = (path, className) => {
  return new Promise((resolve, reject) => {
    try {
      //leo el directorio que quiero inspeccionar
      fs.readdir(path.dir, (err, files) => {
        //verifico que la ruta sea correcta y que no haya ningun error
        if (err) {
          console.log('error al buscar archivo');
          reject(err);
        }
        //console.log(files);
        //resolve(files);
        if (files.indexOf(className) === -1) {
          //resuelvo false si no lo encuentro
          resolve(false);
        } else if (files.indexOf(className) > -1) {
          //resuelvo true si si lo encuentro
          resolve(true);
        }
      });
    } catch (err) {
      reject(err);
      console.log('error al buscar archivo');
    }
  }).catch(err => {
    //console.log(err);
  });
};


// Async/Await:
async function copyFiles(file) {
  return new Promise((resolve, reject)=>{  
    try {
     // console.log(file);
     const routeFileNew = file.split(ROUTER_ENTRY_FILE+"/")[1];
     const listFolderName = routeFileNew.split("/");
      const routeFilesNew = ROUTER_ENTRY_FILE_BACKUP+"/"+routeFileNew;
      let newPath = ROUTER_ENTRY_FILE_BACKUP;
      listFolderName.forEach(element => {
        if (!fs.existsSync(newPath)) {
          console.log(
            newPath+
              ' does not exist. Attempting to create this directory...'
          );
          fs.mkdirSync(newPath);
          console.log(newPath + ' created.');
        }
        newPath = newPath+"/"+element;
        if (!fs.existsSync(newPath)) {
          console.log(
            newPath +
              ' does not exist. Attempting to create this directory...'
          );
          fs.mkdirSync(newPath);
          console.log(newPath + ' created.');
        }
      });
      fse.copy(file, routeFilesNew).then(res=>{
        resolve({res:true, routeNew:routeFilesNew});
      }).catch(err=>{
        reject({res:false, error:err});
      });
  
    //veriicar si la carpeta contenedora existe si no la creo
    } catch (err) {
      console.error(err)
      reject({res:false, error:err});
    }
  })
}



function log(pathFile, text){
  var logger = fs.createWriteStream(pathFile, {
    flags: 'a' // 'a' means appending (old data will be preserved)
  })
  
  logger.write(text+'\n') // append string to your file
}


module.exports = {
  createFile,
  deleteFile,
  deleteFolder,
  readFilee,
  checkFiles,
  copyFiles, 
  log
};
