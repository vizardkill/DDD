//Librerias
const sql = require("mssql");
const validator = require("validator").default;

//Configuracion
const { conexion } = require("../../../../common/config/confSQL_connectionNovedades");

class daoSolicitudes {
    async setSolicitud(data) {
        try {
            let conn = await new sql.ConnectionPool(conexion).connect();

            const response = await conn.query`
            DECLARE @intId INTEGER;

            INSERT INTO tbl_Solicitudes VALUES 
            (
                ${data.strSolicitante},
                ${data.dtFechaSolicitud},
                ${data.dtFechaInicio},
                ${data.dtFechaFin},
                ${data.dtFechaReingreso},
                ${data.intNumeroDiasDisfrutar},
                ${data.intNumeroDiasCompensar},
                ${data.intIdEstado},
                ${data.intIdTipoSolicitud},
                ${data.bitOperacion},
                ${data.bitReemplazo},
                ${data.strReemplazo},
                ${data.intIdNoReemplazo}
            );

            SET @intId = SCOPE_IDENTITY();
            
            SELECT * FROM tbl_Solicitudes WHERE intId = @intId;`;

            let result = {
                error: false,
                data: response.recordset[0],
                msg: `La solicitud #${response.recordset[0].intId}, fue registrada con éxito.`,
            };

            sql.close(conexion);

            return result;
        } catch (error) {
            let result = {
                error: true,
                msg:
                    error.message ||
                    "Error en el metodo postSolicitudes de la clase daoSolicitudes",
            };

            sql.close(conexion);

            return result;
        }
    }

    async getSolicitudes(data) {
        try {
            let conn = await new sql.ConnectionPool(conexion).connect();

            const response = await conn.query`
            SELECT 

            Sol.intId,
            Sol.strSolicitante,
            Sol.dtFechaSolicitud,
            Sol.dtFechaInicio,
            Sol.dtFechaFin,
            Sol.dtFechaReingreso,
            Sol.intNumeroDiasDisfrutar,
            Sol.intNumeroDiasCompensar,
            Sol.intIdEstado,
            Estado.strNombre as strEstado,
            Sol.intIdTipoSolicitud,
            Tipo.strNombre as strTipoSolicitud,
            Sol.bitOperacion,
            Sol.bitReemplazo,
            Sol.strReemplazo,
            Sol.intIdNoReemplazo,
            MotivoNoReemplazo.strNombre as strMotivoNoReemplazo,
            (
                SELECT * FROM tbl_Aprobadores Apro
                WHERE Apro.intIdSolicitud = Sol.intId
                FOR JSON PATH
            ) as arrAprobadores

            FROM tbl_Solicitudes Sol
            INNER JOIN tbl_EstadosSolicitudes Estado on Estado.intId = Sol.intIdEstado
            INNER JOIN tbl_TipoSolicitudes Tipo on Tipo.intId = Sol.intIdTipoSolicitud
            LEFT JOIN tbl_MotivosNoReemplazo MotivoNoReemplazo on MotivoNoReemplazo.intId = Sol.intIdNoReemplazo

            WHERE (Sol.strSolicitante     = ${data.strEmailColaborador} OR ${data.strEmailColaborador} IS NULL)
            AND   (Sol.intId              = ${data.intIdSolicitud} OR ${data.intIdSolicitud} IS NULL)
            AND   (Sol.intIdEstado        = ${data.intIdEstado} OR ${data.intIdEstado} IS NULL)
            AND   (Sol.intIdTipoSolicitud = ${data.intIdTipoSolicitud} OR ${data.intIdTipoSolicitud} IS NULL)`;

            let arrNewData = response.recordsets[0];

            for (let i = 0; i < arrNewData.length; i++) {
                let { arrAprobadores } = arrNewData[i];

                if (validator.isJSON(arrAprobadores)) {
                    arrAprobadores = JSON.parse(arrAprobadores);
                    arrNewData[i].arrAprobadores = arrAprobadores;
                }
            }

            let result = {
                error: false,
                data: arrNewData ? (arrNewData.length > 0 ? arrNewData : null) : null,
            };

            sql.close(conexion);

            return result;
        } catch (error) {
            let result = {
                error: true,
                msg:
                    error.message ||
                    "Error en el metodo getSolicitudes de la clase daoSolicitudes",
            };

            sql.close(conexion);

            return result;
        }
    }

