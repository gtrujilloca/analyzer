var fs = require('fs');
//var converter = new Converter({});

const path = "/home/andresagudelo/Documentos/OCTAVEproyects/PATOLOGIAS/Hospital1/ControlesGrupoA/Paciente_bueno/Estudio_AD.csv";


function push_DB_test() {
    console.log("ya puedo subir a base de datos");
    
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





module.exports = push_DB_test;