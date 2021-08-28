//librerias
const Ajv = require("ajv");
const addFormats = require("ajv-formats");
const { format, compareAsc, parseISO, isWeekend } = require("date-fns");
const validator = require("validator").default;

//Classes
const classInterfaceDAOSolicitudes = require("../infra/conectors/interfaceDAOSolicitudes");
const classHolidays = require("date-holidays");

//Servicios
const servicePasivoVacacional = require("../../vacaciones/domain/getDiasPasivoVacacional.service");
const serviceGetFechasVacaciones = require("../../vacaciones/domain/getFechasVacaciones.service");
const serviceGetFechaPago = require("./getFechasPago.service");
const serviceGetSolicitudes = require("./getSolicitudes.service");

//Funciones
const getClienteColAsignado = require("../../../common/functions/getClienteColAsignado");
const getPersonaActiva = require("../../../common/functions/getPersonaActiva");
const sendEmail = require("../../../common/functions/sendEmail");
const plantillaCorreo = require("../app/functions/plantillaCorreo");

//Modelo
const model = require("./models/mdl_setSolicitudVacaciones");

/**
 * @class setSolicitudVacaciones
 *
 * La clase se encarga de realizar las respectivas validaciones y transformaciones para crear una solicitud.
 *
 * @author Santiago Cardona Saldarriaga <scardonas@choucairtesting.com>
 *
 * La clase requiere los siguientes modulos para su funcionamiento:
 *
 * @requires npm:date-fns
 * @requires npm:ajv
 * @requires npm:ajv-formats
 * @requires npm:ajv-errors
 * @requires module:../../vacaciones/domain/getDiasPasivoVacacional.service
 */
