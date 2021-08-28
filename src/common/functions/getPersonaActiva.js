const axios = require("axios").default;

const sendEmail = async ({ strEmail, strArea, strUEN }, token) => {
    return await axios({
        method: "GET",
        baseURL: `${process.env.DATALAKE_PROTOCOL}://${process.env.DATALAKE_HOST}${process.env.DATALAKE_PORT}`,
        url: `${process.env.DATALAKE_PERSONACTIVA_GETPERSONACTIVA}`,
        headers: {
            token,
        },
        params: {
            strEmail,
            strArea,
            strUEN,
        },
    })
        .then((res) => {
            if (res.data.error) {
                throw new Error(res.data.msg);
            }

            let { data } = res.data;

            return {
                error: false,
                data,
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

module.exports = sendEmail;
