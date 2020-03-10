const updateJsonFile = require('update-json-file');
const fs = require('fs');


const updateJson = (path, dataNew)=>{
    return new Promise((resolve, reject) =>{
        try {
            fs.readFile(path, (err, dataOld) => {
                if (err) reject(err);
                let pacienteJson = JSON.parse(dataOld);
                pacienteJson.estado = dataNew;
                
                let data = JSON.stringify(pacienteJson, null, 2);
            
                fs.writeFile(path, data, (err) => {
                    if (err) reject(err);
                    console.log('Data written to file');
                    resolve(data);
                });
            });
        } catch (error) {
            reject(error);
        }
    })
}

const updateJsonFiles = (path, dataNew)=>{
    return new Promise((resolve, reject) =>{
        try {
            fs.readFile(path, (err, dataOld) => {
                console.log("read json "+path);
                if (err) reject(err);
                let pacienteJson = JSON.parse(dataOld);
                console.log("res json",pacienteJson)
                pacienteJson = dataNew;
                console.log("res json",pacienteJson)
                let data = JSON.stringify(pacienteJson, null, 2);
            
                fs.writeFile(path, data, (err) => {
                    if (err) reject(err);
                    console.log('Data written to file');
                    resolve(data);
                });
            });
        } catch (error) {
            reject(error);
        }
    })
}

module.exports = { updateJson, updateJsonFiles };