    async getSolicitudesAprobador(data) {
        try {
            let conn = await new sql.ConnectionPool(conexion).connect();

            const response = await conn.query`
            SELECT 

            Sol.intId,
            Sol.strSolicitante,
            Sol.dtFechaSolicitud,
            Sol.dtFechaInicio,
            Sol.dtFechaFin,
            Sol.dtFechaReingreso,
            Sol.intNumeroDiasDisfrutar,
            Sol.intNumeroDiasCompensar,
            Sol.intIdEstado,
            Estado.strNombre as strEstado,
            Sol.intIdTipoSolicitud,
            Tipo.strNombre as strTipoSolicitud,
            Sol.bitOperacion,
            Sol.bitReemplazo,
            Sol.strReemplazo,
            Sol.intIdNoReemplazo,
            MotivoNoReemplazo.strNombre as strMotivoNoReemplazo,
            (
                SELECT * FROM tbl_Aprobadores Apro
                WHERE Apro.intIdSolicitud = Sol.intId
                FOR JSON PATH
            ) as arrAprobadores

            FROM tbl_Aprobadores Apro
            INNER JOIN tbl_Solicitudes Sol on Sol.intId = Apro.intIdSolicitud
            INNER JOIN tbl_EstadosSolicitudes Estado on Estado.intId = Sol.intIdEstado
            INNER JOIN tbl_TipoSolicitudes Tipo on Tipo.intId = Sol.intIdTipoSolicitud
            LEFT JOIN tbl_MotivosNoReemplazo MotivoNoReemplazo on MotivoNoReemplazo.intId = Sol.intIdNoReemplazo

            WHERE (Apro.strAprobador      = ${data.strEmailAprobador} OR ${data.strEmailAprobador} IS NULL)
            AND   (Sol.strSolicitante     = ${data.strEmailColaborador} OR ${data.strEmailColaborador} IS NULL)
            AND   (Sol.intId              = ${data.intIdSolicitud} OR ${data.intIdSolicitud} IS NULL)
            AND   (Sol.intIdEstado        = ${data.intIdEstado} OR ${data.intIdEstado} IS NULL)
            AND   (Sol.intIdTipoSolicitud = ${data.intIdTipoSolicitud} OR ${data.intIdTipoSolicitud} IS NULL)`;

            let arrNewData = response.recordsets[0];

            for (let i = 0; i < arrNewData.length; i++) {
                let { arrAprobadores } = arrNewData[i];

                if (validator.isJSON(arrAprobadores)) {
                    arrAprobadores = JSON.parse(arrAprobadores);
                    arrNewData[i].arrAprobadores = arrAprobadores;
                }
            }

            let result = {
                error: false,
                data: arrNewData ? (arrNewData.length > 0 ? arrNewData : null) : null,
            };

            sql.close(conexion);

            return result;
        } catch (error) {
            let result = {
                error: true,
                msg:
                    error.message ||
                    "Error en el metodo getSolicitudes de la clase daoSolicitudes",
            };

            sql.close(conexion);

            return result;
        }
    }

    async updateSolicitud(data) {
        try {
            let conn = await new sql.ConnectionPool(conexion).connect();

            const response = await conn.query`

            UPDATE tbl_Solicitudes 

            SET dtFechaInicio          = COALESCE(${data.dtFechaInicio}, dtFechaInicio),
                dtFechaFin             = COALESCE(${data.dtFechaFin}, dtFechaFin),
                dtFechaReingreso       = COALESCE(${data.dtFechaReingreso}, dtFechaReingreso),
                intNumeroDiasDisfrutar = COALESCE(${data.intNumeroDiasDisfrutar}, intNumeroDiasDisfrutar),
                intNumeroDiasCompensar = COALESCE(${data.intNumeroDiasCompensar}, intNumeroDiasCompensar),
                bitReemplazo           = COALESCE(${data.bitReemplazo}, bitReemplazo),
                strReemplazo           = COALESCE(${data.strReemplazo}, strReemplazo),
                intIdNoReemplazo       = COALESCE(${data.intIdNoReemplazo}, intIdNoReemplazo),
                intIdEstado            = COALESCE(${data.intIdEstado}, intIdEstado)

            WHERE intId                = ${data.intId};

            SELECT * FROM tbl_Solicitudes WHERE intId = ${data.intId};`;

            let result = {
                error: false,
                data: response.recordset[0],
                msg: `La solicitud #${data.intId}, fue modificada con éxito.`,
            };

            sql.close(conexion);

            return result;
        } catch (error) {
            let result = {
                error: true,
                msg:
                    error.message ||
                    "Error en el metodo updateSolicitud de la clase daoSolicitudes",
            };

            sql.close(conexion);

            return result;
        }
    }

