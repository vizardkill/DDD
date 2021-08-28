// paquetes
require("dotenv-flow").config();

//librerias
const express = require("express");
const cors = require("cors");
const app = express();
const authToken = require("../../../common/middlewares/authToken");

//config
app.set("port", process.env.PORT);

//Middleware
app.use(cors());
app.use(express.json());
app.use("/novedades/api/", authToken);

//router
app.use(require("../../vacaciones/infra/http/apiVacaciones.routes"));
app.use(require("../../solicitudes/infra/http/apiSolicitudes.routes"));

module.exports = app;
