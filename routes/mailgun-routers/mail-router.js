const express = require('express');
const sendEmail = require('../../services/mailgun-service/mailgun');
const { searchPdf } = require('../../services/azure-service/azure')

const Ora = require('ora');
const chalk = require('chalk');
const spinner = new Ora();

function email(app) {
  const router = express.Router();
  app.use('/api/mail', router);

  router.post('/',async function (req, res, next) {
      try {
      spinner.start();
      spinner.text = `${chalk.yellow('Conectando con el servidor')}`;
      let { email, hospital , labelPaciente }= req.body;
        const urlPdf = await searchPdf(hospital, labelPaciente);
        console.log(urlPdf);
        const data = await sendEmail("Reporte test", email, "Reporte test OA", "correo-aura", `https://externalstorageaccount.blob.core.windows.net/finalizados/${urlPdf}`);
        data.rulPdf = `https://externalstorageaccount.blob.core.windows.net/finalizados/${urlPdf}`;
        if(!data){
            res.status(500).json({
                data: data,
                message: 'Error al enviar correo'
            });
        }
                res.status(200).json({
                    data: data,
                    message: 'Mail Enviado correctamente'
                });
        spinner.succeed(`${chalk.green('Mail Enviado correctamente')}`);

    } catch (err) {
        next(err);
        spinner.failed(`${chalk.red(err)}`);
    }
  });


}

module.exports = email;