    async deleteSolicitud(data) {
        try {
            let conn = await new sql.ConnectionPool(conexion).connect();

            await conn.query`DELETE FROM tbl_Solicitudes WHERE intId = ${data.intIdSolicitud}`;

            let result = {
                error: false,
                msg: "El la solicitud fue eliminada con éxito.",
            };

            sql.close(conexion);

            return result;
        } catch (error) {
            let result = {
                error: true,
                msg:
                    error.message ||
                    "Error en el metodo deleteSolicitud de la clase daoSolicitudes",
            };

            sql.close(conexion);

            return result;
        }
    }

    async setAuditoriaSolicitud(data) {
        try {
            let conn = await new sql.ConnectionPool(conexion).connect();

            const response = await conn.query`
            DECLARE @intId INTEGER;

            INSERT INTO tbl_AuditoriaSolicitudes VALUES 
            (
                ${data.intIdSolicitud},
                ${data.strResponsable},
                ${data.dtFechaCreacion},
                ${data.dtFechaInicio},
                ${data.dtFechaFin},
                ${data.dtFechaReingreso},
                ${data.intNumeroDiasDisfrutar},
                ${data.intNumeroDiasCompensar},
                ${data.intIdEstado},
                ${data.intIdTipoSolicitud},
                ${data.bitOperacion},
                ${data.bitReemplazo},
                ${data.strReemplazo},
                ${data.intIdNoReemplazo},
                ${data.strObservaciones}
            );

            SET @intId = SCOPE_IDENTITY();
            
            SELECT * FROM tbl_AuditoriaSolicitudes WHERE intId = @intId;`;

            let result = {
                error: false,
                data: response.recordset[0],
                msg: `La auditoria de la solicitud fue registrada con éxito con identificador #${response.recordset[0].intId}.`,
            };

            sql.close(conexion);

            return result;
        } catch (error) {
            let result = {
                error: true,
                msg:
                    error.message ||
                    "Error en el metodo postSolicitudes de la clase daoSolicitudes",
            };

            sql.close(conexion);

            return result;
        }
    }

    async setAprobadores(data) {
        try {
            let conn = await new sql.ConnectionPool(conexion).connect();

            const response = await conn.query`
            DECLARE @intId INTEGER;

            INSERT INTO tbl_Aprobadores VALUES 
            (
                ${data.intIdSolicitud},
                ${data.strAprobador}
            );
            
            SET @intId = SCOPE_IDENTITY();

            SELECT * FROM tbl_Aprobadores WHERE intId = @intId;
            `;

            let result = {
                error: false,
                data: response.recordset[0],
                msg: `El aprobador de la solicitud #${response.recordset[0].intIdSolicitud} fue registrado con éxito, con número de registro #${response.recordset[0].intId}.`,
            };

            sql.close(conexion);

            return result;
        } catch (error) {
            let result = {
                error: true,
                msg:
                    error.message ||
                    "Error en el metodo setAprobadores de la clase daoSolicitudes",
            };

            sql.close(conexion);

            return result;
        }
    }

    async updateAprobador(data) {
        try {
            let conn = await new sql.ConnectionPool(conexion).connect();

            const response = await conn.query`

            UPDATE tbl_Aprobadores

            SET strAprobador     = ${data.strAprobador}

            WHERE intId          = ${data.intId}
            AND   intIdSolicitud = ${data.intIdSolicitud};

            SELECT * FROM tbl_Aprobadores WHERE intId = ${data.intId};
            `;

            let result = {
                error: false,
                data: response.recordset[0],
                msg: `El aprobador de la solicitud #${data.intIdSolicitud}, fue modificado con éxito, con número de registro #${data.intId}.`,
            };

            sql.close(conexion);

            return result;
        } catch (error) {
            let result = {
                error: true,
                msg:
                    error.message ||
                    "Error en el metodo updateAprobador de la clase daoSolicitudes",
            };

            sql.close(conexion);

            return result;
        }
    }

