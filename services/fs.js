
//libreria de file system
const fs = require("fs");




//funcion para leer un archivo
function readFilee(path) {
    return new Promise((resolve, reject)=>{
      try {
        //creo el retorno de la lectura
        fs.readFile(path, (err, data) => {
          if(err) reject(err);
           //retorno el archivo leido
          resolve(data);
        });
      }catch(error) {
        //capturo un erro si hubo en la lectura
        reject(error);
        console.log(error);
      }
    })
  }