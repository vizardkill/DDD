//librerias
const validator = require("validator").default;
//classes
const classInterfaceDAOSolicitudes = require("../infra/conectors/interfaceDAOSolicitudes");

const getSolicitudesCanceladasAprobador = async (objParams, strDataUser) => {
    //Validaciones de reglas de negocio
    let {
        intId,
        strAprobador,
        strResponsable,
        dtFechaCreacion,
        intIdSolicitud,
        intIdEstado,
        intIdMotivoCancelacion,
        isAdmin,
    } = objParams;

    if (!strAprobador && !strDataUser) {
        throw new Error("Se esperaban parámetros de búsqueda.");
    }

    if (strAprobador) {
        if (
            !validator.isEmail(strAprobador, {
                domain_specific_validation: "choucairtesting.com",
            })
        ) {
            throw new Error("El correo ingresado contiene un dominio no valido");
        }
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
        strAprobador: strAprobador ? strAprobador : isAdmin === 'true' ? null : strDataUser.strEmail,
        strResponsable: strResponsable || null,
        dtFechaCreacion: dtFechaCreacion || null,
        intIdSolicitud: intIdSolicitud || null,
        intIdEstado: intIdEstado || null,
        intIdMotivoCancelacion: intIdMotivoCancelacion || null,
    };

    let dao = new classInterfaceDAOSolicitudes();
    let result = await dao.getSolicitudesCanceladasAprobador(query);

    return result;
};

module.exports = getSolicitudesCanceladasAprobador;
