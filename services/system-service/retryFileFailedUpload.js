
process.filesFailedPush = [];

const retryFileFailedUpload = async () =>{
    const verifyPdf = setInterval(() => {
        console.log(`Archivos fallidos => ${process.filesFailedPush}`);
      }, 4000);
}

module.exports = retryFileFailedUpload;