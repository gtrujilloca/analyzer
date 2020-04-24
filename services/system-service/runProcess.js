const { spawn } = require('child_process');

const starProcess = () => runCommand;

//Funcion para crear consola y recibir comando a ejecutar
const runCommand = command => {
  return new Promise((resolve, reject) => {
    try {
      //creo un comando sh
      const response = {};
      const process = spawn('bash');
      //ejecutar el comando
      process.stdin.end(command);
      //ejectuto el comando enviado en consola y guardo la data
      process.stdout.on('data', data => {
        response.data = data.toString();
      });
      //ejectuto el comando enviado en consola y guardo cuando haya terminado el proceso
      process.on('close', code => {
        //console.log(code)
        response.code = code;
        resolve(response);
      });

      process.stderr.on('data', data => {
        //console.log(data.toString())
        response.data = data.toString();
        reject(response);
      })
    } catch (err) {
      response.data = err;
      response.code = 0;
      reject(response);
    }
  }).catch(err =>{
    console.log("error al ejecutar bash", err);
  });;
};


module.exports = starProcess;
