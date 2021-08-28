const axios = require("axios").default;

const sendEmail = async ({ from, to, cc, subject, message }, token) => {
    return await axios({
        method: "POST",
        baseURL: `${process.env.DATALAKE_PROTOCOL}://${process.env.DATALAKE_HOST}${process.env.DATALAKE_PORT}`,
        url: `${process.env.DATALAKE_MENSAJERIA_SENDEMAIL}`,
        headers: {
            token,
        },
        data: {
            from,
            to,
            cc,
            subject,
            message,
        },
    })
        .then((res) => {
            if (res.data.error) {
                throw new Error(res.data.msg);
            }

            let { msg } = res.data;

            return {
                error: false,
                msg,
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
