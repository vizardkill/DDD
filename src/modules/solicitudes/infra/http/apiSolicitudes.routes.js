//libreiras
const routes = require("express").Router();
const cache = require("../../../../common/middlewares/apiCache");

//Clases
const classController = require("../../app/controllers/ctrl_Solicitudes");

routes.post("/novedades/api/setSolicitudVacaciones", async (req, res) => {
    let ctrlSolicitudes = new classController();
    await ctrlSolicitudes.postSolicitudVacaciones(req, res);
});

routes.put("/novedades/api/updateSolicitudVacaciones", async (req, res) => {
    let ctrlSolicitudes = new classController();
    await ctrlSolicitudes.putSolicitudVacaciones(req, res);
});

routes.get("/novedades/api/getSolicitudes", async (req, res) => {
    let ctrlSolicitudes = new classController();
    await ctrlSolicitudes.getSolicitudes(req, res);
});

routes.get("/novedades/api/getSolicitudesAprobador", async (req, res) => {
    let ctrlSolicitudes = new classController();
    await ctrlSolicitudes.getSolicitudesAprobador(req, res);
});

routes.get("/novedades/api/getFlujosSolicitud", async (req, res) => {
    let ctrlSolicitudes = new classController();
    await ctrlSolicitudes.getFlujosSolicitud(req, res);
});

routes.post("/novedades/api/setAprobacionSolicitudVacaciones", async (req, res) => {
    let ctrlSolicitudes = new classController();
    await ctrlSolicitudes.postAprobacionSolicitudVacaciones(req, res);
});

routes.post("/novedades/api/setRechazoSolicitudVacaciones", async (req, res) => {
    let ctrlSolicitudes = new classController();
    await ctrlSolicitudes.postRechazoSolicitudVacaciones(req, res);
});

routes.get("/novedades/api/getMotivosNoReemplazo", cache(), async (req, res) => {
    let ctrlSolicitudes = new classController();
    await ctrlSolicitudes.getMotivosNoReemplazo(req, res);
});

routes.get("/novedades/api/getMotivosCancelacion", cache(), async (req, res) => {
    let ctrlSolicitudes = new classController();
    await ctrlSolicitudes.getMotivosCancelacion(req, res);
});

routes.post("/novedades/api/setSolicitudCancelacion", async (req, res) => {
    let ctrlSolicitudes = new classController();
    await ctrlSolicitudes.postSolicitudCancelacion(req, res);
});

routes.get("/novedades/api/getFechasPagos", async (req, res) => {
    let ctrlSolicitudes = new classController();
    await ctrlSolicitudes.getFechasDePago(req, res);
});

routes.get("/novedades/api/getSolicitudesCanceladas", async (req, res) => {
    let ctrlSolicitudes = new classController();
    await ctrlSolicitudes.getSolicitudesCanceladas(req, res);
});

routes.get("/novedades/api/getSolicitudesCanceladasAprobador", async (req, res) => {
    let ctrlSolicitudes = new classController();
    await ctrlSolicitudes.getSolicitudesCanceladasAprobador(req, res);
});

routes.delete("/novedades/api/deleteSolicitudCancelacion", async (req, res) => {
    let ctrlSolicitudes = new classController();
    await ctrlSolicitudes.deleteSolicitudCancelacion(req, res);
});

module.exports = routes;
