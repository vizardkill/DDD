const axios = require("axios").default;

const getClienteColAsignado = async (strColaborador, token) => {
    return await axios({
        method: "GET",
        baseURL: `${process.env.ASIGNACIONES_PROTOCOL}://${process.env.ASIGNACIONES_HOST}${process.env.ASIGNACIONES_PORT}`,
        url: `${process.env.ASIGNACIONES_MOVIMIENTOS_GETMOVIMIENTO}`,
        headers: {
            token,
        },
        params: {
            strColaborador,
            intTipoMovimiento: 1,
        },
    })
        .then((res) => {
            if (res.data.error) {
                throw new Error(res.data.msg);
            }

            let { intCliente } = res.data.data[0];

            return {
                error: false,
                data: intCliente,
            };
        })
        .catch((error) => {
            let msg;

            if (error.response) {
                msg = error.response.data.msg;
            } else if (error.request) {
                msg = error.message;
            } else {
                msg = error.message;
            }

            return {
                error: true,
                msg,
            };
        });
};

module.exports = getClienteColAsignado;
