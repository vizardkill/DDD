//librerias
const { format, addDays, isWeekend, parseISO } = require("date-fns");
const validator = require("validator").default;

//clases
const classHolidays = require("date-holidays");

const getFechasVacaciones = async (
    strPaisNomina,
    dtFechaInicio,
    intNumeroDiasDisfrutar,
    strDataUser
) => {
    /** Declaración de variables */
    let aux_strPaisNomina;
    let dtFechaReingreso;
    let dtFechaFin = parseISO(dtFechaInicio);
    let aux_intNumeroDiasDisfrutar = parseInt(intNumeroDiasDisfrutar);

    /**
     * Se realizan validaciones basicas para el consumo del servicio.
     */
    if (
        (!strPaisNomina && !strDataUser) ||
        !dtFechaInicio ||
        !aux_intNumeroDiasDisfrutar
    ) {
        throw new Error("Se esperaban parámetros de búsqueda.");
    }
    
    aux_strPaisNomina = strPaisNomina || strDataUser.strPaisNomina;

    if (!aux_strPaisNomina) {
        throw new Error(
            "El servicio esperaba el país asociado al colaborador, sin embargo no se recibieron datos."
        );
    }

    if (!validator.isDate(dtFechaFin)) {
        throw new Error("La fecha de inicio no contiene un formato valido > YYYY-MM-dd");
    }

    /**
     * Para el caso de `COLOMBIA` el servicio buscara encontrar la fecha fin de vacaciones,
     * siempre y cuando no sean festivos ni fines de semana.
     */
    if (aux_strPaisNomina === "COLOMBIA") {
        let holidays = new classHolidays("CO");

        let bitFestivo = holidays.isHoliday(dtFechaFin);
        let bitFinSemana = isWeekend(dtFechaFin);
        let intContador = 1;

        /**
         * En caso de que los dias a descansar sean mayores que 1
         * el sistema entrara a validar por cada dia que pase si es festivo o es un fin de semana
         */
        while (intContador < aux_intNumeroDiasDisfrutar) {
            dtFechaFin = addDays(dtFechaFin, 1);

            bitFestivo = holidays.isHoliday(dtFechaFin);
            bitFinSemana = isWeekend(dtFechaFin);

            while (bitFestivo !== false || bitFinSemana !== false) {
                dtFechaFin = addDays(dtFechaFin, 1);

                bitFestivo = holidays.isHoliday(dtFechaFin);
                bitFinSemana = isWeekend(dtFechaFin);
            }

            intContador++;
        }

        /**
         * Cuando el sistema salga de la validaciones por cada debera validar si el ultimo dia
         * tambien seria un fin de semana o un festivo, en caso de ser asi el sistema nuevamente
         * aumentara los dias finales hasta encontrar una fecha habil
         */
        if (intContador === aux_intNumeroDiasDisfrutar) {
            bitFestivo = holidays.isHoliday(dtFechaFin);
            bitFinSemana = isWeekend(dtFechaFin);

            while (bitFestivo !== false || bitFinSemana !== false) {
                dtFechaFin = addDays(dtFechaFin, 1);

                bitFestivo = holidays.isHoliday(dtFechaFin);
                bitFinSemana = isWeekend(dtFechaFin);
            }
        }

        /**
         * Una vez encontrada la fecha final de las vacaciones, el sistema buscara la fecha habil para
         * ingresar nuevamente a la compañia
         */
        dtFechaReingreso = addDays(dtFechaFin, 1);

        bitFinSemana = isWeekend(dtFechaReingreso);
        bitFestivo = holidays.isHoliday(dtFechaReingreso);

        while (bitFinSemana !== false || bitFestivo !== false) {
            dtFechaReingreso = addDays(dtFechaReingreso, 1);

            bitFinSemana = isWeekend(dtFechaReingreso);
            bitFestivo = holidays.isHoliday(dtFechaReingreso);
        }
    } else {
        /**
         * Para el caso de `PERU` o `PANAMA` el servicio buscara encontrar la fecha fin de las vacaciones,
         * tomando en cuenta unicamente el numero de dias a disfrutar
         *
         */
        let holidays = new classHolidays(aux_strPaisNomina === "PERU" ? "PE" : "PA");
        let intContador = 1;

        while (intContador < aux_intNumeroDiasDisfrutar) {
            dtFechaFin = addDays(dtFechaFin, 1);
            intContador++;
        }

        dtFechaReingreso = addDays(dtFechaFin, 1);

        bitFinSemana = isWeekend(dtFechaReingreso);
        bitFestivo = holidays.isHoliday(dtFechaReingreso);

        if (bitFinSemana || bitFestivo) {
            let aux_dtFechaReingreso = dtFechaReingreso;

            while (bitFinSemana !== false || bitFestivo !== false) {
                aux_dtFechaReingreso = addDays(aux_dtFechaReingreso, 1);

                bitFinSemana = isWeekend(aux_dtFechaReingreso);
                bitFestivo = holidays.isHoliday(aux_dtFechaReingreso);

                intContador++;
            }

            throw new Error(
                `Lo sentimos, la fecha de reingreso: ${format(
                    dtFechaReingreso,
                    "yyyy-MM-dd"
                )}, cae en un día feriado o fin de semana, deberas sacar minimamente ${intContador} días, para poder disfrutar de tus vacaciones.`
            );
        }
    }

    dtFechaFin = format(dtFechaFin, "yyyy-MM-dd");
    dtFechaReingreso = format(dtFechaReingreso, "yyyy-MM-dd");

    let result = {
        error: false,
        data: {
            dtFechaFin,
            dtFechaReingreso,
        },
    };

    return result;
};

module.exports = getFechasVacaciones;
