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
      spinner.text = `${chalk.yellow('Conectando con el servidor email')}`;
      console.log(req.body)
      let { email, hospital , labelPaciente } = req.body;
        const resAzure = await searchPdf(hospital, labelPaciente);
        console.log("consulta", resAzure);
        if(resAzure !== null){
            console.log("encontre")
            const data = await sendEmail("Reporte test", email, "Reporte test OA", "correo-aura", `${resAzure.urlPdf}`);
            data.rulPdf = resAzure.urlPdf;
            spinner.succeed(`${chalk.yellow(data.rulPdf)}`)
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
        }else{
            res.status(500).json({
                data: {},
                message: 'Pdf no encontrado'
            });

        }

    } catch (err) {
        next(err);
        spinner.fail(`${chalk.red(err)}`);
    }
  });


}

module.exports = email;
