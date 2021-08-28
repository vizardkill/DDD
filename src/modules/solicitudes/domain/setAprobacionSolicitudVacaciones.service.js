//Classes
const classInterfaceDAOSolicitudes = require("../infra/conectors/interfaceDAOSolicitudes");

//Funciones
const getPersonaActiva = require("../../../common/functions/getPersonaActiva");
const sendEmail = require("../../../common/functions/sendEmail");
const plantillaCorreo = require("../app/functions/plantillaCorreo");

//servicos
const serviceGetFechaPago = require("./getFechasPago.service");

class setAprobacionSolicitudVacaciones {
    #objData;
    #objUser;
    #objResult;
    #objSolicitudActual;

    /**
     * El constructor recibe dos parametros tipo objeto, puede revisar la documentación del parametro `data` en el modelo.
     *
     * @param {object} data
     * @param {object} strDataUser
     */
    constructor(data, strDataUser) {
        this.#objData = data;
        this.#objUser = strDataUser;
    }

    /**
     * La función principal `main` se encarga de utilizar todas las funciones privadas y de llevar a cabo el registro de la solicitud.
     */
    async main() {
        await this.#getSolicitud();
        await this.#validations();
        await this.#completeData();
        await this.#updateSolicitud();
        await this.#setFlujoSolicitud();
        await this.#sendEmail();
        return this.#objResult;
    }

    async #getSolicitud() {
        let dao = new classInterfaceDAOSolicitudes();

        if (!this.#objData.intId) {
            throw new Error("Se esperaban parámetros de entrada.");
        }

        let query = await dao.getSolicitudes({
            intIdSolicitud: this.#objData.intId,
        });

        if (query.error) {
            throw new Error(query.msg);
        }

        if (!query.data) {
            throw new Error(
                `La solicitud con identificador #${
                    this.#objData.intId
                }, no existe, por favor verifica e intenta nuevamente.`
            );
        }

