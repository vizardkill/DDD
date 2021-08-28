//classes
const classInterfaceDAOSolicitudes = require("../infra/conectors/interfaceDAOSolicitudes");

const deleteSolicitudCancelacion = async (objParams) => {
    //Validaciones de reglas de negocio
    let { intId } = objParams;

    if (!intId) {
        throw new Error("Se esperaban parámetros de entrada.");
    }

    //**************************** Constula de Datos  **********************/
    let query = {
        intId,
    };

    let dao = new classInterfaceDAOSolicitudes();
    let result = await dao.deleteSolicitudCancelacion(query);

    return result;
};

module.exports = deleteSolicitudCancelacion;
