//libreria de file system
const fs = require('fs');
const fse = require('fs-extra');
const extname = require('path');

const ROUTER_ENTRY_FILE_BACKUP = process.env.ROUTER_ENTRY_FILE_BACKUP ;
const ROUTER_ENTRY_FILE = process.env.ROUTER_ENTRY_FILE ;
const ROUTER_DOWNLOAD_BLOB = process.env.ROUTER_DOWNLOAD_BLOB ;
const ROUTER_DOWNLOAD_BLOB_BACKUP = process.env.ROUTER_DOWNLOAD_BLOB_BACKUP ;


//recibe un objeto con data del paciente y el comando que se va a guardar
const createFile = data => {
  return new Promise((resolve, reject) => {
    try {
      fs.writeFile(`services/OctaveEjecutables/${data.pathPaciente.name}.sh`,
        data.commandOctave,
        function(err, file) {
          if (err) reject(err);
          resolve(file);
        }
      );
    } catch (error) {
      reject(error);
    }
  }).catch(err => {
    //console.log(err);
  });
};

//Borrar archivo 
const deleteFile = pathDelete => {
  return new Promise((resolve, reject) => {
    try {
      fs.unlink(pathDelete, function(err) {
        if (err) reject(err);
        resolve(pathDelete);
      });
    } catch (error) {
      reject(error);
      console.log(error);
    }
  }).catch(err => {
    //console.log(err);
  });
};

//Borrar Carpeta
const deleteFolder = pathDelete => {
  return new Promise((resolve, reject) => {
    try {
      fse.remove(pathDelete, function(err) {
        if (err) reject(false);
        resolve(true);
      });
    } catch (error) {
      reject(false);
    }
  }).catch(err => {
    //console.log(err);
  });
};

//Leer un archivo
const readFilee = path => {
  return new Promise((resolve, reject) => {
    try {
      fs.readFile(path, (err, data) => {
        if (err) reject(err);
        resolve(data);
      });
    } catch (error) {
      reject(error);
    }
  }).catch(err => {
    //console.log(err);
  });
};

//Verificar archivo
const checkFiles = (path, className) => {
  return new Promise((resolve, reject) => {
    try {
      fs.readdir(path.dir, (err, files) => {
        if (err) reject(err);

        if (files.indexOf(className) === -1) {
          resolve(false);
        } else if (files.indexOf(className) > -1) {
          resolve(true);
        }
      });
    } catch (err) {
      reject(err);
    }
  }).catch(err => {
    //console.log(err);
  });
};


// Async/Await: Copiar Archivos
async function copyFiles(file) {
  return new Promise((resolve, reject)=>{  
    try {
    const routeFileNew = file.split(`${ROUTER_ENTRY_FILE}/`)[1];
    const listFolderName = routeFileNew.split("/");
    const routeFilesNew = `${ROUTER_ENTRY_FILE_BACKUP}/${routeFileNew}`;
      let newPath = ROUTER_ENTRY_FILE_BACKUP;
      //verifica si las rutas existen
      listFolderName.forEach(element => {
        if (!fs.existsSync(newPath)) {
          fs.mkdirSync(newPath);
          console.log(`${newPath} created.`);
        }
        newPath = `${newPath}/${element}`;
        if (!fs.existsSync(newPath)) {
          fs.mkdirSync(newPath);
          console.log(`${newPath} created.`);
        }
      });
      fse.copy(file, routeFilesNew).then(res=>{
        resolve({res:true, routeNew:routeFilesNew});
      }).catch(err=>{
        reject({res:false, error:err});
      });
  
    } catch (err) {
      console.error(err)
      reject({res:false, error:err});
    }
  })
}

// Async/Await: 
async function copyFilesFinalizados(file) {
  return new Promise((resolve, reject)=>{  
    try {
     console.log(file);
     const routeFileNew = file.split(`${ROUTER_DOWNLOAD_BLOB}/`)[1];
     const listFolderName = routeFileNew.split("/");
      const routeFilesNew = `${ROUTER_DOWNLOAD_BLOB_BACKUP}/${routeFileNew}`;
      let newPath = ROUTER_DOWNLOAD_BLOB_BACKUP;
      listFolderName.forEach(element => {
        if (!fs.existsSync(newPath)) {
          fs.mkdirSync(newPath);
          console.log(`${newPath} created.`);
        }
        newPath = newPath+"/"+element;
        if (!fs.existsSync(newPath)) {
          fs.mkdirSync(newPath);
          console.log(`${newPath} created.`);
        }
      });
      fse.copy(file, routeFilesNew).then(res=>{
        resolve({res:true, routeNew:routeFilesNew});
      }).catch(err=>{
        reject({res:false, error:err});
      });

    } catch (err) {
      console.error(err)
      reject({res:false, error:err});
    }
  })
}

//Optengo rutas de un directorio
function getListFile(dir, done) {
  let results = [];
  fs.readdir(dir, function (err, list) {
    if (err) return done(err);
    let i = 0;
    (function next() {
      let file = list[i++];
      if (!file) return done(null, results);
      file = `${dir}/${file}`;
      fs.stat(file, function (err2, stat) {
        if (stat && stat.isDirectory()) {
          getListFile(file, function (err3, res) {
            results = results.concat(res);
            next();
          });
        } else {
          if (extname.extname(file) !== '.avi'){
            results.push(file);
          }
          next();
        }
      });
    })();
  });
};



function log(pathFile, text){
  return new Promise((resolve, reject)=>{
    try {
      var logger = fs.createWriteStream(pathFile, {
        flags: 'a' 
      })
      logger.write(text+'\n');
      resolve(text);
    } catch (error) {
      reject(error);
    }
  })
}


module.exports = {
    createFile,
    deleteFile,
    deleteFolder,
    readFilee,
    checkFiles,
    copyFiles,
    copyFilesFinalizados,
    getListFile,
    log
};