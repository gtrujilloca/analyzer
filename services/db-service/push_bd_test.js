require('dotenv').config();
const fs = require('fs');
const { log } = require('../system-service/fs');
const starProcess = require('../system-service/runProcess');
const logService = require('../log-service/log-service')
const Ora = require('ora');
const chalk = require('chalk');
const spinner = new Ora();

const { ROUTER_DOWNLOAD_BLOB, ROUTER_UPLOAD_DB_TEST } = process.env;

let runProcess = null;

//singlenton de intancia de funcion para proceso de consola
if (!runProcess) {
  runProcess = starProcess();
}

const uploadToDBToTest = (pathPaciente, dataPaciente)  => {
  return new Promise ( async (resolve, reject) => {
    try {
      spinner.start();
      spinner.text = `${chalk.yellow('Iniciando Servicio subir a Bd TEST')}`;
      const res = await searchFilesTest(pathPaciente.dir, dataPaciente);
      if(res){
        logService({
          label: dataPaciente.Label,
           labelGlobal: dataPaciente.Label, 
           accion:'Subida a BD',
           nombreProceso: 'Subida de TESTs a BD',
           estadoProceso: 'OK',
           codigoProceso: 200,
           descripcion: `TEST subidos a BD correctamente => ${res}`,
           fecha: new Date()
          });
        resolve(true);
      }else{
        logService({
          label: dataPaciente.Label,
           labelGlobal: dataPaciente.Label, 
           accion:'Subida a BD',
           nombreProceso: 'Subida de TESTs a BD',
           estadoProceso: 'ERROR',
           codigoProceso: 41,
           descripcion: `TEST no subidos a BD`,
           fecha: new Date()
          });
        resolve(false);
      }
    } catch (error) {
      logService({
        label: dataPaciente.Label,
         labelGlobal: dataPaciente.Label, 
         accion:'Subida a BD',
         nombreProceso: 'Subida de TESTs a BD',
         estadoProceso: 'ERROR',
         codigoProceso: 42,
         descripcion: `Error TEST no subidos a BD ${error}`,
         fecha: new Date()
        });
      reject(error);
    }
  })
};

//Funcion muestra archivo que contiene una carpeta y explora sus hijos
const searchFilesTest = (path, dataPaciente) => {
  return new Promise((resolve, reject) => {
    try {
      let calibracion = "";
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
        spinner.succeed(`${chalk.blue('Calibracion encontrada ')} ${calibracion}`);
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
          spinner.succeed(`${chalk.green('Subida a Bd Test terminada, '+failed+' archivos fallados')}`);
          resolve(true);
        } else {
          spinner.fail(`${chalk.red('Faltan test por subir a la base datos')}`);
          resolve(false);
        }
      });
    } catch (error) {
      reject(error);
      logService({
        label: dataPaciente.Label,
         labelGlobal: dataPaciente.Label, 
         accion:'Subida a BD',
         nombreProceso: 'Subida de TESTs a BD',
         estadoProceso: 'ERROR',
         codigoProceso: 43,
         descripcion: `Error TEST no subidos a BD ${error}`,
         fecha: new Date()
        });
    }
  });
};

module.exports = uploadToDBToTest;
