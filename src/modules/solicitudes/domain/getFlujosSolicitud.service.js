//librerias
const validator = require("validator").default;

//classes
const classInterfaceDAOSolicitudes = require("../infra/conectors/interfaceDAOSolicitudes");

const getFlujosSolicitud = async (objParams, strDataUser) => {
    //Validaciones de reglas de negocio
    let { intIdFlujo, strResponsable, intIdSolicitud } = objParams;

    if (!intIdFlujo && !intIdSolicitud) {
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
        intIdFlujo: intIdFlujo || null,
        strResponsable: strResponsable || null,
        intIdSolicitud: intIdSolicitud || null,
    };

    let dao = new classInterfaceDAOSolicitudes();
    let result = await dao.getFlujosSolicitud(query);

    return result;
};
module.exports = getFlujosSolicitud;
