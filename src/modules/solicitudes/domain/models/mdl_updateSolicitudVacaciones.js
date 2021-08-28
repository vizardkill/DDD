//Librerias
const { format, addDays } = require("date-fns");

//Variables
const dtFechaSistema = format(new Date(), "yyyy-MM-dd");
const dtFechaInicio = format(addDays(new Date(), 1), "yyyy-MM-dd");

/**
 *
 * El `schema` se encarga de validar el objeto que sera llevado a la base de datos.
 * El modelo se basa en el estandar `JSON Schema 7.0`, pede consultar más detalle en el siguiente link:
 *
 * {@link https://json-schema.org/understanding-json-schema/about.html JSONSchema}
 *
 *
 * @author Santiago Cardona Saldarriaga <scardonas@choucairtesting.com>
 */
const schema = {
    type: "object",
    properties: {
        intId: {
            type: "number",
            minimum: 1,
            errorMessage: {
                type: "El identificador de la solicitud debe ser númerico.",
                minimum: "El identificador de la solicitud no es valido.",
                required: "Se requiere el identificador de la solicitud.",
            },
        },
        strSolicitante: {
            type: "string",
            format: "email",
            errorMessage: {
                type: "El correo del solicitante debe ser de tipo string",
                format: "El correo del solicitante no es valido",
                required: "Se requiere el solicitante.",
            },
        },
        dtFechaInicio: {
            type: "string",
            format: "date",
            formatMinimum: dtFechaInicio,
            errorMessage: {
                type: "La fecha de inicio debe ser de tipo string",
                required: "Se requiere la fecha de inicio",
                format: "La fecha no posee un formato valido",
                formatMinimum: "La fecha de inicio es menor a la fecha del sistema",
            },
        },
        dtFechaFin: {
            type: "string",
            format: "date",
            formatMinimum: dtFechaInicio,
            errorMessage: {
                type: "La fecha fin debe ser de tipo string",
                required: "Se requiere la fecha fin",
                format: "La fecha no posee un formato valido",
                formatMinimum: "La fecha fin es menor a la fecha del sistema",
            },
        },
        dtFechaReingreso: {
            type: "string",
            formatMinimum: dtFechaInicio,
            format: "date",
            errorMessage: {
                type: "La fecha de reingreso debe ser de tipo string",
                required: "Se requiere la fecha de reingreso",
                format: "La fecha no posee un formato valido",
                formatMinimum: "La fecha de reingreso es menor a la fecha del sistema",
            },
        },
        intNumeroDiasDisfrutar: {
            type: "number",
            minimum: 3,
            errorMessage: {
                type: "El tipo de dato para el numero de dias a disfrutar no es valido.",
                required: "Se requiere un numero de días",
                minimum: "El numero de dias a disfrutar debe ser igual o mayor a 3",
            },
        },
        intNumeroDiasCompensar: {
            type: "number",
            minimum: 0,
            errorMessage: {
                type: "El tipo de dato para el numero de dias a compensar en dinero no es valido.",
                required: "Se requiere un numero de días",
                minimum: "El numero de dias a compensar debe ser igual o mayor a 0",
            },
        },
        intIdEstado: {
            type: "number",
            errorMessage: {
                type: "El tipo de dato para el estado no es valido",
                required: "Se requiere un identificador para el estado de la solicitud",
            },
        },
        intIdTipoSolicitud: {
            type: "number",
            errorMessage: {
                type: "El tipo de dato para el tipo de solicitud no es valido",
                required: "Se requiere un identificador para el tipo de solicitud",
            },
        },
        bitOperacion: {
            type: "boolean",
            errorMessage: {
                type: "El tipo de dato para identificar si es de la operación o no, no es valido.",
                required: "Se un identificador para el tipo de solicitud",
            },
        },
        bitPanama: {
            type: "boolean",
            errorMessage: {
                type: "El tipo de dato para identificar si el colaborador es de panama o no, no es valido.",
                required: "Se un identificador para el tipo de solicitud",
            },
        },
        bitReemplazo: {
            type: "boolean",
        },
        strReemplazo: {
            type: "string",
        },
        intIdNoReemplazo: {
            type: "number",
        },
        arrAprobadores: {
            type: ["string", "array"],
            errorMessage: {
                required: "Se requieren los aprobadores de la solicitud",
            },
        },
    },
    required: [
        "intId",
        "strSolicitante",
        "dtFechaInicio",
        "dtFechaFin",
        "dtFechaReingreso",
        "intNumeroDiasDisfrutar",
        "intNumeroDiasCompensar",
        "bitOperacion",
        "arrAprobadores",
    ],
    additionalProperties: false,
    errorMessage: {
        additionalProperties:
            "El servicio no admite propiedades adicionales, por favor escala al área de TI para más información.",
    },
};

module.exports = schema;