class setSolicitudVacaciones {
    #objData;
    #objUser;
    #objResult;
    #intIdSolicitud;
    #intPasivoVacacional;

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
        await this.#getPasivoVacacional();
        await this.#completeData();
        await this.#schemaValidation();
        await this.#validations();
        await this.#setSolicitud();
        await this.#setAprobadores();
        await this.#setFlujoSolicitud();
        await this.#setAuditoria();
        await this.#sendEmail();
        return this.#objResult;
    }

    /**
     * la función `validations` se encarga de validar todos las reglas de negocio correspondientes.
     */
    async #validations() {
        /**
         * Declaración de variables
         *
         * En esta sección se declaran variables de apoyo que seran utilizadas por la función
         */
        let bitFechaMayorIgual;
        let holidays;
        let bitFestivo;
        let bitFinDeSemana;
        let dtFechaInicio = parseISO(this.#objData.dtFechaInicio);
        let dtFechaFin = parseISO(this.#objData.dtFechaFin);
        let dtFechaReingreso = parseISO(this.#objData.dtFechaReingreso);
        let queryGetFechaPago;
        let queryGetSolicitudes;

        if (!this.#objData) {
            throw new Error("Se esperaban parámetros de entrada.");
        }

        if (!this.#objUser) {
            throw new Error("Se esperaba la información del usuario.");
        }

        let objParams = {
            strEmailColaborador: this.#objData.strSolicitante,
        };
        queryGetSolicitudes = await serviceGetSolicitudes(objParams);

        if (queryGetSolicitudes.data) {
            let solicitudAprove;
            for (let i = 0; i < queryGetSolicitudes.data.length; i++) {
                if (queryGetSolicitudes.data[i].intIdEstado === 4) {
                    solicitudAprove = queryGetSolicitudes.data[i]
                }
            }

            bitFechaMayorIgual = compareAsc(solicitudAprove?.dtFechaFin, dtFechaInicio);

            if (bitFechaMayorIgual >= 0) {
                throw new Error(
                    "No es posible crear la solicitud. Ya existe una solicitud aprobada cuyas fechas se sobreponen con las fechas configuradas para la nueva solicitud."
                ); 
            }

            for (let i = 0; i < queryGetSolicitudes.data.length; i++) {
                if (
                    queryGetSolicitudes.data[i].intIdEstado ===
                        this.#objData.intIdEstado ||
                    queryGetSolicitudes.data[i].intIdEstado === 3
                ) {
                    throw new Error(
                        "No puede existir más de una solicitud ABIERTA o EN PROCESO para un colaborador."
                    );
                }
            }
            
        }

        queryGetFechaPago = await serviceGetFechaPago(
            null,
            this.#objData.dtFechaInicio,
            new Date(),
            this.#objUser
        );

        if (queryGetFechaPago.error) {
            throw new Error(queryGetFechaPago.msg);
        }

        holidays = new classHolidays(
            this.#objData?.strPaisNomina?.substring(0, 2) ||
                this.#objUser?.strPaisNomina?.substring(0, 2)
        );

        if (this.#intPasivoVacacional < this.#objData.intNumeroDiasDisfrutar) {
            throw new Error(
                "No dispones de los suficientes días de pasivo vacacional para disfrutar."
            );
        }

        bitFestivo = holidays.isHoliday(dtFechaInicio);

        if (bitFestivo) {
            throw new Error("La fecha de inicio no puede ser un día feriado.");
        }

        bitFinDeSemana = isWeekend(dtFechaInicio);

        if (bitFinDeSemana) {
            throw new Error(
                "La fecha de inicio no puede ser un fin de semana."
            );
        }

        bitFechaMayorIgual = compareAsc(dtFechaFin, dtFechaInicio);

        if (bitFechaMayorIgual < 0) {
            throw new Error(
                "La fecha fin debe ser mayor o igual a la fecha de inicio."
            );
        }

        bitFechaMayorIgual = compareAsc(dtFechaReingreso, dtFechaFin);

        if (bitFechaMayorIgual < 0) {
            throw new Error(
                "La fecha de reingreso debe ser mayor a la fecha fin."
            );
        }

        if (
            this.#objData.intNumeroDiasCompensar >
            this.#objData.intNumeroDiasDisfrutar
        ) {
            throw new Error(
                "Los días para compensar deben ser menores a los días a disfrutar."
            );
        }

        if (!this.#objData.bitOperacion) {
            if (!this.#objData.arrAprobadores) {
                throw new Error("El aprobador es requerido.");
            }

            if (this.#objData.arrAprobadores === this.#objUser.strEmail) {
                throw new Error("No puedes aprobar tu propia solicitud.");
            }

            if (
                !validator.isEmail(this.#objData.arrAprobadores, {
                    domain_specific_validation: "choucairtesting.com",
                })
            ) {
                throw new Error(
                    "El campo de aprobador contiene un formato no valido, debe ser de tipo email y pertenecer al domino choucairtesting.com."
                );
            }
        }
    }

    /**
     * la función `getPasivoVacacional`, se encarga de obtener el pasivo vacacional del usurio solicitante.
     */
    async #getPasivoVacacional() {
        let query = await servicePasivoVacacional(null, this.#objUser);

        if (query.error) {
            throw new Error(query.msg);
        }

        if (!query.data) {
            throw new Error(
                "No existen datos del pasivo vacacional del solicitante, contacte con el área de nomina para mayor información."
            );
        }

        this.#intPasivoVacacional = parseInt(query.data.Dias);
    }

    /**
     * la función `completeData` se encarga de rellenar la información faltante
     * y sobreescribiendo la información sensible, evitando asi que sea corrompida desde el cliente.
     */
    async #completeData() {
        let prevData = this.#objData;
        let aux_arrAprobadores = this.#objData.arrAprobadores;
        let dtFechaSistema = format(new Date(), "yyyy-MM-dd");

        let objFechasVacaciones = await serviceGetFechasVacaciones(
            null,
            this.#objData.dtFechaInicio,
            this.#objData.intNumeroDiasDisfrutar,
            this.#objUser
        );

        let {
            data: { dtFechaFin, dtFechaReingreso },
        } = objFechasVacaciones;

        if (typeof aux_arrAprobadores === "string") {
            if (aux_arrAprobadores === this.#objUser.strEmail) {
                throw new Error("No puedes aprobar tu propia solicitud.");
            }
        }

        if (this.#objData.bitOperacion) {
            let arrAprobadores = [];
            let queryGetClienteColAsignado = await getClienteColAsignado(
                this.#objUser.strEmail,
                process.env.TOKEN_SYSTEM
            );

            if (queryGetClienteColAsignado.error) {
                throw new Error(queryGetClienteColAsignado.msg);
            }

            let objCliente = queryGetClienteColAsignado.data;

            arrAprobadores.push({
                strEmailAprobador: objCliente.strGerenteServicio,
            });

            if (
                objCliente.strGerenteServicio !== "kospinar@choucairtesting.com"
            ) {
                arrAprobadores.push({
                    strEmailAprobador: "curibea@choucairtesting.com",
                });
            } else {
                arrAprobadores.push({
                    strEmailAprobador: "curibea@choucairtesting.com",
                });
            }

            aux_arrAprobadores = arrAprobadores;
        }

        let newData = {
            ...prevData,
            dtFechaFin,
            dtFechaReingreso,
            intNumeroDiasCompensar: parseInt(
                this.#objData.intNumeroDiasCompensar
            ),
            intNumeroDiasDisfrutar: parseInt(
                this.#objData.intNumeroDiasDisfrutar
            ),
            dtFechaSolicitud: dtFechaSistema,
            strSolicitante: this.#objUser.strEmail,
            intIdEstado: 1,
            intIdTipoSolicitud: 1,
            bitOperacion: this.#objUser.strArea === "OPERACION" ? true : false,
            arrAprobadores: aux_arrAprobadores,
        };

        this.#objData = newData;
    }

    /**
     * la función `schemaValidation` se encarga de la validación del modelo de objetos que debe recibir el servicio,
     * asi como tambien de la validación de campos obligatorios y validaciones comunes que estan fuera de las reglas de negocio.
     */
    async #schemaValidation() {
        const ajv = new Ajv({ allErrors: true });
        require("ajv-errors")(ajv);
        addFormats(ajv);

        const schema = ajv.compile(model);
        const bitValidSchema = schema(this.#objData);

        if (!bitValidSchema) {
            let arrErrors = schema.errors;

            for (let i = 0; i < arrErrors.length; i++) {
                let { message } = arrErrors[i];
                console.log(arrErrors[i]);
                throw new Error(message);
            }
        }
    }

    async #setSolicitud() {
        let dao = new classInterfaceDAOSolicitudes();

        let query = await dao.setSolicitud(this.#objData);

        if (query.error) {
            throw new Error(query.msg);
        }

        this.#intIdSolicitud = query.data.intId;

        this.#objResult = {
            error: query.error,
            data: query.data,
            msg: query.msg,
        };
    }

    async #setAprobadores() {
        let dao = new classInterfaceDAOSolicitudes();
        let query;

        if (typeof this.#objData.arrAprobadores === "string") {
            query = await dao.setAprobadores({
                intIdSolicitud: this.#intIdSolicitud,
                strAprobador: this.#objData.arrAprobadores,
            });

            if (query.error) {
                await this.#rollbackTransaction();
            }
        }

        if (typeof this.#objData.arrAprobadores === "object") {
            for (let i = 0; i < this.#objData.arrAprobadores.length; i++) {
                let { strEmailAprobador } = this.#objData.arrAprobadores[i];

                query = await dao.setAprobadores({
                    intIdSolicitud: this.#intIdSolicitud,
                    strAprobador: strEmailAprobador,
                });

                if (query.error) {
                    await this.#rollbackTransaction();
                }
            }
        }
    }

    async #setFlujoSolicitud() {
        let dao = new classInterfaceDAOSolicitudes();

        let query = await dao.setFlujoSolicitud({
            strResponsable: this.#objUser.strEmail,
            intIdSolicitud: this.#intIdSolicitud,
            dtFechaCreacion: new Date(),
            strObservaciones:
                "La solicitud fue enviada con éxito y está a la espera de ser revisada por sus respectivos aprobadores.",
            intIdEstado: 1,
        });

        if (query.error) {
            await this.#rollbackTransaction();
        }
    }

    async #setAuditoria() {
        let dao = new classInterfaceDAOSolicitudes();

        let query = await dao.setAuditoriaSolicitud({
            intIdSolicitud: this.#intIdSolicitud,
            strResponsable: this.#objUser.strEmail,
            dtFechaCreacion: new Date(),
            dtFechaInicio: this.#objData.dtFechaInicio,
            dtFechaFin: this.#objData.dtFechaFin,
            dtFechaReingreso: this.#objData.dtFechaReingreso,
            intNumeroDiasDisfrutar: this.#objData.intNumeroDiasDisfrutar,
            intNumeroDiasCompensar: this.#objData.intNumeroDiasCompensar,
            intIdEstado: this.#objData.intIdEstado,
            intIdTipoSolicitud: this.#objData.intIdTipoSolicitud,
            bitOperacion: this.#objData.bitOperacion,
            bitReemplazo: this.#objData.bitReemplazo,
            strReemplazo: this.#objData.strReemplazo,
            intIdNoReemplazo: this.#objData.intIdNoReemplazo,
            strObservaciones: "El usuario ha creado una nueva solicitud.",
        });

        if (query.error) {
            await this.#rollbackTransaction();
        }
    }

    async #sendEmail() {
        let queryGetPersonaActiva = await getPersonaActiva(
            {
                strEmail: this.#objUser.strEmail,
            },
            process.env.TOKEN_SYSTEM
        );

        let queryGetFechaPago = await serviceGetFechaPago(
            null,
            this.#objData.dtFechaInicio,
            new Date(),
            this.#objUser
        );
        let objFechaDePago = queryGetFechaPago.data.dtFechaDePago;
        let dtFechaAprobacion;
        let dtDiaInicio = this.#objData.dtFechaInicio.split("-");

        if (objFechaDePago.getDate() < dtDiaInicio[2]) {
            dtFechaAprobacion = format(objFechaDePago, "yyyy-MM-dd");
        } else {
            dtFechaAprobacion = this.#objData.dtFechaInicio;
        }

        if (queryGetPersonaActiva.error || !queryGetPersonaActiva.data) {
            console.log(queryGetPersonaActiva);

            this.#objResult = {
                ...this.#objResult,
                msg: `La solicitud fue registrada con éxito con #${
                    this.#intIdSolicitud
                }, sin embargo, no fue posible enviar las notificaciones por correo electrónico debido a un error en el servicio de persona activa.`,
            };

            return;
        }

        let objDataPersonaActiva = queryGetPersonaActiva.data[0];

        let strMsg = `
        <p>El colaborador ${
            objDataPersonaActiva.strNombreCompleto
        }, de la ciudad de ${
            objDataPersonaActiva.strCiudadNomina
        }, identificado con ${objDataPersonaActiva.strtipoIdentificacion} - ${
            objDataPersonaActiva.strIdentificacion
        }, ha realizado una solicitud de vacaciones con identificador #${
            this.#intIdSolicitud
        }.</p>
        <br>


        <b>Información de la solicitud: </b>
        <hr>

        <ul>
          <li>
              <b>Fecha de solicitud: </b> ${this.#objData.dtFechaSolicitud}
          </li>
          <li>
               <b>Fecha de inicio de las vacaciones: </b> ${
                   this.#objData.dtFechaInicio
               }
          </li>
          <li>
               <b>Fecha final de las vacaciones: </b> ${
                   this.#objData.dtFechaFin
               }
          </li>
          <li>
               <b>Fecha de reingreso a la compañia: </b> ${
                   this.#objData.dtFechaReingreso
               }
          </li>
          <li>
               <b>Número de días a disfrutar: </b> ${
                   this.#objData.intNumeroDiasDisfrutar
               }
          </li>
          <li>
               <b>Número de días a compensar: </b> ${
                   this.#objData.intNumeroDiasCompensar
               }
          </li>
          <li>
               <b>La solicitud debe ser aprobada antes de: </b> ${dtFechaAprobacion}
          </li>
        </ul>

        <br>
        
        <p>Por favor diríjase al aplicativo de novedades para gestionar la solicitud.  </p>
        <p>En caso de no ser aprobada la solicitud antes de la fecha indicada, la solicitud será rechazada automáticamente.</p>
        <a href="https://novedades.choucairtesting.com/novedades" > Link del aplicativo </a>
        <p>En caso de necesitar información adicional por favor comunícate con el área de nómina, al correo nomina@choucairtesting.com</p>
        `;

        let htmlMsg = plantillaCorreo({ msg: strMsg });
        let querySendEmail;
        let strEmailToAprobadores;

        if (typeof this.#objData.arrAprobadores === "string") {
            strEmailToAprobadores = this.#objData.arrAprobadores;
        }

        if (typeof this.#objData.arrAprobadores === "object") {
            strEmailToAprobadores =
                this.#objData.arrAprobadores[0].strEmailAprobador;
        }

        querySendEmail = await sendEmail(
            {
                from: "portales@choucairtesting.com",
                to: strEmailToAprobadores,
                cc: this.#objData.strSolicitante,
                subject: `Solicitud de Vacaciones - ${objDataPersonaActiva.strNombreCompleto}`,
                message: htmlMsg,
            },
            process.env.TOKEN_SYSTEM
        );

        if (querySendEmail.error) {
            this.#objResult = {
                ...this.#objResult,
                msg: `La solicitud fue registrada con éxito con #${
                    this.#intIdSolicitud
                }, sin embargo, no fue posible enviar las notificaciones por correo electrónico debido a un error en el servicio de mensajeria.`,
            };

            return;
        }
    }

    async #rollbackTransaction() {
        let dao = new classInterfaceDAOSolicitudes();

        let query = await dao.deleteSolicitud({
            intIdSolicitud: this.#intIdSolicitud,
        });

        this.#objResult = {
            error: true,
            msg: query.error
                ? query.msg
                : "El registro de la solicitud ha fallado, se devolvieron los cambios efectuados en el sistema, por favor contacta al área de TI para más información.",
        };
    }
}

module.exports = setSolicitudVacaciones;
