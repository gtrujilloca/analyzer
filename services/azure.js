const { BlobServiceClient } = require('@azure/storage-blob');
const uuidv1 = require('uuid/v1');
const { readFilee } = require('./fs');
const fs = require('fs').promises;

//conexion con azure
const AZURE_STORAGE_CONNECTION_STRING =
  process.env.AZURE_STORAGE_CONNECTION_STRING;

async function main() {
  console.log('Azure Blob storage v12 - JavaScript quickstart sample');
  // Create the BlobServiceClient object which will be used to create a container client
  const blobServiceClient = await BlobServiceClient.fromConnectionString(
    AZURE_STORAGE_CONNECTION_STRING
  );
  // Create a unique name for the container
  const containerName = 'prueba';
  showBlobs(blobServiceClient, containerName);
  pushfile(blobServiceClient, containerName);
  console.log('\nUploading to Azure storage as blob:\n\t', blobName);
}

async function pushfile(blobServiceClient, containerName) {
  // Get a reference to a container
  const containerClient = await blobServiceClient.getContainerClient(
    containerName
  );
  var a = readFile(
    '/home/andresagudelo/Documentos/OCTAVEproyects/PATOLOGIAS/entradas/Hospital1/ControlesGrupoA/paciente_grupoA_1/Class_AD.csv'
  );
  // Create a unique name for the blob
  const blobName = 'folder/Class_AD.csv';
  // Get a block blob client
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  // Upload data to the blob
  const data = a.toString();
  const uploadBlobResponse = await blockBlobClient.upload(data, data.length);
  console.log(
    'Blob was uploaded successfully. requestId: ',
    uploadBlobResponse.requestId
  );
}

async function readFile(path) {
  const data = await fs.readFile(path);
  return new Buffer(data);
}

async function showBlobs(blobServiceClient, containerName) {
  // Get a reference to a container
  const containerClient = await blobServiceClient.getContainerClient(
    containerName
  );
  console.log('\nListing blobs...');

  // List the blob(s) in the container.
  for await (const blob of containerClient.listBlobsFlat()) {
    console.log('\t', blob.name);
  }
}

main()
  .then(() => console.log('Done'))
  .catch(ex => console.log(ex.message));
