 require('dotenv').config();

 const config = {
   dev: process.env.NODE_ENV !== 'production',
   port: process.env.PORT || 8000,
   azure_string_connection: process.env.AZURE_STORAGE_CONNECTION_STRING
   //azure credenciales

   //CONFI
   //  port = process.env.PORT,
   //  cors= process.env.CORS,

   //     //MONGO
   //     dbUser= process.env.DB_USER,
   //     dbPassword= process.env.DB_PASSWORD,
   //     dbHost= process.env.DB_HOST,
   //     dbName= process.env.DB_NAME
 };




 module.exports = { config };