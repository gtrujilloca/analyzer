
//libreria de file system
const fs = require("fs");
//libreria de path
const extname = require("path");
// llamado child_process
var exec = require('child_process').exec, child;


function clasificador(pathPaciente) {
  var jsonpaciente = readFile(pathPaciente.dir + "/" + pathPaciente.base);
  //if (jsonpaciente.Results_types)
  console.log("result types " + jsonpaciente.Results_types.AI);
  console.log(" " + jsonpaciente.Pathologies_Studied.length);

  for (let i = 0; i < jsonpaciente.Pathologies_Studied.length; i++) {
    switch (jsonpaciente.Pathologies_Studied[i]) {
      case 1:
        console.log('Sin especificar ' + jsonpaciente.Pathologies_Studied[i]);
        break;
      case 2:
        console.log('Alzheimer = posicion ' + i);
        console.log(checkFiles(pathPaciente, "Estudio_AD.csv"));
        //generateDocument(pathPaciente, "Estudio_AD", "Clasificador_EA_vs_control/src");
        break;
      case 3:
        console.log('Parkinson = posicion ' + i);
        //generateDocument(pathPaciente, "Estudio_PD", "Clasificador_Parkinson_vs_control/src");
        break;
      case 5:
        console.log('frontotemporal demental = posicion ' + i);
        //generateDocument(pathPaciente, "Estudio_FTD" , "Clasificador_DFT_vs_control/src");
        break;
      case 9:
        console.log('mild coginitive imporment = posicion ' + i);
        //generateDocument(pathPaciente, "Estudio_MCI", "Clasificador_DCL_vs_control/src");
        break;
      case 8:
        console.log('encefalopatia Hipatica minima = posicion ' + i);
        //generateDocument(pathPaciente, "Estudio_MHE", "Clasificador_EHM_vs_control/src");
        break;
      case 10:
        console.log('parkinsonimos = posicion ' + i);
        //generateDocument(pathPaciente, "Estudio_PKS", "Clasificador_Parkinsionismos_vs_control/src");
        break;
      default:
        console.log('Sin especificar ' + jsonpaciente.Pathologies_Studied[i]);
    }
  }
}

///home/andresagudelo/Documentos/OCTAVEproyects/PATOLOGIAS/Hospital1/ControlesGrupoA/Paciente_bueno

//funcion generar archivo .sh para ejecutar octave en octave hay que darle permisos de super usuario en el servidor por primera vez
function generateDocument(pathPaciente, nameClass, rutaClass) {
  //creo la variable de los comando respectivos para ejecutar octave
  var comand = "cd /home/andresagudelo/Documentos/OCTAVEproyects/Clasificadores/" + rutaClass + "; ./main " + pathPaciente.dir + " " + nameClass + ".csv;";
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
  // Creamos la función y pasamos el string pwd le damos permiso total al archivo creado
  child = exec('chmod 777 services/OctaveEjecutables/' + nameClass + '.sh',
    // que mostrara el comando
    function (error, stdout, stderr) {
      // Imprimimos en pantalla con console.log
      console.log(stdout);
      // controlamos el error
      if (stdout !== null) {
        console.log('exec error: ' + stdout);
      }
    });
  // que será nuestro comando a ejecutar comando de ejececion de octave
  child = exec('./services/OctaveEjecutables/' + nameClass + '.sh',
    // que mostrara el comando
    function (error, stdout, stderr) {
      // Imprimimos en pantalla con console.log
      //verificamos la salida para ver si ya termino el proceso de crear archivos
      console.log(stdout + " " + stderr);
      if (stdout != "") {
        console.log("termine clasificador " + nameClass)
        deleteFile('services/OctaveEjecutables/', nameClass + '.sh');
      }

      // controlamos el error
      if (stdout !== null) {
        console.log('exec error: ' + stdout);
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



module.exports = clasificador;