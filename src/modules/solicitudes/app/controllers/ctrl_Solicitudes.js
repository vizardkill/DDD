const classSetSolicitudVacaciones = require("../../domain/setSolicitudVacaciones.service");
const classUpdateSolicitudVacaciones = require("../../domain/updateSolicitudVacaciones.service");
const classSetAprobacionSolicitudVacaciones = require("../../domain/setAprobacionSolicitudVacaciones.service");
const classSetRechazoSolicitudVacaciones = require("../../domain/setRechazoSolicitudVacaciones.service");
const classSetSolicitudCancelacion = require("../../domain/setSolicitudCancelacion.service");
const serviceGetSolicitudes = require("../../domain/getSolicitudes.service");
const serviceGetSolicitudesAprobador = require("../../domain/getSolicitudesAprobador.service");
const serviceGetFlujosSolicitud = require("../../domain/getFlujosSolicitud.service");
const serviceGetMotivosNoReemplazo = require("../../domain/getMotivosNoReemplazo.service");
const serviceGetMotivosCancelacion = require("../../domain/getMotivosCancelacion.service");
const serviceGetFechasPagos = require("../../domain/getFechasPago.service");
const seriveGetSolicitudesCanceladas = require("../../domain/getSolicitudesCanceladas.service");
const serviceGetSolicitudesCanceladasAprobador = require("../../domain/getSolicitudesCanceladasAprobador.service");
const serviceDeleteSolicitudCancelacion = require("../../domain/deleteSolicitudCancelacion.service");

class ctrlSolicitudes {
    async postSolicitudVacaciones(req, res) {
        try {
            let data = req.body;
            let { strDataUser } = req;
            let service = new classSetSolicitudVacaciones(data, strDataUser);

            let query = await service.main();

            service.

            if (query.error) {
                throw new Error(query.msg);
            }

            res.status(200).json(query);
        } catch (error) {
            let result = {
                error: true,
                msg: error.message,
            };

            res.status(400).json(result);
        }
    }

    async putSolicitudVacaciones(req, res) {
        try {
            let data = req.body;
            let { strDataUser } = req;

            let service = new classUpdateSolicitudVacaciones(data, strDataUser);

            let query = await service.main();

            if (query.error) {
                throw new Error(query.msg);
            }

            res.status(200).json(query);
        } catch (error) {
            let result = {
                error: true,
                msg: error.message,
            };

            res.status(400).json(result);
        }
    }

    async getSolicitudes(req, res) {
        try {
            let objParams = req.query;
            let { strDataUser } = req;

            let query = await serviceGetSolicitudes(objParams, strDataUser);

            if (query.error) {
                throw new Error(query.msg);
            }

            res.status(200).json(query);
        } catch (error) {
            let result = {
                error: true,
                msg: error.message,
            };

            res.status(400).json(result);
        }
    }

    async getSolicitudesAprobador(req, res) {
        try {
            let objParams = req.query;
            let { strDataUser } = req;

            let query = await serviceGetSolicitudesAprobador(objParams, strDataUser);

            if (query.error) {
                throw new Error(query.msg);
            }

            res.status(200).json(query);
        } catch (error) {
            let result = {
                error: true,
                msg: error.message,
            };

            res.status(400).json(result);
        }
    }

    async getFlujosSolicitud(req, res) {
        try {
            let objParams = req.query;
            let { strDataUser } = req;

            let query = await serviceGetFlujosSolicitud(objParams, strDataUser);

            if (query.error) {
                throw new Error(query.msg);
            }

            res.status(200).json(query);
        } catch (error) {
            let result = {
                error: true,
                msg: error.message,
            };

            res.status(400).json(result);
        }
    }

    async postAprobacionSolicitudVacaciones(req, res) {
        try {
            let data = req.body;
            let { strDataUser } = req;

            let service = new classSetAprobacionSolicitudVacaciones(data, strDataUser);

            let query = await service.main();

            if (query.error) {
                throw new Error(query.msg);
            }

            res.status(200).json(query);
        } catch (error) {
            let result = {
                error: true,
                msg: error.message,
            };

            res.status(400).json(result);
        }
    }

    async postRechazoSolicitudVacaciones(req, res) {
        try {
            let data = req.body;
            let { strDataUser } = req;

            let service = new classSetRechazoSolicitudVacaciones(data, strDataUser);

            let query = await service.main();

            if (query.error) {
                throw new Error(query.msg);
            }

            res.status(200).json(query);
        } catch (error) {
            let result = {
                error: true,
                msg: error.message,
            };

            res.status(400).json(result);
        }
    }

    async getMotivosNoReemplazo(req, res) {
        try {
            let objParams = req.query;

            let query = await serviceGetMotivosNoReemplazo(objParams);

            if (query.error) {
                throw new Error(query.msg);
            }

            res.status(200).json(query);
        } catch (error) {
            let result = {
                error: true,
                msg: error.message,
            };

            res.status(400).json(result);
        }
    }

    async getMotivosCancelacion(req, res) {
        try {
            let objParams = req.query;

            let query = await serviceGetMotivosCancelacion(objParams);

            if (query.error) {
                throw new Error(query.msg);
            }

            res.status(200).json(query);
        } catch (error) {
            let result = {
                error: true,
                msg: error.message,
            };

            res.status(400).json(result);
        }
    }

    async postSolicitudCancelacion(req, res) {
        try {
            let data = req.body;
            let { strDataUser } = req;

            let service = new classSetSolicitudCancelacion(data, strDataUser);

            let query = await service.main();

            if (query.error) {
                throw new Error(query.msg);
            }

            res.status(200).json(query);
        } catch (error) {
            let result = {
                error: true,
                msg: error.message,
            };

            res.status(400).json(result);
        }
    }

    async getFechasDePago(req, res) {
        try {
            let { strPaisNomina, dtFechaInicio, dtFechaAprobacion } = req.query;
            let { strDataUser } = req;

            let query = await serviceGetFechasPagos(
                strPaisNomina,
                dtFechaInicio,
                dtFechaAprobacion,
                strDataUser
            );

            if (query.error) {
                throw new Error(query.msg);
            }

            res.status(200).json(query);
        } catch (error) {
            let result = {
                error: true,
                msg: error.message,
            };

            res.status(400).json(result);
        }
    }

    async getSolicitudesCanceladas(req, res) {
        try {
            let objParams = req.query;
            let { strDataUser } = req;

            let query = await seriveGetSolicitudesCanceladas(objParams, strDataUser);

            if (query.error) {
                throw new Error(query.msg);
            }

            res.status(200).json(query);
        } catch (error) {
            let result = {
                error: true,
                msg: error.message,
            };

            res.status(400).json(result);
        }
    }

    async getSolicitudesCanceladasAprobador(req, res) {
        try {
            let objParams = req.query;
            let { strDataUser } = req;

            let query = await serviceGetSolicitudesCanceladasAprobador(
                objParams,
                strDataUser
            );

            if (query.error) {
                throw new Error(query.msg);
            }

            res.status(200).json(query);
        } catch (error) {
            let result = {
                error: true,
                msg: error.message,
            };

            res.status(400).json(result);
        }
    }

    async deleteSolicitudCancelacion(req, res) {
        try {
            let objParams = req.query;
            let { strDataUser } = req;

            let query = await serviceDeleteSolicitudCancelacion(objParams, strDataUser);

            if (query.error) {
                throw new Error(query.msg);
            }

            res.status(200).json(query);
        } catch (error) {
            let result = {
                error: true,
                msg: error.message,
            };

            res.status(400).json(result);
        }
    }
}
module.exports = ctrlSolicitudes;
