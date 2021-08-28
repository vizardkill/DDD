//Classes
const classInterfaceDAOSolicitudes = require("../infra/conectors/interfaceDAOSolicitudes");

//Funciones
const getPersonaActiva = require("../../../common/functions/getPersonaActiva");
const sendEmail = require("../../../common/functions/sendEmail");
const plantillaCorreo = require("../app/functions/plantillaCorreo");

class setRechazoSolicitudVacaciones {
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

        let query = await dao.getSolicitudes({ intIdSolicitud: this.#objData.intId });

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

        if (strEstadoSolicitud !== "ABIERTO" && strEstadoSolicitud !== "EN PROCESO") {
            throw new Error(
                `La solicitud no puede ser rechazada debido a que se encuentra en el estado: ${strEstadoSolicitud}, comunícate con el área de nómina para más información.`
            );
        }
    }

    /**
     * la función `completeData` se encarga de rellenar la información faltante
     * y sobreescribiendo la información sensible, evitando asi que sea corrompida desde el cliente.
     */
    async #completeData() {
        let dao = new classInterfaceDAOSolicitudes();
        let prevData = this.#objData;
        let intIdEstado = 5;

        let query = await dao.getFlujosSolicitud({ intIdSolicitud: this.#objData.intId });

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

        let newData = {
            ...prevData,
            intIdEstado,
        };

        this.#objData = newData;
    }

    async #updateSolicitud() {
        let dao = new classInterfaceDAOSolicitudes();

        let query = await dao.updateSolicitud({
            intId: this.#objData.intId,
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

            if (this.#objData.intIdEstado === 5) {
                strObservaciones = `La solicitud fue gestionada y RECHZADA con éxito. Observaciones adicionales: ${
                    this.#objData.strObservaciones
                }`;
            }
        } else {
            if (this.#objData.intIdEstado === 3) {
                strObservaciones = `La solicitud fue gestionada con éxito y se encuentra actualmente EN PROCESO debido a que falta la gestión de uno o más aprobadores.`;
            }

            if (this.#objData.intIdEstado === 5) {
                strObservaciones = `La solicitud fue gestionada y RECHAZADA con éxito.`;
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
        let queryGetPersonaActivaAprobador = await getPersonaActiva(
            {
                strEmail: this.#objUser.strEmail,
            },
            process.env.TOKEN_SYSTEM
        );

        let queryGetPersonaActivaSolicitante = await getPersonaActiva(
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

        let objDataPersonaActivaAprobador = queryGetPersonaActivaAprobador.data[0];
        let objDataPersonaActivaSolicitante = queryGetPersonaActivaSolicitante.data[0];

        let strMsg = `
        <p>El aprobador ${
            objDataPersonaActivaAprobador.strNombreCompleto
        }, identificado con ${objDataPersonaActivaAprobador.strtipoIdentificacion} - ${
            objDataPersonaActivaAprobador.strIdentificacion
        }, ha RECHAZADO la solicitud de vacaciones con identificador #${
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

        let htmlMsg = plantillaCorreo({ msg: strMsg });
        let querySendEmail;
        let strEmailTo;

        if (typeof this.#objSolicitudActual.arrAprobadores === "object") {
            strEmailTo = this.#objSolicitudActual.arrAprobadores[0].strAprobador
        }

        querySendEmail = await sendEmail(
            {
                from: "portales@choucairtesting.com",
                cc: `${strEmailTo}`,
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
                } fue rechazada con éxito, sin embargo, no fue posible enviar las notificaciones por correo electrónico debido a un error en el servicio de mensajeria.`,
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

module.exports = setRechazoSolicitudVacaciones;
