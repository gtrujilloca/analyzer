const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cron = require('node-cron');
const {log} = require('./services/system-service/fs');
const { config } = require('./config/index');
const runAutomator = require('./services/runAutomator');
const Ora = require('ora');
const chalk = require('chalk');
const spinner = new Ora();
const email = require('./routes/mailgun-routers/mail-router')

const ROUTER_DOWNLOAD_BLOB = process.env.ROUTER_DOWNLOAD_BLOB;



// try {
//   console.log(`${chalk.blue('OSCANN ANALYZER Este proceso se ejecutara cada 5 minutos ...')}`);
//   spinner.start();
//       //cron.schedule('  */1 * * * *', () => {
//         spinner.text= `${chalk.blue('Buscando Blobs en Azure ...')}`
//             spinner.color = 'green';
//               //runAutomator();
//               //});
//             } catch (error) {
//               console.log("Tarea Detenida");
//             }
  
app.use(bodyParser());
email(app);

 app.listen(config.port, function(){
     console.log(`Listening http://localhost:${config.port}`);
 });
