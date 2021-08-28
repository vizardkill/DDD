//classes
const classInterfaceDAOSolicitudes = require("../infra/conectors/interfaceDAOSolicitudes");

const getMotivosNoReemplazo = async (objParams) => {
    //Validaciones de reglas de negocio
    let { intId, strNombre } = objParams;

    //**************************** Constula de Datos  **********************/
    let query = {
        intId,
        strNombre,
    };

    let dao = new classInterfaceDAOSolicitudes();
    let result = await dao.getMotivosNoReemplazo(query);

    return result;
};

module.exports = getMotivosNoReemplazo;
