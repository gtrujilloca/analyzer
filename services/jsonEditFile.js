const updateJsonFile = require('update-json-file')
 const options = { defaultValue: {} }
 const fs = require('fs');

//const path = "/home/andresagudelo/Documentos/OCTAVEproyects/PATOLOGIAS/entradas/Hospital1/ControlesGrupoA/paciente_grupoA_2/paciente_grupoA_2.json";

const updateJson = (path, dataNew)=>{
    return new Promise((resolve, reject) =>{
        try {
            fs.readFile(path, (err, dataOld) => {
                if (err) throw err;
                let pacienteJson = JSON.parse(dataOld);
                pacienteJson.estado = dataNew;
                
                let data = JSON.stringify(pacienteJson, null, 2);
            
                fs.writeFile(path, data, (err) => {
                    if (err) throw err;
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
                if (err) throw err;
                let pacienteJson = JSON.parse(dataOld);
                pacienteJson = dataNew;
                
                let data = JSON.stringify(pacienteJson, null, 2);
            
                fs.writeFile(path, data, (err) => {
                    if (err) throw err;
                    console.log('Data written to file');
                    resolve(data);
                });
            });
        } catch (error) {
            reject(error);
        }
    })
}

// const updateJsonResultados = (path, dataNew)=>{
//     return new Promise((resolve, reject) =>{
//         try {
//             fs.readFile(path, (err, dataOld) => {
//                 if (err) throw err;
//                 let pacienteJson = JSON.parse(dataOld);
//                 pacienteJson.estado = dataNew;
                
//                 let data = JSON.stringify(pacienteJson, null, 2);
            
//                 fs.writeFile(path, data, (err) => {
//                     if (err) throw err;
//                     console.log('Data written to file');
//                     resolve(data);a
//                 });
//             });
//         } catch (error) {
//             reject(error);
//         }
//     })
// }


module.exports = { updateJson, updateJsonFiles };