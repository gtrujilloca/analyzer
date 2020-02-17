var fs = require('fs');
//libreria de path
const extname = require("path");


var path = "/home/andresagudelo/Documentos/OCTAVEproyects/PATOLOGIAS";

                

function searchJson(path) {
    const promise = new Promise(function (resolve, reject) {
        
            fs.readdir(path, function (err, files) {
                if (reject(err)) throw err;

                //si no hay ningun problema realizo 
                for (let i = 0; i < files.length; i++) {
                    //concateno la carpeta contenedora con la carpera nueva a leer
                    var stats = fs.statSync(path + "/" + files[i]);
                    //verifico que el archivo sea una carpeta 
                    if (stats.isDirectory()) {
                        //si es una carpeta llamo a metodo recursivo y inspecciono la carpeta seleccionada
                        searchJson(path + "/" + files[i]);
                    } else {
                        //si no es un archivo por lo tanto no lo abro y verifico que en la carpeta haya un Json para realizar la operacion 
                        if (extname.extname(files[i]) === ".json") {
                            //console.log("archivo");
                            resolve("encontre");
                        }
                    }
                }
                
            });
            return promise;
    });
}


async function clasificadores (path) {
    try {
      const result = await searchJson(path);
      //console.log(result)
    } catch (err) {
      //return console.log(err.message);
    }
  }

  clasificadores(path);


function cFunc() {
    console.log("Pase a otra funcion");
}