require("dotenv").config();

const conexion = {
    user: process.env.DBSERVICES_USER,
    password: process.env.DBSERVICES_PWD,
    server: process.env.DBSERVICES_SERVER,
    database: process.env.DBSERVICES_SCHEMA,
    options: {
        rowCollectionOnRequestCompletion: true,
        encrypt: true,
        enableArithAbort: true,
        useUTC: false,
    },
    parseJSON: true,
};

module.exports = { conexion };
