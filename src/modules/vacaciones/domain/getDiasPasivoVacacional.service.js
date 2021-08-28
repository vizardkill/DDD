//Librerias
const validator = require("validator").default;

//Classes
const classInterfaceDAOVacaciones = require("../infra/conectors/interfaceDAOVacaciones");

const getDiasVacaciones = async (strEmailColaborador, strDataUser) => {
    //Validaciones de reglas de negocio
    if (!strEmailColaborador && !strDataUser) {
        throw new Error("Se esperaban parámetros de busqueda.");
    }

    if (strEmailColaborador) {
        if (
            !validator.isEmail(strEmailColaborador, {
                domain_specific_validation: "choucairtesting.com",
            })
        ) {
            throw new Error("Correo ingresado contiene un dominio no valido");
        }
    }

    //**************************** Constula de Datos  **********************/
    let query = {
        strEmailColaborador: strEmailColaborador || strDataUser?.strEmail,
    };

    let dao = new classInterfaceDAOVacaciones();
    let result = await dao.getPasivoVacacional(query);

    if (result.error) {
        throw new Error(result.msg);
    }

    return result;
};

module.exports = getDiasVacaciones;
