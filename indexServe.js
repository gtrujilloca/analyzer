const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const { config } = require('./config/index');
const Ora = require('ora');
const chalk = require('chalk');
const spinner = new Ora();
const email = require('./routes/mailgun-routers/mail-router')

  
app.use(bodyParser());
email(app);

 app.listen(config.port, function(){
      spinner.start();
      spinner.succeed(`${chalk.green(`Listening http://localhost:${config.port}`)}`)
     
 });
