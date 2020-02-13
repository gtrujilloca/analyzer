
//libreria de file system
const fs = require("fs");
//libreria de path
const extname = require("path");
// Vamos a requerir del modulo que provee Node.js 
// llamado child_process
var exec = require('child_process').exec, child;

var path = "/home/andresagudelo/Documentos/OCTAVEproyects/PATOLOGIAS";

//Funcion muestra archivo que contiene una carpeta y explora sus hijos
function showFiles(path){
  //leo el directorio que quiero inspeccionar

    fs.readdir(path, (err, files) => {
      //verifico que la ruta sea correcta y que no haya ningun error
        if(err){
            return console.log(err);
        }
        //si no hay ningun problema realizo 
        for(let i=0;i < files.length;i++){
          //concateno la carpeta contenedora con la carpera nueva a leer
            var stats = fs.statSync ( path+"/"+files[i] );
            //verifico que el archivo sea una carpeta 
            if(stats.isDirectory()){
                    //console.log(extname.dirname(path+"/"+ files[i]));
                    //si es una carpeta llamo a metodo recursivo y inspecciono la carpeta seleccionada
                    showFiles(path+"/"+files[i]);
            }else{
              //si no es un archivo por lo tanto no lo abro y verifico que en la carpeta haya un Json para realizar la operacion 
              if(extname.extname(files[i]) === ".json"){
                console.log(extname.parse(path+"/"+files[i]));
                //llamo metodo para generar un docuemento 
                  generateDocument(extname.parse(path+"/"+files[i]).dir, extname.parse(path+"/"+files[i]).name);
                  //deleteFile();
              }
            }
        }
    })
}





//funcion generar archivo .sh para ejecutar octave en octave hay que darle permisos de super usuario en el servidor por primera vez
function generateDocument(pathPaciente, nameFile){
  //creo la variable de los comando respectivos para ejecutar octave
  var comand = "cd /home/andresagudelo/Documentos/OCTAVEproyects/CodigoOctavePaciente; pwd; analyzer('"+ pathPaciente +"',[1 2 3 5 9 10]);";
  //creo el archivo .sh en la carpeta ejecutables
  fs.writeFile('OctaveEjecutables/'+nameFile+'.sh', comand , function (err,data) {
    //si hay un error lo muestro
    if (err) {
      return console.log(err);
    }
    //si no llamo la funcion cmd donde ejecuto el archivo creado respectivamente
    console.log(data);
    cmd(nameFile);
  });
}






//funcion Cmd para ejecutar comando de consola 
function cmd(nameFile){
  // Creamos la función y pasamos el string pwd le damos permiso total al archivo creado
  child = exec('chmod 777 OctaveEjecutables/'+nameFile+'.sh',
  // Pasamos los parámetros error, stdout la salida andres1006
  // que mostrara el comando
  function (error, stdout, stderr) {
    // Imprimimos en pantalla con console.log
    console.log(stdout);
    // controlamos el error
    if (error !== null) {
      console.log('exec error: ' + error);
    }
  });
  // que será nuestro comando a ejecutar comando de ejececion de octave
  child = exec('octave OctaveEjecutables/'+nameFile+'.sh',
  // Pasamos los parámetros error, stdout la salida andres1006
  // que mostrara el comando
  function (error, stdout, stderr) {
    // Imprimimos en pantalla con console.log
    console.log(stdout);
    // controlamos el error
    if (error !== null) {
      console.log('exec error: ' + error);
    }
  });
  //llamo a la funcion borrar archivo de ejecucion creado
  deleteFile(nameFile);
}




//funcion borrar archivo
function deleteFile(nameFile){
  //esperamos 10 segundo para eleiminar el archivo esperando que se ejecute y cree ectave los archivos
  setTimeout(() => {
    //le damos la ruta y nombre del archivo a eliminar
  fs.unlink('OctaveEjecutables/'+nameFile+'.sh', function(err) {
    //si hay un error 
    if (err) throw err;
     console.log('file deleted '+ nameFile);
   });
  }, 10000);
}




//funcion de leer archivo
function readFile(){
  //damos la ruta del arichivo a leer 
  fs.readFile('/home/andresagudelo/Documentos/OCTAVEproyects/PATOLOGIAS/temp/ControlesGrupoA/paciente_grupoA_1/a.json', 'utf-8', (err, data) => {
    //si hay un error lo vemos
    if(err) {
      console.log('error: ', err);
      //sino encontro y leyo el archivo
    } else {
      //ejecutamos y convertimos el archivo a Json
      console.log("Encontrado y convertido");
      console.table(JSON.parse(data));
    }
  });
  console.log('Buscando...');
}






//deleteFile();
readFile();
//generateDocument();
//cmd();
// console.log(extname.basename(path));
// console.log(process.env.PATH.split(path.delimiter));
// console.log(extname.dirname(path));
//showFiles(path);