    async setFlujoSolicitud(data) {
        try {
            let conn = await new sql.ConnectionPool(conexion).connect();

            const response = await conn.query`
            DECLARE @intId INTEGER;

            INSERT INTO tbl_FlujoSolicitudes VALUES 
            (
                ${data.strResponsable},
                ${data.intIdSolicitud},
                ${data.dtFechaCreacion},
                ${data.strObservaciones},
                ${data.intIdEstado}
            );

            SET @intId = SCOPE_IDENTITY();

            SELECT * FROM tbl_FlujoSolicitudes WHERE intId = @intId;
            `;

            let result = {
                error: false,
                data: response.recordset[0],
                msg: `El flujo de la solicitud #${response.recordset[0].intIdSolicitud} fue registrada con éxito, con número de registro #${response.recordset[0].intId}.`,
            };

            sql.close(conexion);

            return result;
        } catch (error) {
            let result = {
                error: true,
                msg:
                    error.message ||
                    "Error en el metodo setFlujoSolicitud de la clase daoSolicitudes",
            };

            sql.close(conexion);

            return result;
        }
    }

    async getFlujosSolicitud(data) {
        try {
            let conn = await new sql.ConnectionPool(conexion).connect();

            let response = await conn.query`
            SELECT 

            Flujo.intId,
            Flujo.strResponsable,
            Flujo.intIdSolicitud,
            Flujo.dtFechaCreacion,
            Flujo.strObservaciones,
            Flujo.intIdEstado,
            Estado.strNombre as strEstado


            FROM tbl_FlujoSolicitudes Flujo
            INNER JOIN tbl_EstadosSolicitudes Estado on Estado.intId = Flujo.intIdEstado
            WHERE (Flujo.intId          = ${data.intIdFlujo} OR ${data.intIdFlujo} IS NULL)
            AND   (Flujo.strResponsable = ${data.strResponsable} OR ${data.strResponsable} IS NULL)
            AND   (Flujo.intIdSolicitud = ${data.intIdSolicitud} OR ${data.intIdSolicitud} IS NULL)
            `;

            let result = {
                error: false,
                data: response.recordsets[0].length > 0 ? response.recordsets[0] : null,
            };

            sql.close(conexion);

            return result;
        } catch (error) {
            let result = {
                error: true,
                msg:
                    error.message ||
                    "Error en el metodo getFlujosSolicitud de la clase daoSolicitudes",
            };

            sql.close(conexion);

            return result;
        }
    }

    async getMotivosNoReemplazo(data) {
        try {
            let conn = await new sql.ConnectionPool(conexion).connect();

            let response = await conn.query`
            SELECT 

            MotNoR.intId,
            MotNoR.strNombre

            FROM tbl_MotivosNoReemplazo MotNoR
            WHERE (MotNoR.intId     = ${data.intId} OR ${data.intId} IS NULL)
            AND   (MotNoR.strNombre = ${data.strNombre} OR ${data.strNombre} IS NULL)

            ORDER BY MotNoR.strNombre
            `;

            let result = {
                error: false,
                data: response.recordsets[0].length > 0 ? response.recordsets[0] : null,
            };

            sql.close(conexion);

            return result;
        } catch (error) {
            let result = {
                error: true,
                msg:
                    error.message ||
                    "Error en el metodo getMotivosNoReemplazo de la clase daoSolicitudes",
            };

            sql.close(conexion);

            return result;
        }
    }

