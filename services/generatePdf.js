//./qt_pdf_prueba "ControlesGrupoA" "paciente_grupoA_1" "A"
const path = require('path');
//funciones para manejor de archivos file system
const { readFilee, createFile, deleteFile, checkFiles } = require('./fs');
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
    //console.log(ruta[(ruta.length-2)]);

    readFilee(pathPaciente.dir + "/" + pathPaciente.base).then(data => {
        jsonpaciente = JSON.parse(data.toString());

    return grupoPaciente(jsonpaciente.Age)
      }).then(clasificacionEdad =>{
        //console.log(clasificacionEdad);
        var command = "cd /home/andresagudelo/Documentos/QTproyects/qt_pdf_prueba; ./qt_pdf_prueba '"+ruta[(ruta.length-2)]+"' '"+ruta[(ruta.length-1)]+"' '"+clasificacionEdad+"'";      
    return runProcess(command);
    }).then(data =>{
        console.log("genere pdf");
    });
      
   
    // runProcess(command).then(data =>{
    //   console.log(data);

    // })
    //generateDocument(pathPaciente.dir, "db_datosPy" );  
}



const grupoPaciente = edad =>{
    return new Promise ((resolve, reject)=>{
        if(edad >=25){
            resolve ("A");
        }
    })
}



module.exports = generatePdf;