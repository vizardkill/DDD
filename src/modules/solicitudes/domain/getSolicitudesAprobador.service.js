//librerias
const validator = require("validator").default;
//classes
const classInterfaceDAOSolicitudes = require("../infra/conectors/interfaceDAOSolicitudes");

const getSolicitudesAprobador = async (objParams, strDataUser) => {
    //Validaciones de reglas de negocio
    let {
        strEmailAprobador,
        strEmailColaborador,
        intIdSolicitud,
        intIdEstado,
        intIdTipoSolicitud,
    } = objParams;

    if (!strEmailAprobador && !strDataUser) {
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

    if (strEmailAprobador) {
        if (
            !validator.isEmail(strEmailAprobador, {
                domain_specific_validation: "choucairtesting.com",
            })
        ) {
            throw new Error("El correo ingresado contiene un dominio no valido");
        }
    }

    //**************************** Constula de Datos  **********************/
    let query = {
        strEmailAprobador: strEmailAprobador
            ? strEmailAprobador
            : strDataUser
            ? strDataUser.strEmail
            : null,
        strEmailColaborador: strEmailColaborador || null,
        intIdSolicitud: intIdSolicitud || null,
        intIdEstado: intIdEstado || null,
        intIdTipoSolicitud: intIdTipoSolicitud || null,
    };

    let dao = new classInterfaceDAOSolicitudes();
    let result = await dao.getSolicitudesAprobador(query);

    return result;
};
module.exports = getSolicitudesAprobador;
