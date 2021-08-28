const serviceGetPasivoVacacional = require("../../domain/getDiasPasivoVacacional.service");
const serviceGetFechasVacaciones = require("../../domain/getFechasVacaciones.service");

class ctrlPasivoVacacional {
    async getPasivoVacacional(req, res) {
        try {
            let { strEmailColaborador } = req.query;
            let { strDataUser } = req;

            let queryPasivoVacacional = await serviceGetPasivoVacacional(
                strEmailColaborador,
                strDataUser
            );

            res.status(200).json(queryPasivoVacacional);
        } catch (error) {
            let result = {
                error: true,
                msg: error.message,
            };

            res.status(400).json(result);
        }
    }

    async getFechasVacaciones(req, res) {
        try {
            let { strPaisNomina, dtFechaInicio, intNumeroDiasDisfrutar } = req.query;
            let { strDataUser } = req;

            let queryFechasVacaciones = await serviceGetFechasVacaciones(
                strPaisNomina,
                dtFechaInicio,
                intNumeroDiasDisfrutar,
                strDataUser
            );

            res.status(200).json(queryFechasVacaciones);
        } catch (error) {
            let result = {
                error: true,
                msg: error.message,
            };

            res.status(400).json(result);
        }
    }
}

module.exports = ctrlPasivoVacacional;
