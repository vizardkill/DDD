//Librerias
const routes = require("express").Router();
const cache = require("../../../../common/middlewares/apiCache");

//Classes
const classController = require("../../app/controllers/ctrl_Vacaciones");

routes.get("/novedades/api/getDiasVacaciones", async (req, res) => {
    let contrlVacaciones = new classController();
    await contrlVacaciones.getPasivoVacacional(req, res);
});

routes.get("/novedades/api/getFechasVacaciones", async (req, res) => {
    let contrlVacaciones = new classController();
    await contrlVacaciones.getFechasVacaciones(req, res);
});

module.exports = routes;