    async getMotivosCancelacion(data) {
        try {
            let conn = await new sql.ConnectionPool(conexion).connect();

            let response = await conn.query`
            SELECT 

            MotCan.intId,
            MotCan.strNombre,
            MotCan.intIdTipoSolicitud,
            TipoSol.strNombre as strTipoSolicitud

            FROM tlb_MotivosCancelacion MotCan
            INNER JOIN tbl_TipoSolicitudes TipoSol ON TipoSol.intId = MotCan.intIdTipoSolicitud
 
            WHERE (MotCan.intId              = ${data.intId} OR ${data.intId} IS NULL)
            AND   (MotCan.strNombre          = ${data.strNombre} OR ${data.strNombre} IS NULL)
            AND   (MotCan.intIdTipoSolicitud = ${data.intIdTipoSolicitud} OR ${data.intIdTipoSolicitud} IS NULL)

            ORDER BY MotCan.strNombre
            `;

            let result = {
                error: false,
                data: response.recordsets[0].length > 0 ? response.recordsets[0] : null,
            };

            sql.close(conexion);

            return result;
        } catch (error) {
            let result = {
                error: true,
                msg:
                    error.message ||
                    "Error en el metodo getMotivosCancelacion de la clase daoSolicitudes",
            };

            sql.close(conexion);

            return result;
        }
    }

    async getSolicitudesCanceladas(data) {
        try {
            let conn = await new sql.ConnectionPool(conexion).connect();

            let response = await conn.query`
            SELECT 

            SolCan.intId,
            SolCan.strResponsable,
            SolCan.dtFechaCreacion,
            SolCan.strObservaciones,
            SolCan.intIdSolicitud,
            SolCan.intIdEstado,
            Estado.strNombre as strEstado,
            SolCan.intIdMotivoCancelacion,
            Motivo.strNombre as strMotivoCancelacion,
            (
                SELECT * FROM tbl_Aprobadores Apro
                WHERE Apro.intIdSolicitud = SolCan.intIdSolicitud
                FOR JSON PATH
            ) as arrAprobadores

            FROM tbl_SolicitudesCanceladas SolCan
            INNER JOIN tbl_EstadosSolicitudes Estado on Estado.intId = SolCan.intIdEstado
            INNER JOIN tlb_MotivosCancelacion Motivo on Motivo.intId = SolCan.intIdMotivoCancelacion

            WHERE (SolCan.intId                      = ${data.intId} OR ${data.intId} IS NULL)
            AND   (SolCan.strResponsable             = ${data.strResponsable} OR ${data.strResponsable} IS NULL)
            AND   (SolCan.dtFechaCreacion            = ${data.dtFechaCreacion} OR ${data.dtFechaCreacion} IS NULL)
            AND   (SolCan.intIdSolicitud             = ${data.intIdSolicitud} OR ${data.intIdSolicitud} IS NULL)
            AND   (SolCan.intIdEstado                = ${data.intIdEstado} OR ${data.intIdEstado} IS NULL)
            AND   (SolCan.intIdMotivoCancelacion     = ${data.intIdMotivoCancelacion} OR ${data.intIdMotivoCancelacion} IS NULL)
       
            `;

            let arrNewData = response.recordsets[0];

            for (let i = 0; i < arrNewData.length; i++) {
                let { arrAprobadores } = arrNewData[i];

                if (validator.isJSON(arrAprobadores)) {
                    arrAprobadores = JSON.parse(arrAprobadores);
                    arrNewData[i].arrAprobadores = arrAprobadores;
                }
            }

            let result = {
                error: false,
                data: arrNewData ? (arrNewData.length > 0 ? arrNewData : null) : null,
            };

            sql.close(conexion);

            return result;
        } catch (error) {
            let result = {
                error: true,
                msg:
                    error.message ||
                    "Error en el metodo getSolicitudesCanceladas de la clase daoSolicitudes",
            };

            sql.close(conexion);

            return result;
        }
    }

