const sql = require("mssql");
const { conexion } = require("../../../../common/config/confSQL_connectionServicios");

class daoVacaciones {
    async getDiasVacaciones(data) {
        try {
            let conn = await new sql.ConnectionPool(conexion).connect();
            let response = await conn
                .request()
                .input("pstrEmailColaborador", sql.VarChar, data.strEmailColaborador)
                .output("P_bitError", sql.Bit)
                .output("P_strMsg", sql.VarChar)
                .execute("usp_ConsultarDiasPendientes_Vac");

            if (response.output.P_bitError) {
                throw new Error(response.output.P_strMsg);
            }

            let result = {
                error: false,
                data: response.recordsets[0][0],
            };

            sql.close(conexion);

            return result;
        } catch (error) {
            let result = {
                error: true,
                msg:
                    error.message ||
                    "Error en el metodo getDiasVacaciones de la clase daoVacaciones",
            };

            sql.close(conexion);

            return result;
        }
    }
}

module.exports = daoVacaciones;
