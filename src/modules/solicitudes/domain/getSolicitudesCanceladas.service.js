//librerias
const validator = require("validator").default;
//classes
const classInterfaceDAOSolicitudes = require("../infra/conectors/interfaceDAOSolicitudes");

const getSolicitudesCanceladas = async (objParams, strDataUser) => {
    //Validaciones de reglas de negocio
    let {
        intId,
        strResponsable,
        dtFechaCreacion,
        intIdSolicitud,
        intIdEstado,
        intIdMotivoCancelacion,
        isAdmin,
    } = objParams;

    if (!strResponsable && !strDataUser) {
        throw new Error("Se esperaban parámetros de búsqueda.");
    }

    if (strResponsable) {
        if (
            !validator.isEmail(strResponsable, {
                domain_specific_validation: "choucairtesting.com",
            })
        ) {
            throw new Error("El correo ingresado contiene un dominio no valido");
        }
    }

    //**************************** Constula de Datos  **********************/
    let query = {
        intId: intId || null,
        strResponsable: strResponsable
            ? strResponsable
            : isAdmin === "true"
            ? null
            : strDataUser.strEmail,
        dtFechaCreacion: dtFechaCreacion || null,
        intIdSolicitud: intIdSolicitud || null,
        intIdEstado: intIdEstado || null,
        intIdMotivoCancelacion: intIdMotivoCancelacion || null,
    };

    let dao = new classInterfaceDAOSolicitudes();
    let result = await dao.getSolicitudesCanceladas(query);

    return result;
};

module.exports = getSolicitudesCanceladas;
