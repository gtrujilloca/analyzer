const express = require('express');
const app = express();


const { config } = require ('./config/index');
const hospitalesApi = require('./routes/hospitales.js');

const automatorWatcher = require('./services/runoctave.js');

automatorWatcher; 

//hospitalesApi(app);


app.listen(config.port, function(){
    console.log(`Listening http://localhost:${config.port}`);
   
});

