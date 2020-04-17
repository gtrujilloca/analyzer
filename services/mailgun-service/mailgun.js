const Mailgun = require("mailgun-js");
const {DOMAIN_MAIL , API_KEY_MAIL, FROM_EMAIL} = process.env;

let mailgun = null;

const sendEmail = (fromText, to, subject, template, variablesBody) => {
    return new Promise((resolve, reject)=>{
        try {   
            if(!mailgun){
                mailgun = new Mailgun({ apiKey: API_KEY_MAIL, domain: DOMAIN_MAIL });
            }
            
            const data = {
            from: `${fromText} <${FROM_EMAIL}>`,
            to,
            subject,
            template, 
            "v:urlPdf": variablesBody,
            };

            mailgun.messages().send(data, (err, body) => {
            if (err) {
                reject(err);
            } else {
                resolve(body);
            }
            });
        } catch (err) {
        console.log(err)
        }
    }).catch( err => {
        console.log(err)
    })
};

module.exports = sendEmail;


//Example send mail
// const data = {
// 	from: "andresagudelo1006@gmail.com",
// 	to: "andresagudelo1006@gmail.com",
// 	subject: "Hello",
// 	template: "correo-aura",
// 	'v:urlPdf': 'https://externalstorageaccount.blob.core.windows.net/finalizados/HUCV/patologia_AURA204/paciente_AURA204/paciente_AURA204.pdf',
// };
