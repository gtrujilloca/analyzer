const fs = require('fs');
const { log } = require('../system-service/fs');
const starProcess = require('../system-service/runProcess');

const Ora = require('ora');
const chalk = require('chalk');
const spinner = new Ora();

const { ROUTER_DOWNLOAD_BLOB, ROUTER_UPLOAD_DB_TEST } = process.env;

let runProcess = null;

//singlenton de intancia de funcion para proceso de consola
if (!runProcess) {
  runProcess = starProcess();
}

const uploadToDBToTest = (pathPaciente, pathLog)  => {
  return new Promise ( async (resolve, reject) => {
    try {
      spinner.start();
      spinner.text = `${chalk.yellow('Iniciando Servicio subir a Bd TEST')}`;
      let date = new Date();
      await log(`${ROUTER_DOWNLOAD_BLOB}/${pathLog}`,`Subiendo test y calibraciones a base de datos... ${date}`);
      const res = await searchFilesTest(pathPaciente.dir, pathLog);
      if(res){
        resolve(true);
      }else{
        resolve(false);
      }
    } catch (error) {
      reject(error);
    }
  })
};

//Funcion muestra archivo que contiene una carpeta y explora sus hijos
const searchFilesTest = (path, pathLog) => {
  return new Promise((resolve, reject) => {
    try {
      spinner.text = `${chalk.yellow('Buscando Calibraiones')}`;
      fs.readdir(path, (err, files) => {
        if (err) return console.log(err);

        //Busca en las carpetas la primer calibracion de la prueba
        for (let i = 0; i < files.length; i++) {
          let stats = fs.statSync(`${path}/${files[i]}`);
          if (stats.isDirectory()) {
            if (fs.readdirSync(path)[i].substring(1, -1) == 'C') {
              calibracion = fs.readdirSync(path)[i];
              break;
            }
          }
        }
        spinner.succeed(
          `${chalk.green('Calibracion encontrada ')} ${calibracion}`
        );
        spinner.text = `${chalk.yellow('Buscando Test')}`;
        let failed = 0;
        for (let i = 0; i < files.length; i++) {
          let stats = fs.statSync(`${path}/${files[i]}`);
          if (stats.isDirectory()) {
            if (fs.readdirSync(path)[i].substring(1, -1) == 'T') {
              spinner.text = `${chalk.yellow(
                'Test encontrada, Subiando a base de datos'
              )}`;
              let command = `cd ${ROUTER_UPLOAD_DB_TEST}; ./qt_mongo_prueba '${path}/${calibracion}' '${path}/${
                fs.readdirSync(path)[i]
              }' '${path.split('/')[path.split('/').length - 1]}' '${
                fs.readdirSync(path)[i]
              }'`;
              console.log(command);
              runProcess(command).then(data => {
                if (data.code !== 0) {
                  failed++;
                  spinner.fail(
                    `${chalk.red('Error al subir TEST a la coleccion en bd ')}`
                  );
                }
              });
            }
          }
        }

        if (failed === 0) {
          spinner.succeed(`${chalk.green('Subida a Bd Test terminada')}`);
          resolve(true);
          let date = new Date();
          log(
            `${ROUTER_DOWNLOAD_BLOB}/${pathLog}`,
            `Test y Calibraciones Subidas a Base de Datos... ${date}`
          ).then(dataLog => {});
        } else {
          resolve(false);
          spinner.fail(`${chalk.red('Faltan test por subir a la base datos')}`);
        }
      });
    } catch (error) {
      reject(error);
      let date = new Date();
      log(
        `${ROUTER_DOWNLOAD_BLOB}/${pathLog}`,
        'Error al subir test y calibraciones a base de datos...' + date
      ).then(data => {});
    }
  });
};

module.exports = uploadToDBToTest;
