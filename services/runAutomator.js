// const chalk = require('chalk');
const fs = require('fs');
const azure = require('./azure');

/**
 *
 */
async function initAutomator() {
  try {
    console.log('\nListing blobs...');
    await azure.initServiceClient();
    await azure.searchJsonBlob();
  } catch (error) {
    console.log(error);
  }
}

/* (async function main() {
  await searchJsonBlob();
  console.log('Done...');
})(); */



module.exports = initAutomator;