    async getSolicitudesCanceladasAprobador(data) {
        try {
            let conn = await new sql.ConnectionPool(conexion).connect();

            let response = await conn.query`
            SELECT 

            SolCan.intId,
            SolCan.strResponsable,
            SolCan.dtFechaCreacion,
            SolCan.strObservaciones,
            SolCan.intIdSolicitud,
            SolCan.intIdEstado,
            Estado.strNombre as strEstado,
            SolCan.intIdMotivoCancelacion,
            Motivo.strNombre as strMotivoCancelacion,
            (
                SELECT * FROM tbl_Aprobadores Apro
                WHERE Apro.intIdSolicitud = SolCan.intIdSolicitud
                FOR JSON PATH
            ) as arrAprobadores

            FROM tbl_Aprobadores Apro
            INNER JOIN tbl_SolicitudesCanceladas SolCan on Solcan.intIdSolicitud = Apro.intIdSolicitud
            INNER JOIN tbl_EstadosSolicitudes Estado on Estado.intId = SolCan.intIdEstado
            INNER JOIN tlb_MotivosCancelacion Motivo on Motivo.intId = SolCan.intIdMotivoCancelacion

            WHERE (Apro.strAprobador                 = ${data.strAprobador} OR ${data.strAprobador} IS NULL)
            AND   (SolCan.intId                      = ${data.intId} OR ${data.intId} IS NULL)
            AND   (Apro.strAprobador                 = ${data.strAprobador} OR ${data.strAprobador} IS NULL)
            AND   (SolCan.strResponsable             = ${data.strResponsable} OR ${data.strResponsable} IS NULL)
            AND   (SolCan.dtFechaCreacion            = ${data.dtFechaCreacion} OR ${data.dtFechaCreacion} IS NULL)
            AND   (SolCan.intIdSolicitud             = ${data.intIdSolicitud} OR ${data.intIdSolicitud} IS NULL)
            AND   (SolCan.intIdEstado                = ${data.intIdEstado} OR ${data.intIdEstado} IS NULL)
            AND   (SolCan.intIdMotivoCancelacion     = ${data.intIdMotivoCancelacion} OR ${data.intIdMotivoCancelacion} IS NULL)
       
            `;

            let arrNewData = response.recordsets[0];

            for (let i = 0; i < arrNewData.length; i++) {
                let { arrAprobadores } = arrNewData[i];

                if (validator.isJSON(arrAprobadores)) {
                    arrAprobadores = JSON.parse(arrAprobadores);
                    arrNewData[i].arrAprobadores = arrAprobadores;
                }
            }

            let result = {
                error: false,
                data: arrNewData ? (arrNewData.length > 0 ? arrNewData : null) : null,
            };

            sql.close(conexion);

            return result;
        } catch (error) {
            let result = {
                error: true,
                msg:
                    error.message ||
                    "Error en el metodo getSolicitudesCanceladas de la clase daoSolicitudes",
            };

            sql.close(conexion);

            return result;
        }
    }

    async setCancelacionSolicitud(data) {
        try {
            let conn = await new sql.ConnectionPool(conexion).connect();

            const response = await conn.query`
            DECLARE @intId INTEGER;

            INSERT INTO tbl_SolicitudesCanceladas VALUES 
            (
                ${data.strResponsable},
                ${data.dtFechaCreacion},
                ${data.strObservaciones},
                ${data.intIdSolicitud},
                ${data.intIdEstado},
                ${data.intIdMotivoCancelacion}
            );

            SET @intId = SCOPE_IDENTITY();

            SELECT * FROM tbl_SolicitudesCanceladas WHERE intId = @intId;
            `;

            let result = {
                error: false,
                data: response.recordset[0],
                msg: `Se registro una nueva cancelación para la solicitud #${response.recordset[0].intIdSolicitud} con éxito, con número de registro #${response.recordset[0].intId}.`,
            };

            sql.close(conexion);

            return result;
        } catch (error) {
            let result = {
                error: true,
                msg:
                    error.message ||
                    "Error en el metodo setCancelacionSolicitud de la clase daoSolicitudes",
            };

            sql.close(conexion);

            return result;
        }
    }

    async deleteSolicitudCancelacion(data) {
        try {
            let conn = await new sql.ConnectionPool(conexion).connect();

            await conn.query`DELETE FROM tbl_SolicitudesCanceladas WHERE intId = ${data.intId}`;

            let result = {
                error: false,
                msg: `La solicitud de cancelación #${data.intId} fue eliminada con éxito.`,
            };

            sql.close(conexion);

            return result;
        } catch (error) {
            let result = {
                error: true,
                msg:
                    error.message ||
                    "Error en el metodo deleteSolicitudCancelacion de la clase daoSolicitudes",
            };

            sql.close(conexion);

            return result;
        }
    }
}
module.exports = daoSolicitudes;
