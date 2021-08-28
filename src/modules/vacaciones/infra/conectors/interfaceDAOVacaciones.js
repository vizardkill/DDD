//Importacion de clases
const classDaoSQL = require("../repository/daoVacaciones");

class interfaceDAOVacaciones {
    async getPasivoVacacional(data) {
        const dao = new classDaoSQL();
        let result = await dao.getDiasVacaciones(data);
        return result;
    }
}

module.exports = interfaceDAOVacaciones;
