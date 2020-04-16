const { spawn } = require('child_process');

const starProcess = () => runCommand;

//Funcion para crear consola y recibir comando a ejecutar
const runCommand = command => {
  return new Promise((resolve, reject) => {
    try {
      //creo un comando sh
      const process = spawn('bash');
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
        resolve(response);
      });
      process.stderr.on('data', data => reject(data));
    } catch (err) {
      reject(err);
      //console.log(err);
    }
  }).catch(err =>{
    //console.log(err.toString());
  });;
};


module.exports = starProcess;
