require("dotenv").config();
const { expect } = require("chai");

/**
 * Test a los endpoints de las solicitudes
 */
describe("Pruebas unitarias al Domino de Vacaciones", () => {
    const dataUser = {
        strNombre: "Snayder",
        strApellidos: "Londoño Gallego ",
        strEmail: "slondonog@choucairtesting.com",
        strUsuario: "slondonog",
        strCargo: "ANALISTA DE SOLUCIONES ",
        strArea: "TI ",
        strRolApp: [],
        strCcosto: "1101000000",
        strUEN: null,
        strPaisNomina: "COLOMBIA",
        strCiudadNomina: "MEDELLIN",
        iat: 1626963121,
        exp: 1626984721,
    };

    it("GET /novedades/api/getDiasVacaciones (servicio de pasivo vacacional)  ", async () => {
        const serviceGetDiasPasivoVacacional = require("../modules/vacaciones/domain/getDiasPasivoVacacional.service");
        let result = await serviceGetDiasPasivoVacacional(dataUser.strEmail);

        expect(result).to.have.property("error", false);
        expect(result.data).to.have.property("strEmail");
        expect(result.data).to.have.property("Dias");
        expect(result.data).to.have.property("strFechaCorte");
    });

    it("GET /novedades/api/getFechasVacaciones (servicio que calcula las fechas de fin y reingreso)  ", async () => {
        const serviceGetFechasVacaciones = require("../modules/vacaciones/domain/getFechasVacaciones.service");
        let strPaisNomina = dataUser.strPaisNomina;
        let dtFechaInicio = "2021-08-02";
        let intNumeroDiasDisfrutar = 5;

        let result = await serviceGetFechasVacaciones(
            strPaisNomina,
            dtFechaInicio,
            intNumeroDiasDisfrutar,
            dataUser
        );

        expect(result).to.have.property("error", false);
        expect(result.data).to.have.property("dtFechaFin", "2021-08-06");
        expect(result.data).to.have.property("dtFechaReingreso", "2021-08-09");
    });
});
