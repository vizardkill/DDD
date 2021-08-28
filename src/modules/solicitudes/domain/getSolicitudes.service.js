//librerias
const validator = require("validator").default;
//classes
const classInterfaceDAOSolicitudes = require("../infra/conectors/interfaceDAOSolicitudes");

const getSolicitudes = async (objParams, strDataUser) => {
    //Validaciones de reglas de negocio
    let {
        strEmailColaborador,
        intIdSolicitud,
        intIdEstado,
        intIdTipoSolicitud,
        isAdmin,
    } = objParams;

    if (!strEmailColaborador && !strDataUser) {
        throw new Error("Se esperaban parámetros de búsqueda.");
    }

    if (strEmailColaborador) {
        if (
            !validator.isEmail(strEmailColaborador, {
                domain_specific_validation: "choucairtesting.com",
            })
        ) {
            throw new Error("El correo ingresado contiene un dominio no valido");
        }
    }

    //**************************** Constula de Datos  **********************/
    let query = {
        strEmailColaborador: strEmailColaborador
            ? strEmailColaborador
            : isAdmin === 'true'
            ? null
            : strDataUser.strEmail,
        intIdSolicitud: intIdSolicitud || null,
        intIdEstado: intIdEstado || null,
        intIdTipoSolicitud: intIdTipoSolicitud || null,
    };

    let dao = new classInterfaceDAOSolicitudes();
    let result = await dao.getSolicitudes(query);

    return result;
};
module.exports = getSolicitudes;
