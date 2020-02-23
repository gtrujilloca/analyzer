// llamado child_process
const { spawn }= require('child_process');

//closure para obtener y acceder a la funcion runCpmmand
const starProcess = () => runCommand;


//Funcion para crear consola y recibir comando a ejecutar
const runCommand = command => {
    //voy a retornar una promesa , funcion para crear el proces 
    return new Promise((resolve, reject) => {
        //creo un comando sh
        const process = spawn('bash');
        //creo un objeto para guardar la respuesta
        const response = {};
        //ejecutar el comando
        process.stdin.end(command);
        //ejectuto el comando enviado en consola y guardo la data
        process.stdout.on('data', data => {
            response.data = data.toString();
        });
        //ejectuto el comando enviado en consola y guardo cuando haya terminado el proceso
        process.on('close', code => {
            response.code = code;
            resolve(response)
        });
        //guardo la data en reject si hay un error
        process.stderr.on('data', data => reject(data));
        
    });
}




//exporto el modulo
module.exports = starProcess;