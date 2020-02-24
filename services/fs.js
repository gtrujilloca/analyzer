//libreria de file system
const fs = require('fs');

//recibe un objeto con data del paciente y el comando que se va a gardar
const createFile = data => {
  return new Promise((resolve, reject) => {
    try {
      //creo el archivo .sh en la carpeta ejecutables
      fs.writeFile('services/OctaveEjecutables/' + data.pathPaciente.name + '.sh',data.commandOctave,
        function (err, file) {
          //si hay un error lo muestro
          if (err) reject(err);

          //si no llamo la funcion cmd donde ejecuto el archivo creado respectivamente
          resolve(file);
        }
      );
    } catch (error) {
      //capturo un erro si hubo en la lectura
      reject(error);
      console.log(error);
    }
  });
};

//funcion borrar archivo recibo un objeto data con el path de el archivo a leiminar y el nombre del archivo
function deleteFile(data) {
  return new Promise((resolve, reject) => {
    try {
      //le damos la ruta y nombre del archivo a eliminar
      fs.unlink(data.path +'/'+ data.nameFile+data.extension, function (err) {
        //si hay un error
        if (err) reject(err);
        //sino muestro el resultado
        resolve(data.nameFile);
      });
    } catch (error) {
      //capturo un erro si hubo en la lectura
      reject(error);
      console.log(error);
    }
  });
}

//funcion para leer un archivo
function readFilee(path) {
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
      console.log(error);
    }
  });
}


module.exports = {
  createFile, 
  deleteFile,
  readFilee

}