        this.#objSolicitudActual = query.data[0];
    }

    async #validations() {
        let strEstadoSolicitud = this.#objSolicitudActual.strEstado;
        let queryGetFechaPago;

        if (
            strEstadoSolicitud !== "ABIERTO" &&
            strEstadoSolicitud !== "EN PROCESO"
        ) {
            throw new Error(
                `La solicitud no puede ser aprobada debido a que se encuentra en el estado: ${strEstadoSolicitud}, comunícate con el área de nómina para más información.`
            );
        }

        if (!this.#objData.intId) {
            throw new Error("Se esperaban parámetros de entrada.");
        }

        /**if (this.#objSolicitudActual.bitOperacion) {
            if (typeof this.#objData.bitReemplazo !== "boolean") {
                throw new Error(
                    "Se esperaba que se seleccionara si el colaborador tendrá reemplazo o no."
                );
            }

            if (this.#objData.bitReemplazo && !this.#objData.strReemplazo) {
                throw new Error(
                    "Se marco que se requería un reemplazo, sin embargo no se recibieron datos del colaborador de reemplazo."
                );
            }

            if (
                !this.#objData.bitReemplazo &&
                !this.#objData.intIdNoReemplazo
            ) {
                throw new Error(
                    "Se marco que no se requería un reemplazo, sin embargo, no se recibió el motivo por el cual no se reemplazara al colaborador."
                );
            }
        } */
        queryGetFechaPago = await serviceGetFechaPago(
            null,
            this.#objSolicitudActual.dtFechaInicio,
            new Date(),
            this.#objUser
        );
        if (queryGetFechaPago.error) {
            throw new Error("Error no se puede apobar la solicitud");
        }
    }

    /**
     * la función `completeData` se encarga de rellenar la información faltante
     * y sobreescribiendo la información sensible, evitando asi que sea corrompida desde el cliente.
     */
    async #completeData() {
        let dao = new classInterfaceDAOSolicitudes();
        let prevData = this.#objData;
        let arrAprobadores = this.#objSolicitudActual.arrAprobadores;
        let intIdEstado;
        let arrDataFlujo;

        let query = await dao.getFlujosSolicitud({
            intIdSolicitud: this.#objData.intId,
        });

        if (query.error) {
            throw new Error(query.msg);
        }

        if (!query.data) {
            throw new Error(
                `La solicitud con identificador #${
                    this.#objData.intId
                }, no contiene flujos asociados, por favor comunícate con el área de TI para más información.`
            );
        }

        arrDataFlujo = query.data;

        if (arrAprobadores.length > 1) {
            let bitExisteEstadoEnProceso = false;

            for (let i = 0; i < arrDataFlujo.length; i++) {
                if (arrDataFlujo[i].strEstado === "EN PROCESO") {
                    bitExisteEstadoEnProceso = true;
                }
            }

            if (bitExisteEstadoEnProceso) {
                intIdEstado = 4;
            } else {
                intIdEstado = 3;
            }
        } else {
            intIdEstado = 4;
        }

        let newData = {
            ...prevData,
            /**bitReemplazo:
                typeof this.#objData.bitReemplazo === "boolean"
                    ? this.#objData.bitReemplazo
                    : null,
            strReemplazo:
                this.#objData.bitReemplazo === true
                    ? this.#objData.strReemplazo
                    : null,
            intIdMotivoNoReemplazo:
                typeof this.#objData.intIdMotivoNoReemplazo === "number"
                    ? this.#objData.intIdMotivoNoReemplazo
                    : null, */
            intIdEstado,
        };

        this.#objData = newData;
    }

    async #updateSolicitud() {
        let dao = new classInterfaceDAOSolicitudes();

        let query = await dao.updateSolicitud({
            intId: this.#objData.intId,
            // bitReemplazo: this.#objData.bitReemplazo,
            // strReemplazo: this.#objData.bitReemplazo,
            //intIdMotivoNoReemplazo: this.#objData.intIdMotivoNoReemplazo,
            intIdEstado: this.#objData.intIdEstado,
        });

        if (query.error) {
            throw new Error(query.msg);
        }

        this.#objResult = {
            error: query.error,
            data: query.data,
            msg: query.msg,
        };
    }

    async #setFlujoSolicitud() {
        let dao = new classInterfaceDAOSolicitudes();
        let strObservaciones;

        if (this.#objData.strObservaciones) {
            if (this.#objData.intIdEstado === 3) {
                strObservaciones = `La solicitud fue gestionada con éxito y se encuentra actualmente EN PROCESO debido a que falta la gestión de uno o más aprobadores. Observaciones adicionales: ${
                    this.#objData.strObservaciones
                }`;
            }

            if (this.#objData.intIdEstado === 4) {
                strObservaciones = `La solicitud fue gestionada y APROBADA con éxito. Observaciones adicionales: ${
                    this.#objData.strObservaciones
                }`;
            }
        } else {
            if (this.#objData.intIdEstado === 3) {
                strObservaciones = `La solicitud fue gestionada con éxito y se encuentra actualmente EN PROCESO debido a que falta la gestión de uno o más aprobadores.`;
            }

            if (this.#objData.intIdEstado === 4) {
                strObservaciones = `La solicitud fue gestionada y APROBADA con éxito.`;
            }
        }

        let query = await dao.setFlujoSolicitud({
            strResponsable: this.#objUser.strEmail,
            intIdSolicitud: this.#objData.intId,
            dtFechaCreacion: new Date(),
            strObservaciones,
            intIdEstado: this.#objData.intIdEstado,
        });

        if (query.error) {
            await this.#rollbackTransaction();
        }
    }

    async #sendEmail() {
        let dao = new classInterfaceDAOSolicitudes();
        let queryGetPersonaActivaAprobador;
        let queryGetPersonaActivaSolicitante;
        let queryGetPersonaActivaReemplazo;
        let queryGetMotivosNoReemplazo;

        queryGetPersonaActivaAprobador = await getPersonaActiva(
            {
                strEmail: this.#objUser.strEmail,
            },
            process.env.TOKEN_SYSTEM
        );

        queryGetPersonaActivaSolicitante = await getPersonaActiva(
            {
                strEmail: this.#objSolicitudActual.strSolicitante,
            },
            process.env.TOKEN_SYSTEM
        );

        if (
            queryGetPersonaActivaAprobador.error ||
            !queryGetPersonaActivaAprobador.data ||
            queryGetPersonaActivaSolicitante.error ||
            !queryGetPersonaActivaSolicitante.data
        ) {
            this.#objResult = {
                ...this.#objResult,
                msg: `La solicitud #${
                    this.#objSolicitudActual.intId
                } fue aprobada con éxito, sin embargo, no fue posible enviar las notificaciones por correo electrónico debido a un error en el servicio de persona activa.`,
            };

            return;
        }

        if (this.#objSolicitudActual.bitOperacion) {
            if (this.#objData.bitReemplazo && this.#objData.strReemplazo) {
                queryGetPersonaActivaReemplazo = await getPersonaActiva(
                    {
                        strEmail: this.#objData.strReemplazo,
                    },
                    process.env.TOKEN_SYSTEM
                );

                if (
                    queryGetPersonaActivaReemplazo.error ||
                    !queryGetPersonaActivaReemplazo.data
                ) {
                    this.#objResult = {
                        ...this.#objResult,
                        msg: `La solicitud #${
                            this.#objSolicitudActual.intId
                        } fue aprobada con éxito, sin embargo, no fue posible enviar las notificaciones por correo electrónico debido a un error en el servicio de persona activa.`,
                    };

                    return;
                }
            }

            if (!this.#objData.bitReemplazo) {
                queryGetMotivosNoReemplazo = await dao.getMotivosNoReemplazo({
                    intId: this.#objData.intIdNoReemplazo,
                });

                if (
                    queryGetMotivosNoReemplazo.error ||
                    !queryGetMotivosNoReemplazo.data
                ) {
                    this.#objResult = {
                        ...this.#objResult,
                        msg: `La solicitud #${
                            this.#objSolicitudActual.intId
                        } fue aprobada con éxito, sin embargo, no fue posible enviar las notificaciones por correo electrónico debido a un error en el servicio de obtención de datos de los motivos de no reemplazo.`,
                    };

                    return;
                }
            }
        }

        let objDataPersonaActivaAprobador =
            queryGetPersonaActivaAprobador.data[0];
        let objDataPersonaActivaSolicitante =
            queryGetPersonaActivaSolicitante.data[0];
        let objDataPersonaActivaReemplazo =
            queryGetPersonaActivaReemplazo?.data?.[0];
        let objMotivosNoReemplazo = queryGetMotivosNoReemplazo?.data?.[0];

        let strMsg;

        if (this.#objSolicitudActual.bitOperacion) {
            strMsg = `
            <p>El aprobador ${
                objDataPersonaActivaAprobador.strNombreCompleto
            }, identificado con ${
                objDataPersonaActivaAprobador.strtipoIdentificacion
            } - ${
                objDataPersonaActivaAprobador.strIdentificacion
            }, ha gestionado la solicitud de vacaciones con identificador #${
                this.#objSolicitudActual.intId
            }.</p>
            <br>

            <b>Información adicional: </b>
            <hr>
            <ul>
                <li>
                   <b>Observaciones: </b> ${this.#objData.strObservaciones}
                </li>
            </ul>

            <br>
    
            <p>Por favor diríjase al aplicativo de novedades para gestionar la solicitud.  </p>
            
            <a href="https://novedades.choucairtesting.com/novedades" > Link del aplicativo </a>
            <p>En caso de necesitar información adicional por favor comunícate con el área de nómina, al correo nomina@choucairtesting.com</p>
            `;
        } else {
            strMsg = `
            <p>El aprobador ${
                objDataPersonaActivaAprobador.strNombreCompleto
            }, identificado con ${
                objDataPersonaActivaAprobador.strtipoIdentificacion
            } - ${
                objDataPersonaActivaAprobador.strIdentificacion
            }, ha gestionado la solicitud de vacaciones con número #${
                this.#objSolicitudActual.intId
            }.</p>
            <br>

            ${
                this.#objData.strObservaciones &&
                `
            <b>Información adicional: </b>
            <hr>

            <ul>
                <li>Observaciones: </li>${this.#objData.strObservaciones}
            </ul>
            
            `
            }
    
            <p>Por favor diríjase al aplicativo de novedades para gestionar la solicitud.  </p>
            <a href="https://novedades.choucairtesting.com/novedades" > Link del aplicativo </a>
            <p>En caso de necesitar información adicional por favor comunícate con el área de nómina, al correo nomina@choucairtesting.com</p>
            `;
        }

        let htmlMsg = plantillaCorreo({ msg: strMsg });
        let querySendEmail;
        let strEmailTo;

        if (typeof this.#objSolicitudActual.arrAprobadores === "object") {
            strEmailTo =
                this.#objSolicitudActual.arrAprobadores[0].strAprobador;
        }

        querySendEmail = await sendEmail(
            {
                from: "portales@choucairtesting.com",
                cc:
                    this.#objData.intIdEstado === 4
                        ? `nomina@choucairtesting.com;${strEmailTo}`
                        : strEmailTo,
                to: this.#objSolicitudActual.strSolicitante,
                subject: `Gestión de la Solicitud de Vacaciones - ${objDataPersonaActivaSolicitante.strNombreCompleto}`,
                message: htmlMsg,
            },
            process.env.TOKEN_SYSTEM
        );

        if (querySendEmail.error) {
            this.#objResult = {
                ...this.#objResult,
                msg: `La solicitud #${
                    this.#objSolicitudActual.intId
                } fue aprobada con éxito, sin embargo, no fue posible enviar las notificaciones por correo electrónico debido a un error en el servicio de mensajeria.`,
            };

            return;
        }
    }

    async #rollbackTransaction() {
        try {
            let dao = new classInterfaceDAOSolicitudes();

            let query = await dao.updateSolicitud(this.#objSolicitudActual);

            if (query.error) {
                throw new Error(query.msg);
            }

            this.#objResult = {
                error: true,
                msg: "La aprobación de la solicitud ha fallado, se devolvieron los cambios efectuados en el sistema, por favor contacta al área de TI para más información.",
            };
        } catch (error) {
            this.#objResult = {
                error: true,
                msg: error.message,
            };
        }
    }
}

module.exports = setAprobacionSolicitudVacaciones;
