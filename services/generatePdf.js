//./qt_pdf_prueba "ControlesGrupoA" "paciente_grupoA_1" "A"
const path = require('path');
//funciones para manejor de archivos file system
const { readFilee, createFile, deleteFile, checkFiles } = require('./fs');
// Vamos a requerir del modulo que provee Node.js 
//const { searchFiles } = require("./azure");
//clase para correr funciines de comando bash
const starProcess = require("./runProcess");
//inicializo consola vacia para ejecutar comandos
let runProcess = null;


//singlenton de intancia de funcion para proceso de consola
if(!runProcess){
  runProcess = starProcess();
}


function generatePdf(pathPaciente) {
    
    let ruta = pathPaciente.dir.split("/");
    readFilee(pathPaciente.dir + "/" + pathPaciente.base).then(data => {
        jsonpaciente = JSON.parse(data.toString());
        console.log(jsonpaciente);
    return grupoPaciente(jsonpaciente.Age)
      }).then(clasificacionEdad =>{
        console.log(clasificacionEdad);
        var command = "cd /home/andresagudelo/Documentos/QTproyects/qt_pdf_prueba; ./qt_pdf_prueba '"+ruta[(ruta.length-2)]+"' '"+ruta[(ruta.length-1)]+"' '"+pathPaciente.dir+"'";      
        console.log(command);
    return runProcess(command);
    }).then(data =>{
        //actualizo estado json y subo a azure en el contenedor de finalizados
        // readFilee(pathPaciente.dir + "/" + pathPaciente.base).then(jsonData => {
        //     if (JSON.parse(jsonData).estado == 2) {
        //       console.log("proceso finalizado listo para subir a azure", JSON.parse(jsonData));
        //       jsonEditFile(pathPaciente.dir + "/" + pathPaciente.base, 3).then(dataJson =>{
        //         var string = pathPaciente.dir.split("/");
        //         folderPadre = string[string.length-1];
        //         readFilee(pathPaciente.dir + "/" + pathPaciente.base).then(jsonData => {
        //           console.log("json 2",JSON.parse(jsonData));
        //         })
        //         //console.log(dataJson,path, folderPadre);
        //         //esta linea cuando se cumpla la promesa 
        //         //searchFiles(pathPaciente.dir, JSON.parse(jsonData).Hospital, folderPadre);
        //         console.log("subi a azure");
        //       });
        //     }
        //   }).catch(err => {
        //     console.log("error al ejecutar el proceso"+ err);
        //   });
        console.log("genere pdf"+data);
    });
      
   
    // runProcess(command).then(data =>{
    //   console.log(data);

    // })
    //generateDocument(pathPaciente.dir, "db_datosPy" );  
}

const grupoPaciente = edad =>{
    return new Promise ((resolve, reject)=>{
      console.log(edad)
        if(edad >= 18 && edad < 41){
            resolve ("A");
        }else{
            if(edad >= 41 && edad < 51){
                resolve ("B");
            }else{
                if(edad >= 51 && edad < 61){
                    resolve ("C");
                }else{
                    if(edad > 60){
                        resolve ("D");
                    }
                }   
            }
        }
    })
}



module.exports = generatePdf;