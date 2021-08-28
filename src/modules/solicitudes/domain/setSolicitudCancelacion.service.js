//Classes
const classInterfaceDAOSolicitudes = require("../infra/conectors/interfaceDAOSolicitudes");

//Funciones
const getPersonaActiva = require("../../../common/functions/getPersonaActiva");
const sendEmail = require("../../../common/functions/sendEmail");
const plantillaCorreo = require("../app/functions/plantillaCorreo");

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
        await this.#setSolicitudCancelacion();
        await this.#updateSolicitud();
        await this.#setFlujoSolicitud();
        await this.#sendEmail();
        return this.#objResult;
    }

    async #getSolicitud() {
        let dao = new classInterfaceDAOSolicitudes();

        if (!this.#objData.intIdSolicitud) {
            throw new Error("Se esperaban parámetros de entrada.");
        }

        let query = await dao.getSolicitudes({
            intIdSolicitud: this.#objData.intIdSolicitud,
        });

        if (query.error) {
            throw new Error(query.msg);
        }

        if (!query.data) {
            throw new Error(
                `La solicitud con identificador #${
                    this.#objData.intIdSolicitud
                }, no existe, por favor verifica e intenta nuevamente.`
            );
        }

        this.#objSolicitudActual = query.data[0];
    }

    /**
     * la función `completeData` se encarga de rellenar la información faltante
     * y sobreescribiendo la información sensible, evitando asi que sea corrompida desde el cliente.
     */
    async #completeData() {
        let newData = {
            strResponsable: this.#objUser.strEmail,
            dtFechaCreacion: new Date(),
            strObservaciones: this.#objData.strObservaciones,
            intIdSolicitud: this.#objData.intIdSolicitud,
            intIdEstado: this.#objSolicitudActual.strEstado === "ABIERTO" ? 4 : 1,
            intIdMotivoCancelacion: this.#objData.intIdMotivoCancelacion,
        };

        this.#objData = newData;
    }

    async #validations() {
        let strEstadoSolicitud = this.#objSolicitudActual.strEstado;
        let service = new classInterfaceDAOSolicitudes();
        let query = await service.getSolicitudesCanceladas({
            intIdSolicitud: this.#objData.intIdSolicitud,
        });

        if (query.error) {
            throw new Error(query.msg);
        }

        if (query.data) {
            throw new Error(
                `La solicitud #${
                    this.#objData.intIdSolicitud
                }, ya tiene asociada una solicitud de cancelación, revisa las solicitudes canceladas o comunícate con el área de TI para más información.`
            );
        }

        if (strEstadoSolicitud === "CANCELADO") {
            throw new Error(
                `La solicitud no puede ser cancelada debido a que se encuentra en el estado: ${strEstadoSolicitud}, comunícate con el área de nómina para más información.`
            );
        }

        if (!this.#objData.intIdSolicitud) {
            throw new Error("Se esperaban parámetros de entrada.");
        }
    }

    async #setSolicitudCancelacion() {
        let dao = new classInterfaceDAOSolicitudes();

        let query = await dao.setCancelacionSolicitud(this.#objData);

        if (query.error) {
            throw new Error(query.msg);
        }

        this.#objResult = {
            error: query.error,
            data: query.data,
            msg: query.msg,
        };
    }

    async #updateSolicitud() {
        let dao = new classInterfaceDAOSolicitudes();

        let query = await dao.updateSolicitud({
            intId: this.#objData.intIdSolicitud,
            intIdEstado: this.#objSolicitudActual.strEstado === "ABIERTO" ? 2 : null,
        });

        if (query.error) {
            await this.#rollbackTransaction();
        }
    }

    async #setFlujoSolicitud() {
        let dao = new classInterfaceDAOSolicitudes();

        if (this.#objSolicitudActual.strEstado === "ABIERTO") {
            let query = await dao.setFlujoSolicitud({
                strResponsable: this.#objUser.strEmail,
                intIdSolicitud: this.#objData.intIdSolicitud,
                dtFechaCreacion: new Date(),
                strObservaciones: `La solicitud fue cancelada de forma automática por el colaborador, si desea más información consulta la solicitud de cancelación con el identificador #${
                    this.#objResult.data.intId
                }.`,
                intIdEstado: 2,
            });

            if (query.error) {
                await this.#rollbackTransaction();
            }
        }
    }

    async #sendEmail() {
        let dao = new classInterfaceDAOSolicitudes();
        let queryGetPersonaActivaSolicitante;
        let queryGetMotivosCancelacion;

        queryGetPersonaActivaSolicitante = await getPersonaActiva(
            {
                strEmail: this.#objUser.strEmail,
            },
            process.env.TOKEN_SYSTEM
        );

        if (
            queryGetPersonaActivaSolicitante.error ||
            !queryGetPersonaActivaSolicitante.data
        ) {
            this.#objResult = {
                ...this.#objResult,
                msg: `Se solicito la cancelación de la solicitud #${
                    this.#objSolicitudActual.intId
                } con éxito, sin embargo, no fue posible enviar las notificaciones por correo electrónico debido a un error en el servicio de persona activa.`,
            };

            return;
        }

        queryGetMotivosCancelacion = await dao.getMotivosCancelacion({
            intId: this.#objData.intIdMotivoCancelacion,
        });

        if (queryGetMotivosCancelacion.error || !queryGetMotivosCancelacion.data) {
            this.#objResult = {
                ...this.#objResult,
                msg: `Se solicito la cancelación de la solicitud #${
                    this.#objSolicitudActual.intId
                } con éxito, sin embargo, no fue posible enviar las notificaciones por correo electrónico debido a un error en el servicio de obtención de datos de los motivos de cancelación.`,
            };

            return;
        }

        let objDataPersonaActivaSolicitante = queryGetPersonaActivaSolicitante.data[0];
        let objMotivosCancelacion = queryGetMotivosCancelacion.data[0];

        let strMsg = `
        <p>El colaborador ${
            objDataPersonaActivaSolicitante.strNombreCompleto
        }, identificado con ${objDataPersonaActivaSolicitante.strtipoIdentificacion} - ${
            objDataPersonaActivaSolicitante.strIdentificacion
        }, ha solicitado la cancelación de la solicitud de vacaciones #${
            this.#objSolicitudActual.intId
        }.</p>
        <br>

        <b>Información de la solicitud de cancelación: </b>
        <hr>

        <ul>
          <li>
             <b>Número de registro de cancelación: </b> ${this.#objResult.data.intId}
          </li>

          <li>
              <b>Motivo de la cancelación: </b> ${objMotivosCancelacion.strNombre}
          </li>

          ${
              this.#objData.strObservaciones &&
              `
          <li>
              <b>Observaciones: </b> ${this.#objData.strObservaciones}
          </li>
          `
          }

        </ul>

        <br>

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
                to: strEmailTo,
                cc: this.#objSolicitudActual.strSolicitante,
                subject: `Cancelación de la Solicitud de Vacaciones - ${objDataPersonaActivaSolicitante.strNombreCompleto}`,
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

            query = await dao.deleteSolicitudCancelacion({
                intIdSolicitud: this.#objData.intIdSolicitud,
            });

            if (query.error) {
                throw new Error(query.msg);
            }

            this.#objResult = {
                error: true,
                msg: "La solicitud de cancelación ha fallado, se devolvieron los cambios efectuados en el sistema, por favor contacta al área de TI para más información.",
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
