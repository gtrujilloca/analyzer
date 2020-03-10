//funciones para manejor de archivos file system
const { readFilee } = require('./fs');
// Vamos a requerir del modulo que provee Node.js 
const searchFilesPro = require('./filesFisnishProcess');
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
        searchFilesPro(pathPaciente);
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