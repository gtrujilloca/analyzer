// const chalk = require('chalk');
const fs = require('fs');
const azure = require('./azure');

/**
 *
 */
async function initAutomator() {
  try {
    console.log('Searching blobs...');
    await azure.initServiceClient();
    await azure.searchJsonBlob();
  } catch (error) {
    console.log(error);
  }
}


module.exports = initAutomator;
