var fs = require('fs');
//var converter = new Converter({});
// llamado child_process
var exec = require('child_process').exec, child;
//libreria de path
const extname = require("path");
const path = "/home/andresagudelo/Documentos/OCTAVEproyects/PATOLOGIAS/Hospital1/ControlesGrupoA/paciente_grupoA_4";


function uploadToDBToTest(pathPaciente) {
    //generateDocument()
    console.log(pathPaciente.name);
    //console.log(path.substring(1,-1));

    //console.log(fs.readdirSync(path)[0]);
    searchFiles(pathPaciente.dir);
    
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
        //console.log(fs.readdirSync(path)[i].substring(1,-1));
        //si es una carpeta llamo a metodo recursivo y inspecciono la carpeta seleccionada
              if (fs.readdirSync(path)[i].substring(1,-1) == 'C') {
                
                //console.log("calibracion"+fs.readdirSync(path)[i] );
                calibracion=fs.readdirSync(path)[i];
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
              if (fs.readdirSync(path)[i].substring(1,-1) == 'T') {
                //console.log("calibracion "+ calibracion)
                //console.log("Test "+fs.readdirSync(path)[i]);
                //llamo generar .sh   ruta calibracion , ruta test, nombre del paciente, nombre del test  
                generateDocument(path+"/"+calibracion, path+"/"+fs.readdirSync(path)[i], path.split('/')[(path.split('/').length)-1],fs.readdirSync(path)[i]);
                //llamo metodo para generar un docuemento 
              }     
      }
    }



  })
}


//funcion generar archivo .sh para ejecutar octave en octave hay que darle permisos de super usuario en el servidor por primera vez
function generateDocument(pathCalibracion, pathTest,namePaciente, nameTest) {
    //creo la variable de los comando respectivos para ejecutar octave
    var comand = "cd /home/andresagudelo/Documentos/QTproyects/qt_mongo_prueba; ./qt_mongo_prueba '"+ pathCalibracion+"' '"+pathTest+"' '"+namePaciente+"' '"+nameTest+"'";
    //creo el archivo .sh en la carpeta ejecutables
    fs.writeFile('services/OctaveEjecutables/' + nameTest + '.sh', comand, function (err, data) {
      //si hay un error lo muestro
      if (err) {
        return console.log(err);
      }
      //si no llamo la funcion cmd donde ejecuto el archivo creado respectivamente
      cmd(nameTest);
    });
  }
  


//funcion Cmd para ejecutar comando de consola 
function cmd(nameClass) {
    // Creamos la función y pasamos el string pwd le damos permiso total al archivo creado
    child = exec('chmod 777 services/OctaveEjecutables/' + nameClass + '.sh',
      // que mostrara el comando
      function (error, stdout, stderr) {
        // Imprimimos en pantalla con console.log
        //console.log(stdout);
        cmdEjecutar(nameClass);
        // controlamos el error
        if (error !== null) {
          console.log('exec error al crear bash: ' + error);
        }
      });
    // que será nuestro comando a ejecutar comando de ejececion de octave
   
  }


//funcion Cmd para ejecutar comando de consola 
function cmdEjecutar(nameClass) {
  //ejecutamos el comando y le aumentamos el Buffer para que pueda ejecutar
  child = exec('./services/OctaveEjecutables/' + nameClass + '.sh', {maxBuffer: 1024 * 5000},
  // que mostrara el comando
  function (error, stdout, stderr) {
    // Imprimimos en pantalla con console.log
    //verificamos la salida para ver si ya termino el proceso de crear archivos
    if (stdout == "") {
      //console.log("termine clasificador " + nameClass + " = "+ stdout)
      //llamo a la funcion borrar archivo de ejecucion creado
      deleteFile('services/OctaveEjecutables/', nameClass + '.sh');
    }

    // controlamos el error
    if (error !== null) {
      console.log('exec error al ejecutar bash: ' + error + nameClass);
    }
  });
}



  //funcion borrar archivo
  function deleteFile(path, nameFile) {
    //le damos la ruta y nombre del archivo a eliminar
    fs.unlink(path + nameFile, function (err) {
      //si hay un error 
      if (err) throw err;
      //sino muestro el resultado
      //console.log('file deleted ' + nameFile);
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

  function checkFiles(path, className) {
    try {
      //leo el directorio que quiero inspeccionar
      var a = fs.readdirSync(path.dir, (err, files) => {
        //verifico que la ruta sea correcta y que no haya ningun error
        if (err) {
          return console.log(err);
        }
      })
  
      if (a.indexOf(className) === -1) {
        return false;
      } else if (a.indexOf(className) > -1) {
        return true;
      }
    } catch (err) {
      return (err);
    }
  }





module.exports = uploadToDBToTest;