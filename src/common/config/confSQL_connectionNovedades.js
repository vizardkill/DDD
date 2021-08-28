require("dotenv").config();

const conexion = {
    user: process.env.DBNOVEDADES_USER,
    password: process.env.DBNOVEDADES_PWD,
    server: process.env.DBNOVEDADES_SERVER,
    database: process.env.DBNOVEDADES_SCHEMA,
    options: {
        rowCollectionOnRequestCompletion: true,
        encrypt: true,
        enableArithAbort: true,
        useUTC: false,
    },
    parseJSON: true,
};

module.exports = { conexion };
