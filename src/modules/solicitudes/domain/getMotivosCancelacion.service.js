//classes
const classInterfaceDAOSolicitudes = require("../infra/conectors/interfaceDAOSolicitudes");

const getMotivosCancelacion = async (objParams) => {
    //Validaciones de reglas de negocio
    let { intId, strNombre, intIdTipoSolicitud } = objParams;

    //**************************** Constula de Datos  **********************/
    let query = {
        intId,
        strNombre,
        intIdTipoSolicitud,
    };

    let dao = new classInterfaceDAOSolicitudes();
    let result = await dao.getMotivosCancelacion(query);

    return result;
};

module.exports = getMotivosCancelacion;
