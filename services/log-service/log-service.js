const superagent = require('superagent');
require('dotenv').config();

const { URL_API_LOG } = process.env;

const logService = (async (body) => {
        try {
            superagent
            .post(`${URL_API_LOG}/api/log`)
            .send(body)
            .set('X-API-Key', 'foobar')
            .set('accept', 'json')
            .end((err, res) => {

                if(err) console.log(err) ;

                if(res.statusCode === 200){
                    //console.log("Log en BD exitoso ", res.statusCode);
                }else{
                    console.log("Log en BD error ", res.statusCode);
                }
            });
        } catch (err) {
          console.error(err);
        }
});

module.exports = logService;

