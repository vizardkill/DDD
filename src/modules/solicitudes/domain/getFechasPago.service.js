//libredias
const {
    format,
    addDays,
    lastDayOfMonth,
    parseISO,
    isWeekend,
} = require("date-fns");
const validator = require("validator").default;

//classes
const classHolidays = require("date-holidays");

/**
 * El metodo Cacula las fechas de pago donde dentro de ellas no se pueden ni cancelar ni solicitar vacaciones dentro del mes que se cursa
 *
 * @author Snayder Londoño Gallego <slondonog@choucairtesting.com>
 *
 * @param {String} strPaisNomina - El parámetro se encarga de validar las fechas de acuerdo con el país donde este registrado el usuario en nomina
 * @param {Date} dtFechaInicio
 * @param {Object} strDataUser
 */
const getFechasPago = async (
    strPaisNomina,
    dtFechaInicio,
    dtFechaSistema,
    strDataUser
) => {
    /** Declaración de variables */
    let aux_strPaisNomina;
    let aux_dtFechaInicio = parseISO(dtFechaInicio);
    let dtFechaDePago;
    
    /**
     * Se realizan validaciones basicas para el consumo del servicio.
     */
    if ((!strPaisNomina && !strDataUser) || !dtFechaInicio) {
        throw new Error("Se esperaban parámetros de búsquedas");
    }

    aux_strPaisNomina = strPaisNomina || strDataUser.strPaisNomina;

    if (!aux_strPaisNomina) {
        throw new Error(
            "El servicio esperaba el país asociado al colaborador, sin embargo no se recibieron datos."
        );
    }

    if (!validator.isDate(dtFechaInicio)) {
        throw new Error(
            "La fecha de inicio no contiene un formato valido > YYYY-MM-dd"
        );
    }

    /**
     * Validacion para saber si el periodo del mes en el que se esta realizando la solicitud
     */
    let periodoPago;

    if (
        dtFechaSistema.getDate() <= 15 &&
        aux_dtFechaInicio.getDate() <= 15 &&
        aux_strPaisNomina !== "PERU"
    ) {
        periodoPago = true;
        dtFechaDePago = new Date(
            `${dtFechaSistema.getFullYear()}-${dtFechaSistema.getMonth() + 1}-1`
        );
        while (dtFechaDePago.getDate() < 15) {
            dtFechaDePago = addDays(dtFechaDePago, 1);
        }

        let holidays = new classHolidays(
            aux_strPaisNomina === "COLOMBIA" ? "CO" : "PA"
        );

        let bitFestivo = holidays.isHoliday(dtFechaDePago);
        let bitFinSemana = isWeekend(dtFechaDePago);
        let intContador = 1;

        let diasAContar = aux_strPaisNomina === "COLOMBIA" ? 4 : 8;

        while (intContador < diasAContar) {
            bitFestivo = holidays.isHoliday(dtFechaDePago);
            bitFinSemana = isWeekend(dtFechaDePago);

            while (bitFestivo !== false || bitFinSemana !== false) {
                dtFechaDePago = addDays(dtFechaDePago, -1);

                bitFestivo = holidays.isHoliday(dtFechaDePago);
                bitFinSemana = isWeekend(dtFechaDePago);
            }

            dtFechaDePago = addDays(dtFechaDePago, -1);
            intContador++;
        }
    } else {
        periodoPago = false;
        let dtFinDeMes =
            aux_strPaisNomina === "COLOMBIA"
                ? lastDayOfMonth(dtFechaSistema)
                : aux_strPaisNomina === "PERU"
                ? lastDayOfMonth(dtFechaSistema)
                : new Date(
                      `${dtFechaSistema.getFullYear()}-${
                          dtFechaSistema.getMonth() + 1
                      }-30`
                  );

        dtFechaDePago = dtFinDeMes;
        let holidays = new classHolidays(
            aux_strPaisNomina === "COLOMBIA"
                ? "CO"
                : aux_strPaisNomina === "PANAMA"
                ? "PA"
                : "PE"
        );

        let bitFestivo = holidays.isHoliday(dtFechaDePago);
        let bitFinSemana = isWeekend(dtFechaDePago);

        let intContador = 1;

        let diasAContar =
            aux_strPaisNomina === "COLOMBIA"
                ? 4
                : aux_strPaisNomina === "PANAMA"
                ? 8
                : 9;

        while (intContador < diasAContar) {
            bitFestivo = holidays.isHoliday(dtFechaDePago);
            bitFinSemana = isWeekend(dtFechaDePago);

            while (bitFestivo !== false || bitFinSemana !== false) {
                dtFechaDePago = addDays(dtFechaDePago, -1);

                bitFestivo = holidays.isHoliday(dtFechaDePago);
                bitFinSemana = isWeekend(dtFechaDePago);
            }
            dtFechaDePago = addDays(dtFechaDePago, -1);
            intContador++;
        }
    }

    if (
        dtFechaSistema.getMonth() === aux_dtFechaInicio.getMonth() &&
        aux_strPaisNomina !== "PERU"
    ) {
        if (
            (aux_strPaisNomina === "COLOMBIA" ||
                aux_strPaisNomina === "PANAMA") &&
            dtFechaSistema.getDate() <= aux_dtFechaInicio.getDate() &&
            periodoPago === true
        ) {
            let holidays = new classHolidays(
                aux_strPaisNomina === "COLOMBIA" ? "CO" : "PA"
            );

            let nextDiaHabil = new Date(
                `${dtFechaSistema.getFullYear()}-${
                    dtFechaSistema.getMonth() + 1
                }-1`
            );
            while (nextDiaHabil.getDate() < 16) {
                nextDiaHabil = addDays(nextDiaHabil, 1);
            }

            bitFestivo = holidays.isHoliday(nextDiaHabil);
            bitFinSemana = isWeekend(nextDiaHabil);

            while (bitFestivo !== false || bitFinSemana !== false) {
                nextDiaHabil = addDays(nextDiaHabil, 1);

                bitFestivo = holidays.isHoliday(nextDiaHabil);
                bitFinSemana = isWeekend(nextDiaHabil);
            }

            if (aux_dtFechaInicio.getDate() >= dtFechaDePago.getDate() && dtFechaSistema.getDate() >= dtFechaDePago.getDate()) {
                throw new Error(
                    `No puedes disfrutar de tus vacaciones cuando la fecha de inicio esta próxima a la fecha de pago de nómina, por favor, elige otra fecha para tus vacaciones, apartir del ${format(
                        nextDiaHabil,
                        "yyyy-MM-dd"
                    )}`
                );
            }
        }
    }

    let primerDiaPeru =
        aux_strPaisNomina === "COLOMBIA"
            ? 16
            : aux_strPaisNomina === "PANAMA"
            ? 16
            : 1;

    if (
        dtFechaSistema.getMonth() === aux_dtFechaInicio.getMonth() &&
        dtFechaSistema.getDate() >= primerDiaPeru
    ) {
        
        if (
            (aux_strPaisNomina === "COLOMBIA" ||
                aux_strPaisNomina === "PANAMA" ||
                aux_strPaisNomina === "PERU") &&
            periodoPago === false &&
            dtFechaSistema.getDate() <= aux_dtFechaInicio.getDate()
        ) {
            let holidays = new classHolidays(
                aux_strPaisNomina === "COLOMBIA"
                    ? "CO"
                    : aux_strPaisNomina === "PANAMA"
                    ? "PA"
                    : "PE"
            );

            let nextDiaHabil = lastDayOfMonth(dtFechaSistema);
            nextDiaHabil = addDays(nextDiaHabil, 1);

            bitFestivo = holidays.isHoliday(nextDiaHabil);
            bitFinSemana = isWeekend(nextDiaHabil);

            while (bitFestivo !== false || bitFinSemana !== false) {
                nextDiaHabil = addDays(nextDiaHabil, 1);

                bitFestivo = holidays.isHoliday(nextDiaHabil);
                bitFinSemana = isWeekend(nextDiaHabil);
            }

            if (aux_dtFechaInicio.getDate() >= dtFechaDePago.getDate() && dtFechaSistema.getDate() >= dtFechaDePago.getDate()) {
                throw new Error(
                    `No puedes disfrutar de tus vacaciones cuando la fecha de inicio esta próxima a la fecha de pago de nómina, por favor, elige otra fecha para tus vacaciones, a partir de ${format(
                        nextDiaHabil,
                        "yyyy-MM-dd"
                    )}`
                );
            }
        }
    }

    let result = {
        error: false,
        data: {
            dtFechaDePago,
        },
        msg: "Puedes disfrutar tus vacaciones dado a que la fecha de inicio no esta proximá a la fecha de pago de nómina.",
    };

    return result;
};

module.exports = getFechasPago;
