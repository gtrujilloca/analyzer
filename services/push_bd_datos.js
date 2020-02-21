var fs = require('fs');
//var converter = new Converter({});
// llamado child_process
var exec = require('child_process').exec, child;
//const path = "/home/andresagudelo/Documentos/OCTAVEproyects/PATOLOGIAS/Hospital1/ControlesGrupoA/Paciente_bueno/Estudio_AD.csv";


function uploadToDBToDatos(pathPaciente) {
    console.log("subir a DAtos paciente "+ pathPaciente);
    generateDocument(pathPaciente.dir, "db_datosPy" );
    
    
}


//funcion generar archivo .sh para ejecutar octave en octave hay que darle permisos de super usuario en el servidor por primera vez
function generateDocument(path,nameClass) {
    //creo la variable de los comando respectivos para ejecutar octave
    var comand = "cd  /home/andresagudelo/Documentos; python ./uploadToDBfromCSV.py '/home/andresagudelo/Documentos/OCTAVEproyects/PATOLOGIAS/Hospital1'";
    //creo el archivo .sh en la carpeta ejecutables
    fs.writeFile('services/OctaveEjecutables/' + nameClass + '.sh', comand, function (err, data) {
      //si hay un error lo muestro
      if (err) {
        return console.log(err);
      }
      //si no llamo la funcion cmd donde ejecuto el archivo creado respectivamente
      cmd(nameClass);
    });
  }
  


//funcion Cmd para ejecutar comando de consola 
function cmd(nameClass) {
  console.log(nameClass);
    // Creamos la función y pasamos el string pwd le damos permiso total al archivo creado
    child = exec('chmod 777 services/OctaveEjecutables/' + nameClass + '.sh',
      // que mostrara el comando
      function (error, stdout, stderr) {
        // Imprimimos en pantalla con console.log
        //console.log(stdout);
        // controlamos el error
        if (error !== null) {
          console.log('exec error al crear bash: ' + error);
        }
      });
    // que será nuestro comando a ejecutar comando de ejececion de octave
    child = exec('./services/OctaveEjecutables/' + nameClass + '.sh',
      // que mostrara el comando
      function (error, stdout, stderr) {
        // Imprimimos en pantalla con console.log
        //verificamos la salida para ver si ya termino el proceso de crear archivos
        //console.log(stdout + " " + stderr);
        if (stdout != "") {
          //console.log("termine clasificador " + nameClass + " = "+ stdout)
          //llamo a la funcion borrar archivo de ejecucion creado
          deleteFile('services/OctaveEjecutables/', nameClass + '.sh');
        }
  
        // controlamos el error
        if (error !== null) {
          console.log('exec error al ejecutar bash: ' + stdout);
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





module.exports = uploadToDBToDatos;